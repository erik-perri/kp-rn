package com.keepassrn;

public class KpHelper {
    static {
        System.loadLibrary("botan-2");
        System.loadLibrary("helper");
    }

    public static native byte[] transformAesKdfKey(byte[] key, byte[] seed, int rounds);

    public static native byte[] hash(int algorithm, byte[][] chunks);

    public static native byte[] hmac(int algorithm, byte[] key, byte[][] chunks);

    public static native byte[] cipher(int mode, int direction, byte[] key, byte[] iv, byte[] data);

    public static native String createCipher(int mode, int direction, byte[] key, byte[] iv);

    public static native byte[] processCipher(String uuid, byte[] data);

    public static native byte[] finishCipher(String uuid, byte[] data);

    public static native void destroyCipher(String uuid);
}
