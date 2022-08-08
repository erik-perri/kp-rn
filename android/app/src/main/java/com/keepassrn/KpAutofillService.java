package com.keepassrn;

import android.os.Build;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.FillCallback;
import android.service.autofill.FillRequest;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

@RequiresApi(api = Build.VERSION_CODES.O)
public class KpAutofillService extends AutofillService {
    private static final String TAG = KpAutofillService.class.getSimpleName();

    @Override
    public void onFillRequest(@NonNull FillRequest fillRequest, @NonNull CancellationSignal cancellationSignal, @NonNull FillCallback fillCallback) {
        Log.d(TAG, "onFillRequest");
    }

    @Override
    public void onSaveRequest(@NonNull SaveRequest saveRequest, @NonNull SaveCallback saveCallback) {
        Log.d(TAG, "onSaveRequest");
    }

    @Override
    public void onConnected() {
        Log.d(TAG, "onConnected");
    }

    @Override
    public void onDisconnected() {
        Log.d(TAG, "onDisconnected");
    }
}
