package com.keepassrn;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity implements EventDispatcher {
    private HardwareKeyManager hardwareKeyManager;

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "KeepassRn";
    }

    public HardwareKeyManager getHardwareKeyManager() {
        return hardwareKeyManager;
    }

    /**
     * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
     * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
     * (Paper).
     */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new MainActivityDelegate(this, getMainComponentName());
    }

    public static class MainActivityDelegate extends ReactActivityDelegate {
        public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
            super(activity, mainComponentName);
        }

        @Override
        protected ReactRootView createRootView() {
            ReactRootView reactRootView = new ReactRootView(getContext());
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
            return reactRootView;
        }

        @Override
        protected boolean isConcurrentRootEnabled() {
            // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
            // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
            return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Don't pass down savedInstanceState to allow `react-native-screens` to work as expected.
        super.onCreate(null);

        hardwareKeyManager = new HardwareKeyManager(
                getApplicationContext(),
                new Event(this, "onDevicesChanged")
        );
        hardwareKeyManager.startDiscovery();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        hardwareKeyManager.stopDiscovery();
    }

    public void dispatchEvent(String eventName, Object params) {
        ReactContext context = getReactInstanceManager().getCurrentReactContext();
        if (context == null) {
            return;
        }

        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
