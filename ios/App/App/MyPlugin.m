//
//  MyPlugin.m
//  App
//
//  Created by Ronak on 19/10/20.
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(CustomNativePlugin, "CustomNativePlugin",
           
           CAP_PLUGIN_METHOD(goToAppSetting, CAPPluginReturnPromise);
           )
