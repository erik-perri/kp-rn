#ifndef KEEPASSRN_JNIHELPERS_H
#define KEEPASSRN_JNIHELPERS_H

jint throwException(JNIEnv *env, const char *message);

jint throwIllegalArgumentException(JNIEnv *env, const char *message);

#endif //KEEPASSRN_JNIHELPERS_H
