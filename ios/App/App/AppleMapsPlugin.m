#import <Capacitor/Capacitor.h>

CAP_PLUGIN(AppleMapsPlugin, "AppleMapsPlugin",
           CAP_PLUGIN_METHOD(showMap, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(hideMap, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(addMarkers, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(centerOn, CAPPluginReturnPromise);
           CAP_PLUGIN_METHOD(clearMarkers, CAPPluginReturnPromise);)
