#include <jni.h>
#include <botan/block_cipher.h>
#include <botan/hash.h>
#include <botan/hmac.h>
#include <botan/types.h>
#include <android/log.h>

using namespace Botan;

const char LogTag[] = "KpHelper";

jbyteArray convertUIntArrayToJByteArray(
        JNIEnv *env,
        const secure_vector<byte> &out
) {
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

bool SymmetricCipher_aesKdf(
        const secure_vector<byte> &key,
        int rounds,
        secure_vector<byte> &data
) {
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

std::unique_ptr<HashFunction> hashFunction;
std::unique_ptr<MessageAuthenticationCode> hmacFunction;

extern "C" {

JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_transformAesKdfKey(
        JNIEnv *env,
        jclass,
        jbyteArray keyArray,
        jbyteArray seedArray,
        jint rounds
) {
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

JNIEXPORT jboolean JNICALL Java_com_keepassrn_KpHelper_startHash(
        JNIEnv *env,
        jclass ,
        jint algorithm
) {
    if (hashFunction != nullptr) {
        return false;
    }

    switch (algorithm) {
        case 0:
            hashFunction = HashFunction::create("SHA-256");
            break;
        case 1:
            hashFunction = HashFunction::create("SHA-512");
            break;
        default:
            return false;
    }

    return true;
}

JNIEXPORT jboolean JNICALL Java_com_keepassrn_KpHelper_continueHash(
        JNIEnv *env,
        jclass cls,
        jbyteArray dataArray
) {
    if (hashFunction == nullptr) {
        return false;
    }

    int dataSize = env->GetArrayLength(dataArray);
    if (dataSize < 1) {
        return false;
    }

    byte *dataElements = reinterpret_cast<byte *>(env->GetByteArrayElements(dataArray, nullptr));
    if (dataElements == nullptr) {
        return false;
    }

    std::vector<byte> data(dataElements, dataElements + dataSize);

    env->ReleaseByteArrayElements(dataArray, reinterpret_cast<jbyte *>(dataElements), JNI_ABORT);

    hashFunction->update(reinterpret_cast<const uint8_t*>(data.data()), data.size());

    return true;
}

JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_finishHash(
        JNIEnv *env,
        jclass cls
) {
    if (hashFunction == nullptr) {
        return nullptr;
    }

    secure_vector<uint8_t> result;
    result = hashFunction->final();

    hashFunction = nullptr;

    return convertUIntArrayToJByteArray(env, result);
}

JNIEXPORT jboolean JNICALL Java_com_keepassrn_KpHelper_startHmac(
        JNIEnv *env,
        jclass ,
        jint algorithm,
        jbyteArray keyArray
) {
    if (hmacFunction != nullptr) {
        return false;
    }

    int keySize = env->GetArrayLength(keyArray);
    if (keySize < 1) {
        return false;
    }

    byte *keyElements = reinterpret_cast<byte *>(env->GetByteArrayElements(keyArray, nullptr));
    if (keyElements == nullptr) {
        return false;
    }

    std::vector<byte> key(keyElements, keyElements + keySize);

    env->ReleaseByteArrayElements(keyArray, reinterpret_cast<jbyte *>(keyElements), JNI_ABORT);

    switch (algorithm) {
        case 0:
            hmacFunction = MessageAuthenticationCode::create("HMAC(SHA-256)");
            break;
        case 1:
            hmacFunction = MessageAuthenticationCode::create("HMAC(SHA-512)");
            break;
        default:
            return false;
    }

    hmacFunction->set_key(reinterpret_cast<const uint8_t*>(key.data()), key.size());

    return true;
}

JNIEXPORT jboolean JNICALL Java_com_keepassrn_KpHelper_continueHmac(
        JNIEnv *env,
        jclass cls,
        jbyteArray dataArray
) {
    if (hmacFunction == nullptr) {
        return false;
    }

    int dataSize = env->GetArrayLength(dataArray);
    if (dataSize < 1) {
        return false;
    }

    byte *dataElements = reinterpret_cast<byte *>(env->GetByteArrayElements(dataArray, nullptr));
    if (dataElements == nullptr) {
        return false;
    }

    std::vector<byte> data(dataElements, dataElements + dataSize);

    env->ReleaseByteArrayElements(dataArray, reinterpret_cast<jbyte *>(dataElements), JNI_ABORT);

    hmacFunction->update(reinterpret_cast<const uint8_t*>(data.data()), data.size());

    return true;
}

JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_finishHmac(
        JNIEnv *env,
        jclass cls
) {
    if (hmacFunction == nullptr) {
        return nullptr;
    }

    secure_vector<uint8_t> result;
    result = hmacFunction->final();

    hmacFunction = nullptr;

    return convertUIntArrayToJByteArray(env, result);
}

}
