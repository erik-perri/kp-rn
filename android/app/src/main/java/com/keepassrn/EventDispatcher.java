package com.keepassrn;

public interface EventDispatcher {
    public void dispatchEvent(String eventName, Object params);
}
