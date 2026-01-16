import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {
    let appGroupID = "group.com.travelist.shared"
    let sharedKey = "shared_inbox_items"
    
    private var sharedText: String = ""
    private var displayTitle: String = ""
    
    // UI Components
    private let containerView = UIView()
    private let iconImageView = UIImageView()
    private let titleLabel = UILabel()
    private let subtitleLabel = UILabel()
    private let dividerView = UIView()
    private let placeNameLabel = UILabel()
    private let locationLabel = UILabel()
    private let saveButton = UIButton(type: .system)
    private let cancelButton = UIButton(type: .system)
    private let activityIndicator = UIActivityIndicatorView(style: .medium)
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        extractSharedContent()
    }
    
    private func setupUI() {
        // Blurred background
        let blurEffect = UIBlurEffect(style: .systemUltraThinMaterialDark)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.frame = view.bounds
        blurView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(blurView)
        
        // Container card with glassmorphism
        containerView.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.95)
        containerView.layer.cornerRadius = 24
        containerView.layer.borderWidth = 0.5
        containerView.layer.borderColor = UIColor.white.withAlphaComponent(0.2).cgColor
        containerView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(containerView)
        
        // App icon placeholder (circle with gradient)
        iconImageView.image = UIImage(systemName: "mappin.circle.fill")
        iconImageView.tintColor = UIColor.systemPurple
        iconImageView.contentMode = .scaleAspectFit
        iconImageView.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(iconImageView)
        
        // Title
        titleLabel.text = "Save to Travelist"
        titleLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        titleLabel.textColor = .label
        titleLabel.textAlignment = .center
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(titleLabel)
        
        // Subtitle
        subtitleLabel.text = "AI will extract place details"
        subtitleLabel.font = UIFont.systemFont(ofSize: 13, weight: .regular)
        subtitleLabel.textColor = .tertiaryLabel
        subtitleLabel.textAlignment = .center
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(subtitleLabel)
        
        // Divider
        dividerView.backgroundColor = UIColor.separator.withAlphaComponent(0.3)
        dividerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(dividerView)
        
        // Place name (main content)
        placeNameLabel.font = UIFont.systemFont(ofSize: 17, weight: .semibold)
        placeNameLabel.textColor = .label
        placeNameLabel.numberOfLines = 2
        placeNameLabel.textAlignment = .center
        placeNameLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(placeNameLabel)
        
        // Location subtitle
        locationLabel.font = UIFont.systemFont(ofSize: 14, weight: .regular)
        locationLabel.textColor = .secondaryLabel
        locationLabel.numberOfLines = 1
        locationLabel.textAlignment = .center
        locationLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(locationLabel)
        
        // Activity indicator
        activityIndicator.hidesWhenStopped = true
        activityIndicator.color = .white
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        
        // Save button with purple gradient look
        saveButton.setTitle("Save Place", for: .normal)
        saveButton.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        saveButton.setTitleColor(.white, for: .normal)
        saveButton.layer.cornerRadius = 12
        saveButton.clipsToBounds = true
        saveButton.addTarget(self, action: #selector(saveTapped), for: .touchUpInside)
        saveButton.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(saveButton)
        saveButton.addSubview(activityIndicator)
        
        // Apply gradient to save button
        applyGradient(to: saveButton)
        
        // Cancel button
        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.titleLabel?.font = UIFont.systemFont(ofSize: 15, weight: .medium)
        cancelButton.setTitleColor(.secondaryLabel, for: .normal)
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(cancelButton)
        
        // Layout
        NSLayoutConstraint.activate([
            containerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            containerView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.82),
            
            iconImageView.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 24),
            iconImageView.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            iconImageView.widthAnchor.constraint(equalToConstant: 40),
            iconImageView.heightAnchor.constraint(equalToConstant: 40),
            
            titleLabel.topAnchor.constraint(equalTo: iconImageView.bottomAnchor, constant: 12),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),
            
            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 4),
            subtitleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            subtitleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),
            
            dividerView.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 16),
            dividerView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            dividerView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),
            dividerView.heightAnchor.constraint(equalToConstant: 0.5),
            
            placeNameLabel.topAnchor.constraint(equalTo: dividerView.bottomAnchor, constant: 16),
            placeNameLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            placeNameLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),
            
            locationLabel.topAnchor.constraint(equalTo: placeNameLabel.bottomAnchor, constant: 4),
            locationLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            locationLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),
            
            saveButton.topAnchor.constraint(equalTo: locationLabel.bottomAnchor, constant: 20),
            saveButton.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 20),
            saveButton.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -20),
            saveButton.heightAnchor.constraint(equalToConstant: 48),
            
            activityIndicator.centerXAnchor.constraint(equalTo: saveButton.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: saveButton.centerYAnchor),
            
            cancelButton.topAnchor.constraint(equalTo: saveButton.bottomAnchor, constant: 8),
            cancelButton.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            cancelButton.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -16),
        ])
    }
    
    private func applyGradient(to button: UIButton) {
        let gradientLayer = CAGradientLayer()
        gradientLayer.colors = [
            UIColor(red: 102/255, green: 126/255, blue: 234/255, alpha: 1).cgColor,
            UIColor(red: 118/255, green: 75/255, blue: 162/255, alpha: 1).cgColor
        ]
        gradientLayer.startPoint = CGPoint(x: 0, y: 0.5)
        gradientLayer.endPoint = CGPoint(x: 1, y: 0.5)
        gradientLayer.frame = CGRect(x: 0, y: 0, width: 300, height: 48)
        gradientLayer.cornerRadius = 12
        button.layer.insertSublayer(gradientLayer, at: 0)
    }
    
    private func extractSharedContent() {
        placeNameLabel.text = "Loading..."
        locationLabel.text = ""
        
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments = extensionItem.attachments else {
            placeNameLabel.text = "No content"
            return
        }
        
        for provider in attachments {
            if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (item, error) in
                    DispatchQueue.main.async {
                        if let url = item as? URL {
                            self?.sharedText = url.absoluteString
                            self?.parseURL(url)
                        } else if let urlString = item as? String, let url = URL(string: urlString) {
                            self?.sharedText = urlString
                            self?.parseURL(url)
                        }
                    }
                }
                return
            }
            
            if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] (item, error) in
                    DispatchQueue.main.async {
                        if let text = item as? String {
                            self?.sharedText = text
                            self?.placeNameLabel.text = String(text.prefix(60))
                            self?.locationLabel.text = "Shared text"
                        }
                    }
                }
                return
            }
        }
    }
    
    private func parseURL(_ url: URL) {
        let host = url.host?.replacingOccurrences(of: "www.", with: "") ?? ""
        
        // Extract place name from Google Maps
        if host.contains("google") || host.contains("goo.gl") {
            if let placeName = extractGoogleMapsPlace(from: url) {
                placeNameLabel.text = placeName
                locationLabel.text = ""
                return
            }
        }
        
        // Fallback
        placeNameLabel.text = host
        locationLabel.text = ""
    }
    
    private func extractGoogleMapsPlace(from url: URL) -> String? {
        let path = url.path
        
        if path.contains("/place/") {
            let components = path.components(separatedBy: "/place/")
            if components.count > 1 {
                let afterPlace = components[1].components(separatedBy: "/").first ?? ""
                let decoded = afterPlace.removingPercentEncoding ?? afterPlace
                return decoded.replacingOccurrences(of: "+", with: " ")
            }
        }
        
        return nil
    }
    
    @objc private func saveTapped() {
        guard !sharedText.isEmpty else {
            cancelTapped()
            return
        }
        
        saveButton.setTitle("", for: .normal)
        activityIndicator.startAnimating()
        saveButton.isUserInteractionEnabled = false
        
        saveToAppGroup(text: sharedText)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
            self?.showSuccessAndClose()
        }
    }
    
    private func showSuccessAndClose() {
        activityIndicator.stopAnimating()
        
        // Update button to success state
        saveButton.layer.sublayers?.first?.removeFromSuperlayer()
        saveButton.backgroundColor = UIColor.systemGreen
        saveButton.setTitle("✓ Saved", for: .normal)
        
        // Haptic feedback
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }
    
    @objc private func cancelTapped() {
        extensionContext?.cancelRequest(withError: NSError(domain: "com.travelist.share", code: 0, userInfo: nil))
    }
    
    private func saveToAppGroup(text: String) {
        guard !text.isEmpty else {
            NSLog("[ShareExtension] ⚠️ Empty text, skipping save")
            return
        }
        
        NSLog("[ShareExtension] 📝 Attempting to save: \(text.prefix(50))...")
        
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            NSLog("[ShareExtension] ❌ CRITICAL: Could not access App Group: \(appGroupID)")
            return
        }
        
        var items = defaults.array(forKey: sharedKey) as? [[String: Any]] ?? []
        NSLog("[ShareExtension] 📊 Current items count: \(items.count)")
        
        // Check for duplicates in recent items
        let recentTexts = items.suffix(10).compactMap { $0["rawText"] as? String }
        if recentTexts.contains(text) {
            NSLog("[ShareExtension] ⚠️ Duplicate detected, skipping save")
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
        
        // Force synchronization
        defaults.synchronize()
        CFPreferencesAppSynchronize(appGroupID as CFString)
        
        // Verify the write
        if let verifyDefaults = UserDefaults(suiteName: appGroupID),
           let savedItems = verifyDefaults.array(forKey: sharedKey) as? [[String: Any]] {
            NSLog("[ShareExtension] ✅ Successfully saved! Total items: \(savedItems.count)")
        } else {
            NSLog("[ShareExtension] ❌ Failed to verify save!")
        }
    }
}
