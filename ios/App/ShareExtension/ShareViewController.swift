import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: SLComposeServiceViewController {
    let appGroupID = "group.com.travelist.shared"
    let sharedKey = "shared_inbox_items"
    
    private var hasProcessedContent = false
    private let processingGroup = DispatchGroup()

    override func isContentValid() -> Bool { return true }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        NSLog("[ShareExtension] ✅ Extension loaded successfully")
    }

    override func didSelectPost() {
        NSLog("[ShareExtension] 📤 didSelectPost called")
        
        guard let content = extensionContext?.inputItems.first as? NSExtensionItem else {
            NSLog("[ShareExtension] ❌ No extension items found")
            finishWithError()
            return
        }
        
        guard let attachments = content.attachments, !attachments.isEmpty else {
            NSLog("[ShareExtension] ❌ No attachments found")
            // Try attributed text fallback
            if let attributed = content.attributedContentText?.string, !attributed.isEmpty {
                NSLog("[ShareExtension] 📝 Using attributed text fallback: \(attributed.prefix(50))...")
                saveToGroupSync(text: attributed)
            }
            finishSuccessfully()
            return
        }
        
        NSLog("[ShareExtension] 📎 Found \(attachments.count) attachment(s)")
        
        // Process all attachments
        for (index, provider) in attachments.enumerated() {
            NSLog("[ShareExtension] 🔍 Processing attachment \(index + 1)")
            processAttachment(provider)
        }
        
        // Wait for all async operations then finish
        processingGroup.notify(queue: .main) { [weak self] in
            NSLog("[ShareExtension] ✅ All attachments processed")
            self?.finishSuccessfully()
        }
    }
    
    private func processAttachment(_ provider: NSItemProvider) {
        // Check for URL first (most reliable for web shares)
        if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
            processingGroup.enter()
            NSLog("[ShareExtension] 🔗 Loading URL type")
            
            provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (item, error) in
                defer { self?.processingGroup.leave() }
                
                if let error = error {
                    NSLog("[ShareExtension] ❌ URL load error: \(error.localizedDescription)")
                    return
                }
                
                if let url = item as? URL {
                    NSLog("[ShareExtension] ✅ Got URL: \(url.absoluteString)")
                    self?.saveToGroupSync(text: url.absoluteString)
                } else if let urlString = item as? String {
                    NSLog("[ShareExtension] ✅ Got URL string: \(urlString)")
                    self?.saveToGroupSync(text: urlString)
                } else {
                    NSLog("[ShareExtension] ⚠️ URL item was not a URL or String: \(type(of: item))")
                }
            }
            return
        }
        
        // Check for plain text
        let textTypes = [UTType.text.identifier, UTType.plainText.identifier, "public.plain-text"]
        for typeId in textTypes {
            if provider.hasItemConformingToTypeIdentifier(typeId) {
                processingGroup.enter()
                NSLog("[ShareExtension] 📝 Loading text type: \(typeId)")
                
                provider.loadItem(forTypeIdentifier: typeId, options: nil) { [weak self] (item, error) in
                    defer { self?.processingGroup.leave() }
                    
                    if let error = error {
                        NSLog("[ShareExtension] ❌ Text load error: \(error.localizedDescription)")
                        return
                    }
                    
                    if let text = item as? String, !text.isEmpty {
                        NSLog("[ShareExtension] ✅ Got text: \(text.prefix(50))...")
                        self?.saveToGroupSync(text: text)
                    } else if let data = item as? Data, let text = String(data: data, encoding: .utf8), !text.isEmpty {
                        NSLog("[ShareExtension] ✅ Got text from data: \(text.prefix(50))...")
                        self?.saveToGroupSync(text: text)
                    } else {
                        NSLog("[ShareExtension] ⚠️ Text item was empty or wrong type: \(type(of: item))")
                    }
                }
                return
            }
        }
        
        NSLog("[ShareExtension] ⚠️ No supported type identifiers found in attachment")
        // Log available types for debugging
        provider.registeredTypeIdentifiers.forEach { typeId in
            NSLog("[ShareExtension] 📋 Available type: \(typeId)")
        }
    }

    private func saveToGroupSync(text: String) {
        guard !text.isEmpty else {
            NSLog("[ShareExtension] ⚠️ Skipping empty text save")
            return
        }
        
        // Prevent duplicate saves
        objc_sync_enter(self)
        defer { objc_sync_exit(self) }
        
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            NSLog("[ShareExtension] ❌ CRITICAL: Could not access App Group: \(appGroupID)")
            return
        }
        
        var items = defaults.array(forKey: sharedKey) as? [[String: Any]] ?? []
        
        // Check for duplicates (same text in last 5 items)
        let recentTexts = items.suffix(5).compactMap { $0["rawText"] as? String }
        if recentTexts.contains(text) {
            NSLog("[ShareExtension] ⚠️ Duplicate text detected, skipping save")
            return
        }
        
        let newItem: [String: Any] = [
            "id": UUID().uuidString,
            "rawText": text,
            "receivedAt": ISO8601DateFormatter().string(from: Date()),
            "sourceApp": "share-extension"
        ]
        
        items.append(newItem)
        defaults.set(items, forKey: sharedKey)
        
        // Force synchronization using CFPreferences (more reliable than deprecated .synchronize())
        CFPreferencesAppSynchronize(appGroupID as CFString)
        
        // Verify the write
        if let verifyDefaults = UserDefaults(suiteName: appGroupID),
           let savedItems = verifyDefaults.array(forKey: sharedKey) as? [[String: Any]],
           savedItems.count >= items.count {
            NSLog("[ShareExtension] ✅ Successfully saved and verified. Total items: \(savedItems.count)")
            hasProcessedContent = true
        } else {
            NSLog("[ShareExtension] ❌ Failed to verify save!")
        }
    }

    private func finishSuccessfully() {
        if hasProcessedContent {
            NSLog("[ShareExtension] 🎉 Completing successfully with saved content")
        } else {
            NSLog("[ShareExtension] ⚠️ Completing without any saved content")
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: [], completionHandler: { _ in
                NSLog("[ShareExtension] ✅ Extension request completed")
            })
        }
    }
    
    private func finishWithError() {
        NSLog("[ShareExtension] ❌ Completing with error")
        DispatchQueue.main.async { [weak self] in
            let error = NSError(domain: "com.travelist.share", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "Failed to process shared content"
            ])
            self?.extensionContext?.cancelRequest(withError: error)
        }
    }
}
