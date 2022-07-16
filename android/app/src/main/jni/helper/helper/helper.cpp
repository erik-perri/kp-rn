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

secure_vector<byte> convertJByteArrayToVector(
        JNIEnv *env,
        jbyteArray array
) {
    secure_vector<byte> result;

    int arrayLength = env->GetArrayLength(array);
    if (arrayLength < 1) {
        return result;
    }

    byte *arrayElements = reinterpret_cast<byte *>(env->GetByteArrayElements(array, nullptr));
    if (arrayElements == nullptr) {
        return result;
    }

    result.resize(arrayLength);

    std::copy(arrayElements, arrayElements + arrayLength, result.begin());

    env->ReleaseByteArrayElements(array, reinterpret_cast<jbyte *>(arrayElements), JNI_ABORT);

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

enum CryptoHashAlgorithm {
    Sha256,
    Sha512,
};

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

JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_hash(
        JNIEnv *env,
        jclass,
        jint algorithm,
        jobjectArray chunkArray
) {
    int chunkCount = env->GetArrayLength(chunkArray);
    if (chunkCount < 1) {
        return nullptr;
    }

    std::unique_ptr<HashFunction> function;

    switch (static_cast<CryptoHashAlgorithm>(algorithm)) {
        case Sha256:
            function = HashFunction::create("SHA-256");
            break;
        case Sha512:
            function = HashFunction::create("SHA-512");
            break;
        default:
            return nullptr;
    }

    for (int chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
        auto chunkPointer = reinterpret_cast<jbyteArray>(
                env->GetObjectArrayElement(chunkArray, chunkIndex)
        );
        if (chunkPointer == nullptr) {
            return nullptr;
        }

        auto data = convertJByteArrayToVector(env, chunkPointer);

        function->update(reinterpret_cast<const uint8_t *>(data.data()), data.size());
    }

    return convertUIntArrayToJByteArray(env, function->final());
}

JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_hmac(
        JNIEnv *env,
        jclass,
        jint algorithm,
        jbyteArray keyArray,
        jobjectArray chunkArray
) {
    int chunkCount = env->GetArrayLength(chunkArray);
    if (chunkCount < 1) {
        return nullptr;
    }

    int keySize = env->GetArrayLength(keyArray);
    if (keySize < 1) {
        return nullptr;
    }

    std::unique_ptr<MessageAuthenticationCode> function;

    switch (static_cast<CryptoHashAlgorithm>(algorithm)) {
        case Sha256:
            function = MessageAuthenticationCode::create("HMAC(SHA-256)");
            break;
        case Sha512:
            function = MessageAuthenticationCode::create("HMAC(SHA-512)");
            break;
        default:
            return nullptr;
    }

    secure_vector<byte> key = convertJByteArrayToVector(env, keyArray);
    function->set_key(reinterpret_cast<const uint8_t *>(key.data()), key.size());

    for (int chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
        auto chunkPointer = reinterpret_cast<jbyteArray>(
                env->GetObjectArrayElement(chunkArray, chunkIndex)
        );
        if (chunkPointer == nullptr) {
            return nullptr;
        }

        auto data = convertJByteArrayToVector(env, chunkPointer);

        function->update(reinterpret_cast<const uint8_t *>(data.data()), data.size());
    }

    return convertUIntArrayToJByteArray(env, function->final());
}

}
