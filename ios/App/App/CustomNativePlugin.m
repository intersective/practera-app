
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(CustomNativePlugin, "CustomNativePlugin",
           
           CAP_PLUGIN_METHOD(goToAppSetting, CAPPluginReturnPromise);
           )
