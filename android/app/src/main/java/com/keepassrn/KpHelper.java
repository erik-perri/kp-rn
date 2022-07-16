package com.keepassrn;

public class KpHelper {
    static {
        System.loadLibrary("botan-2");
        System.loadLibrary("helper");
    }

    public static native byte[] transformAesKdfKey(byte[] key, byte[] seed, int rounds);

    public static native boolean startHash(int algorithm);
    public static native boolean continueHash(byte[] data);
    public static native byte[] finishHash();

    public static native boolean startHmac(int algorithm, byte[] key);
    public static native boolean continueHmac(byte[] data);
    public static native byte[] finishHmac();
}
