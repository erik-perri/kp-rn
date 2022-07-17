#ifndef KEEPASSRN_JNIHELPERS_H
#define KEEPASSRN_JNIHELPERS_H

jbyteArray convertByteVectorToJbyteArray(
        JNIEnv *env,
        const Botan::secure_vector<Botan::byte> &bytes
);

Botan::secure_vector<Botan::byte> convertJbyteArrayToByteVector(
        JNIEnv *env,
        jbyteArray array
);

jint throwException(JNIEnv *env, const char *message);

jint throwIllegalArgumentException(JNIEnv *env, const char *message);

#endif //KEEPASSRN_JNIHELPERS_H
