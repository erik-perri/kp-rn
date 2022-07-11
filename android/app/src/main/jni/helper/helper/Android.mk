LOCAL_PATH:= $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := helper
LOCAL_SRC_FILES := helper.cpp
LOCAL_SHARED_LIBRARIES := botan

include $(BUILD_SHARED_LIBRARY)
