#import <Capacitor/Capacitor.h>

// Objective-C bridge to register the Swift plugin with Capacitor
CAP_PLUGIN(SharedInboxPlugin, "SharedInboxPlugin",
           CAP_PLUGIN_METHOD(readShared, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearShared, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
)
