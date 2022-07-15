package com.keepassrn;

public class KpHelper {
    static {
        System.loadLibrary("botan-2");
        System.loadLibrary("helper");
    }

    public static native byte[] transformAesKdfKey(byte[] key, byte[] seed, int rounds);
}
