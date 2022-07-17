#include <android/log.h>
#include <jni.h>
#include <botan/block_cipher.h>
#include <botan/cipher_mode.h>
#include <botan/hash.h>
#include <botan/hmac.h>
#include <botan/types.h>

#include "JniHelpers.h"

const char LogTag[] = "KpHelper";

jbyteArray convertUIntArrayToJByteArray(
        JNIEnv *env,
        const Botan::secure_vector<Botan::byte> &out
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

Botan::secure_vector<Botan::byte> convertJByteArrayToVector(
        JNIEnv *env,
        jbyteArray array
) {
    Botan::secure_vector<Botan::byte> result;

    int arrayLength = env->GetArrayLength(array);
    if (arrayLength < 1) {
        return result;
    }

    Botan::byte *arrayElements = reinterpret_cast<Botan::byte *>(env->GetByteArrayElements(array, nullptr));
    if (arrayElements == nullptr) {
        return result;
    }

    result.resize(arrayLength);

    std::copy(arrayElements, arrayElements + arrayLength, result.begin());

    env->ReleaseByteArrayElements(array, reinterpret_cast<jbyte *>(arrayElements), JNI_ABORT);

    return result;
}

bool SymmetricCipher_aesKdf(
        const Botan::secure_vector<Botan::byte> &key,
        int rounds,
        Botan::secure_vector<Botan::byte> &data
) {
    try {
        std::unique_ptr<Botan::BlockCipher> cipher(Botan::BlockCipher::create("AES-256"));
        cipher->set_key(reinterpret_cast<const uint8_t *>(key.data()), key.size());

        Botan::secure_vector<uint8_t> out(data.begin(), data.end());
        for (int i = 0; i < rounds; ++i) {
            cipher->encrypt(out);
        }
        std::copy(out.begin(), out.end(), data.begin());
        return true;
    } catch (...) {
        __android_log_print(
                ANDROID_LOG_WARN,
                LogTag,
                "SymmetricCipher::aesKdf: Error while processing"
        );
        return false;
    }
}

enum CryptoHashAlgorithm {
    Sha256,
    Sha512,
};

enum SymmetricCipherMode {
    Aes128_CBC,
    Aes256_CBC,
    Aes128_CTR,
    Aes256_CTR,
    Twofish_CBC,
    ChaCha20,
    Salsa20,
    Aes256_GCM,
    InvalidMode = -1,
};

enum SymmetricCipherDirection {
    Decrypt,
    Encrypt
};

std::string SymmetricCipher_modeToString(const SymmetricCipherMode mode) {
    switch (mode) {
        case Aes128_CBC:
            return "AES-128/CBC";
        case Aes256_CBC:
            return "AES-256/CBC";
        case Aes128_CTR:
            return "CTR(AES-128)";
        case Aes256_CTR:
            return "CTR(AES-256)";
        case Aes256_GCM:
            return "AES-256/GCM";
        case Twofish_CBC:
            return "Twofish/CBC";
        case Salsa20:
            return "Salsa20";
        case ChaCha20:
            return "ChaCha20";
        default:
            __android_log_print(
                    ANDROID_LOG_WARN,
                    LogTag,
                    "SymmetricCipher::modeToString: Invalid Mode Specified: %d",
                    mode
            );
            return {};
    }
}

extern "C" {

JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_transformAesKdfKey(
        JNIEnv *env,
        jclass,
        jbyteArray keyArray,
        jbyteArray seedArray,
        jint rounds
) {
    auto seed = convertJByteArrayToVector(env, seedArray);
    if (seed.empty()) {
        throwIllegalArgumentException(env, "Missing seed");
        return nullptr;
    }

    auto key = convertJByteArrayToVector(env, keyArray);
    if (key.empty()) {
        throwIllegalArgumentException(env, "Missing key");
        return nullptr;
    }

    Botan::secure_vector<Botan::byte> out(key);

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
        throwIllegalArgumentException(env, "Missing chunks");
        return nullptr;
    }

    std::unique_ptr<Botan::HashFunction> function;

    switch (static_cast<CryptoHashAlgorithm>(algorithm)) {
        case Sha256:
            function = Botan::HashFunction::create("SHA-256");
            break;
        case Sha512:
            function = Botan::HashFunction::create("SHA-512");
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
        throwIllegalArgumentException(env, "Missing chunks");
        return nullptr;
    }

    auto key = convertJByteArrayToVector(env, keyArray);
    if (key.empty()) {
        throwIllegalArgumentException(env, "Missing key");
        return nullptr;
    }

    std::unique_ptr<Botan::MessageAuthenticationCode> function;

    switch (static_cast<CryptoHashAlgorithm>(algorithm)) {
        case Sha256:
            function = Botan::MessageAuthenticationCode::create("HMAC(SHA-256)");
            break;
        case Sha512:
            function = Botan::MessageAuthenticationCode::create("HMAC(SHA-512)");
            break;
        default:
            return nullptr;
    }

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

JNIEXPORT jbyteArray JNICALL Java_com_keepassrn_KpHelper_cipher(
        JNIEnv *env,
        jclass,
        jint cipherMode,
        jint cipherDirection,
        jbyteArray keyArray,
        jbyteArray ivArray,
        jbyteArray dataArray
) {
    auto key = convertJByteArrayToVector(env, keyArray);
    if (key.empty()) {
        throwIllegalArgumentException(env, "Missing key");
        return nullptr;
    }

    auto iv = convertJByteArrayToVector(env, ivArray);
    if (iv.empty()) {
        throwIllegalArgumentException(env, "Missing IV");
        return nullptr;
    }

    auto data = convertJByteArrayToVector(env, dataArray);
    if (data.empty()) {
        throwIllegalArgumentException(env, "Missing data");
        return nullptr;
    }

    auto mode = static_cast<SymmetricCipherMode>(cipherMode);
    if (mode == InvalidMode) {
        throwIllegalArgumentException(env, "Invalid mode");
        return nullptr;
    }

    auto direction = static_cast<SymmetricCipherDirection>(cipherDirection);
    auto botanMode = SymmetricCipher_modeToString(mode);
    auto botanDirection = direction == Encrypt ? Botan::ENCRYPTION : Botan::DECRYPTION;

    try {
        auto cipher = Botan::Cipher_Mode::create_or_throw(botanMode, botanDirection);

        cipher->set_key(reinterpret_cast<const uint8_t *>(key.data()), key.size());

        if (!cipher->valid_nonce_length(iv.size())) {
            __android_log_print(
                    ANDROID_LOG_WARN,
                    LogTag,
                    "KpHelper_cipher: Invalid IV size of %d for %s.",
                    iv.size(),
                    botanMode.data()
            );

            throwIllegalArgumentException(env, "Invalid IV size");
            return nullptr;
        }

        cipher->start(reinterpret_cast<const uint8_t *>(iv.data()), iv.size());

        cipher->finish(data);

        return convertUIntArrayToJByteArray(env, data);
    } catch (...) {
        __android_log_print(
                ANDROID_LOG_DEBUG,
                LogTag,
                "processCipher: Unknown exception caught"
        );

        return nullptr;
    }
}

}
