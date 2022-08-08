package com.keepassrn;

import android.net.Uri;
import android.os.ParcelFileDescriptor;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.yubico.yubikit.yubiotp.Slot;
import com.yubico.yubikit.yubiotp.YubiOtpSession;

import org.signal.argon2.Argon2;
import org.signal.argon2.MemoryCost;
import org.signal.argon2.Type;
import org.signal.argon2.Version;

import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Collection;
import java.util.Locale;

public class KpHelperModule extends ReactContextBaseJavaModule {
    KpHelperModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "KpHelperModule";
    }

    @ReactMethod
    public void readFile(String uri, Promise promise) {
        try {
            ParcelFileDescriptor parcelDescriptor = getReactApplicationContext()
                    .getContentResolver()
                    .openFileDescriptor(Uri.parse(uri), "r");

            int dataSize = (int) parcelDescriptor.getStatSize();
            byte[] data = new byte[dataSize];

            FileDescriptor fileDescriptor = parcelDescriptor.getFileDescriptor();
            FileInputStream fileStream = new FileInputStream(fileDescriptor);

            int readBytes = fileStream.read(data);
            assert readBytes == dataSize;

            promise.resolve(getArrayFromBytes(data));
        } catch (IOException | AssertionError e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void transformAesKdfKey(
            ReadableArray key,
            ReadableArray seed,
            double iterations,
            Promise promise
    ) {
        try {
            byte[] keyBytes = getBytesFromArray(key);
            byte[] seedBytes = getBytesFromArray(seed);

            byte[] transformedBytes = KpHelper.transformAesKdfKey(
                    keyBytes,
                    seedBytes,
                    (int) iterations
            );

            promise.resolve(getArrayFromBytes(transformedBytes));
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void transformArgon2KdfKey(
            ReadableArray key,
            ReadableArray salt,
            double version, // 0x10, 0x13
            double type,  // 0 = 2D, 1 = 2ID
            double memory,
            double parallelism,
            double iterations,
            Promise promise
    ) {
        try {
            Argon2 argon2 = new Argon2.Builder(version == 0x13 ? Version.V13 : Version.V10)
                    .type(type == 0 ? Type.Argon2d : Type.Argon2id)
                    .memoryCost(MemoryCost.KiB((int) memory))
                    .parallelism((int) parallelism)
                    .iterations((int) iterations)
                    .build();

            byte[] keyBytes = getBytesFromArray(key);
            byte[] saltBytes = getBytesFromArray(salt);
            Argon2.Result result = argon2.hash(keyBytes, saltBytes);

            promise.resolve(getArrayFromBytes(result.getHash()));
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void hash(double algorithm, ReadableArray chunks, Promise promise) {
        try {
            byte[][] chunkArrays = new byte[chunks.size()][];

            for (int i = 0; i < chunks.size(); i++) {
                chunkArrays[i] = getBytesFromArray(chunks.getArray(i));
            }

            byte[] hash = KpHelper.hash((int) algorithm, chunkArrays);

            promise.resolve(getArrayFromBytes(hash));
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void hmac(double algorithm, ReadableArray key, ReadableArray chunks, Promise promise) {
        try {
            byte[][] chunkArrays = new byte[chunks.size()][];

            for (int i = 0; i < chunks.size(); i++) {
                chunkArrays[i] = getBytesFromArray(chunks.getArray(i));
            }

            byte[] hash = KpHelper.hmac((int) algorithm, getBytesFromArray(key), chunkArrays);

            promise.resolve(getArrayFromBytes(hash));
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void cipher(
            double mode,
            double direction,
            ReadableArray key,
            ReadableArray iv,
            ReadableArray data,
            Promise promise
    ) {
        try {
            byte[] processed = KpHelper.cipher(
                    (int) mode,
                    (int) direction,
                    getBytesFromArray(key),
                    getBytesFromArray(iv),
                    getBytesFromArray(data)
            );

            promise.resolve(getArrayFromBytes(processed));
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void createCipher(
            double mode,
            double direction,
            ReadableArray key,
            ReadableArray iv,
            Promise promise
    ) {
        try {
            String uuid = KpHelper.createCipher(
                    (int) mode,
                    (int) direction,
                    getBytesFromArray(key),
                    getBytesFromArray(iv)
            );

            promise.resolve(uuid);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void processCipher(
            String uuid,
            ReadableArray data,
            Promise promise
    ) {
        try {
            byte[] processed = KpHelper.processCipher(uuid, getBytesFromArray(data));

            promise.resolve(getArrayFromBytes(processed));
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void finishCipher(
            String uuid,
            ReadableArray data,
            Promise promise
    ) {
        try {
            byte[] processed = KpHelper.finishCipher(uuid, getBytesFromArray(data));

            promise.resolve(getArrayFromBytes(processed));
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void destroyCipher(
            String uuid,
            Promise promise
    ) {
        try {
            KpHelper.destroyCipher(uuid);

            promise.resolve(null);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getHardwareKeys(Promise promise) {
        try {
            MainActivity mainActivity = (MainActivity) getCurrentActivity();
            assert mainActivity != null;

            HardwareKeyManager keyManager = mainActivity.getHardwareKeyManager();
            assert keyManager != null;

            Collection<HardwareKeyOption> devices = keyManager.getAvailableDevices();

            WritableMap deviceOptions = new WritableNativeMap();

            for (HardwareKeyOption option : devices) {
                deviceOptions.putString(option.id, String.format(
                        Locale.ENGLISH,
                        "YubiKey [%d] Slot %d - %s",
                        option.serialNumber,
                        option.slot == Slot.ONE ? 1 : 2,
                        option.requiresTouch ? "Touch" : "Passive"
                ));
            }

            promise.resolve(deviceOptions);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void challengeResponse(
            String id,
            ReadableArray data,
            Promise promise
    ) {
        try {
            MainActivity mainActivity = (MainActivity) getCurrentActivity();
            assert mainActivity != null;

            HardwareKeyManager keyManager = mainActivity.getHardwareKeyManager();
            assert keyManager != null;

            HardwareKeyOption device = keyManager.findDevice(id);

            byte[] challenge = getBytesFromArray(data);

            YubiOtpSession.create(device.device, result -> {
                try {
                    YubiOtpSession otp = result.getValue();

                    byte[] response = otp.calculateHmacSha1(device.slot, challenge, null);

                    promise.resolve(getArrayFromBytes(response));
                } catch (Exception e) {
                    promise.reject(e);
                }
            });
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private byte[] getBytesFromArray(ReadableArray array) throws Exception {
        int size = array.size();
        byte[] result = new byte[size];

        if (size < 1) {
            return result;
        }

        for (int i = 0; i < size; i++) {
            ReadableType type = array.getType(i);
            if (type != ReadableType.Number) {
                throw new Exception("Invalid byte array");
            }

            result[i] = (byte) array.getInt(i);
        }

        return result;
    }

    private WritableArray getArrayFromBytes(byte[] bytes) {
        WritableArray result = new WritableNativeArray();

        if (bytes != null) {
            for (byte b : bytes) {
                result.pushInt(b);
            }
        }

        return result;
    }
}
