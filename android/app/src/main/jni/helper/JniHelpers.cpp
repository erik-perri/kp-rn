#include <jni.h>
#include <stdexcept>

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
