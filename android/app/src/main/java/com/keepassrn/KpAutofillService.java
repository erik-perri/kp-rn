package com.keepassrn;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.FillCallback;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import android.util.Log;
import android.view.View;
import android.view.autofill.AutofillId;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import java.util.List;
import java.util.stream.Collectors;

@RequiresApi(api = Build.VERSION_CODES.O)
public class KpAutofillService extends AutofillService {
    private static final String TAG = KpAutofillService.class.getSimpleName();

    @Override
    public void onFillRequest(
            @NonNull FillRequest fillRequest,
            @NonNull CancellationSignal cancellationSignal,
            @NonNull FillCallback fillCallback
    ) {
        Log.d(TAG, "onFillRequest");

        List<FillContext> context = fillRequest.getFillContexts();
        List<AssistStructure> structures = context.stream()
                .map(FillContext::getStructure)
                .collect(Collectors.toList());
        AssistStructure latestStructure = null;
        FoundStructure foundStructure = new FoundStructure();

        for (AssistStructure structure : structures) {
            searchStructure(structure, foundStructure);
            latestStructure = structure;
        }

        if (latestStructure == null || !foundStructure.isComplete()) {
            Log.d(TAG, "Incomplete structure found");
            return;
        }

        String packageName = latestStructure.getActivityComponent().getPackageName();

        FindEntriesService.execute(getApplicationContext(), packageName);
    }

    @Override
    public void onSaveRequest(
            @NonNull SaveRequest saveRequest,
            @NonNull SaveCallback saveCallback
    ) {
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

    public void searchStructure(AssistStructure structure, FoundStructure found) {
        int nodes = structure.getWindowNodeCount();

        for (int i = 0; i < nodes; i++) {
            AssistStructure.WindowNode windowNode = structure.getWindowNodeAt(i);
            AssistStructure.ViewNode viewNode = windowNode.getRootViewNode();
            searchNode(viewNode, found);

            if (found.isComplete()) {
                break;
            }
        }
    }

    public void searchNode(AssistStructure.ViewNode viewNode, FoundStructure found) {
        String[] autofillHints = viewNode.getAutofillHints();
        if (autofillHints != null && autofillHints.length > 0) {
            for (String hint : autofillHints) {
                switch (hint) {
                    case View.AUTOFILL_HINT_EMAIL_ADDRESS:
                    case View.AUTOFILL_HINT_USERNAME:
                        found.usernameId = viewNode.getAutofillId();
                        break;
                    case View.AUTOFILL_HINT_PASSWORD:
                        found.passwordId = viewNode.getAutofillId();
                        break;
                }
            }
        }

        if (found.isComplete()) {
            return;
        }

        for (int i = 0; i < viewNode.getChildCount(); i++) {
            AssistStructure.ViewNode childNode = viewNode.getChildAt(i);
            searchNode(childNode, found);

            if (found.isComplete()) {
                break;
            }
        }
    }

    private static class FoundStructure {
        public AutofillId usernameId;
        public AutofillId passwordId;

        public boolean isComplete() {
            return this.usernameId != null && this.passwordId != null;
        }
    }
}
