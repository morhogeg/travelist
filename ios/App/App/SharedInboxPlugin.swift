import Foundation
import Capacitor

@objc(SharedInboxPlugin)
public class SharedInboxPlugin: CAPPlugin {
    // Register methods with Capacitor
    @objc func echo(_ call: CAPPluginCall) {
        call.resolve(["value": call.getString("value") ?? ""])
    }

    @objc func readShared(_ call: CAPPluginCall) {
        let appGroupID = "group.com.travelist.shared"
        let key = "shared_inbox_items"
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let items = defaults.array(forKey: key) as? [[String: Any]] else {
            NSLog("[SharedInboxPlugin] No items found in app group \(appGroupID)")
            call.resolve(["items": []])
            return
        }
        NSLog("[SharedInboxPlugin] Read \(items.count) items from app group \(appGroupID)")
        call.resolve(["items": items])
    }

    @objc func clearShared(_ call: CAPPluginCall) {
        let appGroupID = "group.com.travelist.shared"
        let key = "shared_inbox_items"
        let defaults = UserDefaults(suiteName: appGroupID)
        defaults?.removeObject(forKey: key)
        defaults?.synchronize()
        NSLog("[SharedInboxPlugin] Cleared shared inbox items from app group \(appGroupID)")
        call.resolve()
    }
}

//
//  SharedInboxPlugin.swift
//  App
//
//  Created by Mor Hogeg on 30/11/2025.
//
