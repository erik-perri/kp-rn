package com.keepassrn;

import com.yubico.yubikit.android.transport.usb.UsbYubiKeyDevice;
import com.yubico.yubikit.yubiotp.Slot;

public class HardwareKeyOption {
    public final UsbYubiKeyDevice device;
    public final int serialNumber;
    public final Slot slot;
    public final String id;
    public final boolean requiresTouch;

    public HardwareKeyOption(
            UsbYubiKeyDevice device,
            String id,
            int serialNumber,
            Slot slot,
            boolean requiresTouch
    ) {
        this.device = device;
        this.serialNumber = serialNumber;
        this.slot = slot;
        this.id = id;
        this.requiresTouch = requiresTouch;
    }
}
