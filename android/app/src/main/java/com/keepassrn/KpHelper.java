package com.keepassrn;

public class KpHelper {
    static {
        System.loadLibrary("botan");
        System.loadLibrary("helper");
    }

    public static native byte[] transformKey(byte[] key, byte[] seed, int rounds);
}
