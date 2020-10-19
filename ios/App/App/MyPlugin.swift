import Capacitor

@objc(NativePlugin)
public class CustomNativePlugin: CAPPlugin {
  @objc func goToAppSetting(_ call: CAPPluginCall) {
    let value = call.getString("value") ?? ""
    call.success([
        "value": value
    ])
  }
}