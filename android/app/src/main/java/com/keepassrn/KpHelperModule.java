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
import com.facebook.react.bridge.WritableNativeArray;

import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.IOException;

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
