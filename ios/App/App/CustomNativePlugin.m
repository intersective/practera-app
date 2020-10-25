
#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativePlugin, "NativePlugin",
           
           CAP_PLUGIN_METHOD(goToAppSetting, CAPPluginReturnPromise);
           )
