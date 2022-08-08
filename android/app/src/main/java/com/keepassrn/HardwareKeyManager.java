package com.keepassrn;

import android.content.Context;
import android.util.Log;

import com.yubico.yubikit.android.YubiKitManager;
import com.yubico.yubikit.android.transport.usb.UsbConfiguration;
import com.yubico.yubikit.core.YubiKeyDevice;
import com.yubico.yubikit.management.DeviceInfo;
import com.yubico.yubikit.management.ManagementSession;
import com.yubico.yubikit.yubiotp.Slot;
import com.yubico.yubikit.yubiotp.YubiOtpSession;

import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

public class HardwareKeyManager {
    private final YubiKitManager yubiKitManager;
    private final Event changeEvent;
    private final Map<YubiKeyDevice, List<HardwareKeyOption>> availableDevices = new HashMap<>();

    public HardwareKeyManager(Context context, Event changeEvent) {
        this.changeEvent = changeEvent;
        yubiKitManager = new YubiKitManager(context);
    }

    public void startDiscovery() {
        yubiKitManager.startUsbDiscovery(new UsbConfiguration(), device -> {
            String name = device.getUsbDevice().getDeviceName();

            ManagementSession.create(device, result -> {
                try {
                    ManagementSession management = result.getValue();
                    DeviceInfo info = management.getDeviceInfo();

                    Integer serialNumber = info.getSerialNumber();
                    if (serialNumber == null) {
                        Log.d("KeePassRN", String.format(
                                "Skipping device without serial number %s",
                                name
                        ));
                        return;
                    }

                    YubiOtpSession.create(device, otpResult -> {
                        try {
                            YubiOtpSession otp = otpResult.getValue();

                            if (otp.getConfigurationState().isConfigured(Slot.ONE)) {
                                this.addDevice(device, new HardwareKeyOption(
                                        device,
                                        String.format(Locale.ENGLISH, "%d-%d", serialNumber, 1),
                                        serialNumber,
                                        Slot.ONE,
                                        checkRequiresTouch(otp, Slot.ONE)
                                ));
                            }

                            if (otp.getConfigurationState().isConfigured(Slot.TWO)) {
                                this.addDevice(device, new HardwareKeyOption(
                                        device,
                                        String.format(Locale.ENGLISH, "%d-%d", serialNumber, 2),
                                        serialNumber,
                                        Slot.TWO,
                                        checkRequiresTouch(otp, Slot.TWO)
                                ));
                            }

                            device.setOnClosed(() -> {
                                Log.d("KeePassRN", String.format("setOnClosed %s", name));

                                availableDevices.remove(device);

                                this.changeEvent.emit(null);
                            });
                        } catch (Exception e) {
                            Log.d("KeePassRN", String.format(
                                    "Caught Exception checking OTP settings of %s",
                                    name
                            ));
                            e.printStackTrace();
                        }
                    });
                } catch (Exception e) {
                    Log.d("KeePassRN", String.format(
                            "Caught Exception reading device info of %s",
                            name
                    ));
                    e.printStackTrace();
                }
            });
        });
    }

    public void stopDiscovery() {
        yubiKitManager.stopUsbDiscovery();
    }

    public Collection<HardwareKeyOption> getAvailableDevices() {
        List<HardwareKeyOption> options = new LinkedList<>();

        for (List<HardwareKeyOption> deviceOptions : availableDevices.values()) {
            options.addAll(deviceOptions);
        }

        return options;
    }

    public HardwareKeyOption findDevice(String id) {
        for (List<HardwareKeyOption> deviceOptions : availableDevices.values()) {
            for (HardwareKeyOption option : deviceOptions) {
                if (option.id.equals(id)) {
                    return option;
                }
            }
        }

        return null;
    }

    private boolean checkRequiresTouch(YubiOtpSession session, Slot slot) {
        try {
            session.calculateHmacSha1(slot, new byte[]{0x00}, null, false);
            return false;
        } catch (Exception e) {
            return true;
        }
    }

    private void addDevice(YubiKeyDevice device, HardwareKeyOption option) {
        if (!availableDevices.containsKey(device)) {
            availableDevices.put(device, new LinkedList<>());
        }

        Objects.requireNonNull(availableDevices.get(device)).add(option);

        this.changeEvent.emit(null);
    }
}
