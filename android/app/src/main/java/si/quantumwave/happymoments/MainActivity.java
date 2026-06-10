package si.quantumwave.happymoments;

import android.os.Build;
import android.os.Bundle;
import android.view.View;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Stop Android Autofill from offering passwords on plain text inputs
        // (group name, person name) inside the WebView.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
        }
    }
}
