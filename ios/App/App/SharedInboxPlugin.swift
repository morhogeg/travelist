import Foundation
import Capacitor

@objc(SharedInboxPlugin)
public class SharedInboxPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SharedInboxPlugin"
    public let jsName = "SharedInboxPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "readShared", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearShared", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise)
    ]
    
    private let appGroupID = "group.com.travelist.shared"
    private let sharedKey = "shared_inbox_items"
    
    @objc public func echo(_ call: CAPPluginCall) {
        call.resolve(["value": call.getString("value") ?? ""])
    }

    @objc public func readShared(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let items = defaults.array(forKey: sharedKey) as? [[String: Any]] else {
            NSLog("[SharedInboxPlugin] No items found in app group \(appGroupID)")
            call.resolve(["items": []])
            return
        }
        NSLog("[SharedInboxPlugin] Read \(items.count) items from app group \(appGroupID)")
        call.resolve(["items": items])
    }

    @objc public func clearShared(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: appGroupID)
        defaults?.removeObject(forKey: sharedKey)
        defaults?.synchronize()
        NSLog("[SharedInboxPlugin] Cleared shared inbox items from app group \(appGroupID)")
        call.resolve()
    }
}
