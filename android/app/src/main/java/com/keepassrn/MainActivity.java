package com.keepassrn;

import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.yubico.yubikit.android.YubiKitManager;
import com.yubico.yubikit.android.transport.usb.UsbConfiguration;
import com.yubico.yubikit.android.transport.usb.UsbYubiKeyDevice;
import com.yubico.yubikit.core.YubiKeyDevice;
import com.yubico.yubikit.management.DeviceInfo;
import com.yubico.yubikit.management.ManagementSession;
import com.yubico.yubikit.yubiotp.Slot;
import com.yubico.yubikit.yubiotp.YubiOtpSession;

import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public class MainActivity extends ReactActivity {
    private YubiKitManager yubiKitManager;
    private final Map<YubiKeyDevice, List<DeviceOption>> availableDevices = new HashMap<>();

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "KeepassRn";
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
     * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
     * (Paper).
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new MainActivityDelegate(this, getMainComponentName());
    }

    public static class MainActivityDelegate extends ReactActivityDelegate {
        public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
            super(activity, mainComponentName);
        }

        @Override
        protected ReactRootView createRootView() {
            ReactRootView reactRootView = new ReactRootView(getContext());
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
            return reactRootView;
        }

        @Override
        protected boolean isConcurrentRootEnabled() {
            // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
            // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
            return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        yubiKitManager = new YubiKitManager(getApplicationContext());
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
                                this.addDevice(device, new DeviceOption(
                                        device,
                                        UUID.randomUUID().toString(),
                                        serialNumber,
                                        Slot.ONE
                                ));
                            }

                            if (otp.getConfigurationState().isConfigured(Slot.TWO)) {
                                this.addDevice(device, new DeviceOption(
                                        device,
                                        UUID.randomUUID().toString(),
                                        serialNumber,
                                        Slot.TWO
                                ));
                            }

                            device.setOnClosed(() -> {
                                Log.d("KeePassRN", String.format("setOnClosed %s", name));

                                availableDevices.remove(device);

                                emitDevicesChanged();
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

    @Override
    protected void onDestroy() {
        super.onDestroy();

        yubiKitManager.stopUsbDiscovery();
    }

    private void addDevice(YubiKeyDevice device, DeviceOption option) {
        if (!availableDevices.containsKey(device)) {
            availableDevices.put(device, new LinkedList<>());
        }

        Objects.requireNonNull(availableDevices.get(device)).add(option);

        emitDevicesChanged();
    }

    public Collection<DeviceOption> getAvailableDevices() {
        List<DeviceOption> options = new LinkedList<>();

        for (List<DeviceOption> deviceOptions : availableDevices.values()) {
            options.addAll(deviceOptions);
        }

        return options;
    }

    public DeviceOption findDevice(String uuid) {
        for (List<DeviceOption> deviceOptions : availableDevices.values()) {
            for (DeviceOption option : deviceOptions) {
                if (option.uuid.equals(uuid)) {
                    return option;
                }
            }
        }

        return null;
    }

    private void emitDevicesChanged() {
        emitEvent("onDevicesChanged", null);
    }

    private void emitEvent(String eventName, Object params) {
        ReactContext context = getReactInstanceManager().getCurrentReactContext();
        if (context == null) {
            return;
        }

        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    public static class DeviceOption {
        public final UsbYubiKeyDevice device;
        public final int serialNumber;
        public final Slot slot;
        public final String uuid;

        public DeviceOption(UsbYubiKeyDevice device, String uuid, int serialNumber, Slot slot) {
            this.device = device;
            this.serialNumber = serialNumber;
            this.slot = slot;
            this.uuid = uuid;
        }
    }
}
