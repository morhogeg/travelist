import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: SLComposeServiceViewController {
    let appGroupID = "group.com.travelist.shared"
    let sharedKey = "shared_inbox_items"

    override func isContentValid() -> Bool { return true }

    override func didSelectPost() {
        guard let content = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments = content.attachments else {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        // Try URL first, then text, then attributed text fallback
        for provider in attachments {
            if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (item, _) in
                    let url = (item as? URL)?.absoluteString ?? ""
                    self.saveToGroup(text: url)
                    self.finish()
                }
                return
            } else if provider.hasItemConformingToTypeIdentifier(UTType.text.identifier) ||
                        provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                let typeId = provider.hasItemConformingToTypeIdentifier(UTType.text.identifier)
                  ? UTType.text.identifier
                  : UTType.plainText.identifier
                provider.loadItem(forTypeIdentifier: typeId, options: nil) { (item, _) in
                    if let text = item as? String {
                        self.saveToGroup(text: text)
                    } else if let data = item as? Data, let text = String(data: data, encoding: .utf8) {
                        self.saveToGroup(text: text)
                    }
                    self.finish()
                }
                return
            }
        }

        // Fallback: check attributed text from the extension item
        if let attributed = content.attributedContentText?.string, !attributed.isEmpty {
            self.saveToGroup(text: attributed)
        }

        self.finish()
    }

    private func saveToGroup(text: String) {
        guard !text.isEmpty,
              let defaults = UserDefaults(suiteName: appGroupID) else { return }

        var items = defaults.array(forKey: sharedKey) as? [[String: Any]] ?? []
        items.append([
            "id": UUID().uuidString,
            "rawText": text,
            "receivedAt": ISO8601DateFormatter().string(from: Date()),
            "sourceApp": "share-extension"
        ])
        defaults.set(items, forKey: sharedKey)
        defaults.synchronize()

        NSLog("[ShareExtension] Saved text to group (%@), total now: %d", appGroupID, items.count)
    }

    private func finish() {
        NSLog("[ShareExtension] Completing request")
        self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }
}
