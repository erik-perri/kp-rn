LOCAL_PATH:= $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE := botan
LOCAL_SRC_FILES := $(LOCAL_PATH)/../lib/$(TARGET_ARCH_ABI)/lib/libbotan-2.so
LOCAL_EXPORT_C_INCLUDES := $(LOCAL_PATH)/../lib/$(TARGET_ARCH_ABI)/include/botan-2
include $(PREBUILT_SHARED_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := helper
LOCAL_SRC_FILES := KpHelper.cpp
LOCAL_SHARED_LIBRARIES := botan
LOCAL_LDLIBS := -llog
include $(BUILD_SHARED_LIBRARY)
