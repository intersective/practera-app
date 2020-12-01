import Capacitor


@objc(CustomNativePlugin)
public class CustomNativePlugin: CAPPlugin {
    @objc func goToAppSetting(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        
        let alertController = UIAlertController (
        	title: "Push Notification", 
        	message: "Allow push notification permission on settings?", 
        	preferredStyle: .alert
        )

        let settingsAction = UIAlertAction(title: "Settings", style: .default) { (_) -> Void in

            guard let settingsUrl = URL(string: UIApplication.openSettingsURLString) else {
                return
            }

            if UIApplication.shared.canOpenURL(settingsUrl) {
                UIApplication.shared.open(settingsUrl, completionHandler: { (success) in
                    print("Settings opened: \(success)") // Prints true
                })
            }
        }
        alertController.addAction(settingsAction)
        let cancelAction = UIAlertAction(title: "Cancel", style: .default, handler: nil)
        alertController.addAction(cancelAction)

        DispatchQueue.main.async {
          self.bridge.viewController.present(alertController, animated: true, completion: nil)
        }
        
        call.success([
            "value": value
        ])
    }
}
