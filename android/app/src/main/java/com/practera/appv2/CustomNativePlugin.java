package com.practera.capacitor.custom
  ;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class CustomNativePlugin extends Plugin {
  String packageName;
  @PluginMethod()
  public void goToAppSetting(PluginCall call) {
    String value = call.getString("value");

    JSObject ret = new JSObject();
    ret.put("value", value + " redirecting...");

    Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
    Uri uri = Uri.fromParts("package", getPackageName(), null);
    intent.setData(uri);
    startActivityForResult(call, intent, 1);
    call.success();
  }

  @PluginMethod()
  private void setPackageName(PluginCall call) {
    this.packageName = call.getString("packageName");
    call.success();
  }

  private String getPackageName() {
    if (this.packageName != null && !this.packageName.isEmpty()) {
      return this.packageName;
    }
    return "com.practera.appv2";
  }

}
