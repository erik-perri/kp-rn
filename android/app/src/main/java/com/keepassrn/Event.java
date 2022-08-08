package com.keepassrn;

public class Event {
    private final EventDispatcher dispatcher;
    private final String name;

    public Event(EventDispatcher dispatcher, String name) {
        this.dispatcher = dispatcher;
        this.name = name;
    }

    public void emit(Object params) {
        this.dispatcher.dispatchEvent(this.name, params);
    }
}
