package com.keepassrn;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;

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
    public void transformAesKdfKey(ReadableArray key, ReadableArray seed, double iterations, Promise promise) {
        try {
            byte[] keyBytes = getBytesFromArray(key);
            byte[] seedBytes = getBytesFromArray(seed);

            byte[] transformedBytes = KpHelper.transformAesKdfKey(keyBytes, seedBytes, (int) iterations);

            WritableArray result = new WritableNativeArray();
            for (byte b : transformedBytes) {
                result.pushInt(b);
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    private byte[] getBytesFromArray(ReadableArray array) throws Exception {
        int size = array.size();
        byte[] result = new byte[size];

        for (int i = 0; i < size; i++) {
            ReadableType type = array.getType(i);
            if (type != ReadableType.Number) {
                throw new Exception("Invalid byte array");
            }

            result[i] = (byte) array.getInt(i);
        }

        return result;
    }
}
