#include <botan/secmem.h>
#include <botan/types.h>
#include <jni.h>
#include <stdexcept>
#include <string>

jbyteArray convertByteVectorToJbyteArray(
        JNIEnv *env,
        const Botan::secure_vector<Botan::byte> &bytes
) {
    auto resultSize = (jsize) bytes.size();
    auto result = env->NewByteArray(resultSize);
    if (result == nullptr) {
        return nullptr;
    }

    jbyte resultArray[resultSize];
    for (int f = 0; f < resultSize; f++) {
        resultArray[f] = (jbyte) bytes[f];
    }

    env->SetByteArrayRegion(result, 0, resultSize, resultArray);
    return result;
}

Botan::secure_vector<Botan::byte> convertJbyteArrayToByteVector(
        JNIEnv *env,
        jbyteArray array
) {
    Botan::secure_vector<Botan::byte> result;

    int arrayLength = env->GetArrayLength(array);
    if (arrayLength < 1) {
        return result;
    }

    auto *arrayElements = reinterpret_cast<Botan::byte *>(
            env->GetByteArrayElements(array, nullptr)
    );
    if (arrayElements == nullptr) {
        return result;
    }

    result.resize(arrayLength);

    std::copy(arrayElements, arrayElements + arrayLength, result.begin());

    env->ReleaseByteArrayElements(array, reinterpret_cast<jbyte *>(arrayElements), JNI_ABORT);

    return result;
}

std::string convertJstringToString(JNIEnv *env, jstring str) {
    auto pointer = env->GetStringChars(str, nullptr);
    if (pointer == nullptr) {
        return {};
    }

    int length = env->GetStringLength(str);
    std::string asString(pointer, pointer + length);

    env->ReleaseStringChars(str, pointer);

    return asString;
}

jint throwException(JNIEnv *env, const char *message) {
    jclass exClass = env->FindClass("java/lang/Exception");
    if (exClass == nullptr) {
        throw std::runtime_error("Failed to find Exception class");
    }

    return env->ThrowNew(exClass, message);
}

jint throwIllegalArgumentException(JNIEnv *env, const char *message) {
    jclass exClass = env->FindClass("java/lang/IllegalArgumentException");
    if (exClass == nullptr) {
        return throwException(env, "Failed to find IllegalArgumentException class");
    }

    return env->ThrowNew(exClass, message);
}
