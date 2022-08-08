package com.keepassrn;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

import javax.annotation.Nullable;

public class FindEntriesService extends HeadlessJsTaskService {
    @Override
    protected @Nullable
    HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras == null) {
            return null;
        }

        return new HeadlessJsTaskConfig(
                "FindEntries",
                Arguments.fromBundle(extras),
                1000,
                false
        );
    }

    public static void execute(Context applicationContext, String searchString) {
        Intent service = new Intent(applicationContext, FindEntriesService.class);
        Bundle bundle = new Bundle();

        bundle.putString("search", searchString);
        service.putExtras(bundle);

        applicationContext.startService(service);
    }
}
