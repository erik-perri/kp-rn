#include <jni.h>
#include <botan/types.h>
#include <botan/block_cipher.h>
#include <android/log.h>

using namespace Botan;

const char LogTag[] = "KpHelper";

jbyteArray convertUIntArrayToJByteArray(JNIEnv *env, const secure_vector<byte> &out) {
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

bool SymmetricCipher_aesKdf(const secure_vector<byte> &key, int rounds, secure_vector<byte> &data) {
    try {
        std::unique_ptr<BlockCipher> cipher(BlockCipher::create("AES-256"));
        cipher->set_key(reinterpret_cast<const uint8_t *>(key.data()), key.size());

        secure_vector<uint8_t> out(data.begin(), data.end());
        for (int i = 0; i < rounds; ++i) {
            cipher->encrypt(out);
        }
        std::copy(out.begin(), out.end(), data.begin());
        return true;
    } catch (std::exception &e) {
        __android_log_print(
                ANDROID_LOG_WARN,
                LogTag,
                "SymmetricCipher::aesKdf: Could not process: %s",
                e.what()
        );
        return false;
    }
}


extern "C" {

JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_transformAesKdfKey
        (JNIEnv *env, jclass cls, jbyteArray keyArray, jbyteArray seedArray, jint rounds) {
    int keySize = env->GetArrayLength(keyArray);
    int seedSize = env->GetArrayLength(seedArray);
    if (keySize < 1 || seedSize < 1) {
        return nullptr;
    }

    byte *seedData = reinterpret_cast<byte *>(env->GetByteArrayElements(seedArray, nullptr));
    if (seedData == nullptr) {
        return nullptr;
    }

    byte *keyData = reinterpret_cast<byte *>(env->GetByteArrayElements(keyArray, nullptr));
    if (keyData == nullptr) {
        env->ReleaseByteArrayElements(seedArray, reinterpret_cast<jbyte *>(seedData), JNI_ABORT);
        return nullptr;
    }

    secure_vector<byte> seed(seedData, seedData + seedSize);
    secure_vector<byte> out(keyData, keyData + keySize);

    env->ReleaseByteArrayElements(seedArray, reinterpret_cast<jbyte *>(seedData), JNI_ABORT);
    env->ReleaseByteArrayElements(keyArray, reinterpret_cast<jbyte *>(keyData), JNI_ABORT);

    if (SymmetricCipher_aesKdf(seed, rounds, out)) {
        return convertUIntArrayToJByteArray(env, out);
    }

    return nullptr;
}

}
