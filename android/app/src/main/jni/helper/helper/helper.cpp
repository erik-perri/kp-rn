#include <jni.h>
#include <botan_all.h>

using namespace Botan;

extern "C" {
JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_transformKey
        (JNIEnv *env, jclass cls, jbyteArray key, jbyteArray seed, jint rounds) {
    auto keySize = env->GetArrayLength(key);
    auto seedSize = env->GetArrayLength(seed);
    if (keySize < 1 || seedSize < 1) {
        return nullptr;
    }

    auto *seedData = reinterpret_cast<uint8_t *>(env->GetByteArrayElements(seed, nullptr));
    if (seedData == nullptr) {
        return nullptr;
    }

    auto *keyData = reinterpret_cast<uint8_t *>(env->GetByteArrayElements(key, nullptr));
    if (keyData == nullptr) {
        return nullptr;
    }

    std::unique_ptr<Botan::BlockCipher> cipher(Botan::BlockCipher::create("AES-256"));
    cipher->set_key(seedData, seedSize);

    Botan::secure_vector<uint8_t> out(keySize);
    std::copy(keyData, keyData + keySize, out.begin());

    env->ReleaseByteArrayElements(seed, reinterpret_cast<jbyte *>(seedData), JNI_ABORT);
    env->ReleaseByteArrayElements(key, reinterpret_cast<jbyte *>(keyData), JNI_ABORT);

    for (int i = 0; i < rounds; ++i) {
        cipher->encrypt(out);
    }

    auto outSize = (jsize) out.size();
    auto result = env->NewByteArray(outSize);
    if (result == nullptr) {
        return nullptr;
    }

    jbyte fill[outSize];
    for (int f = 0; f < outSize; f++) {
        fill[f] = (jbyte) out[f];
    }

    env->SetByteArrayRegion(result, 0, outSize, fill);
    return result;
}
}
