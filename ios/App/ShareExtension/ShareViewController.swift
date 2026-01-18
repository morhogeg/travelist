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
        
        NSLog("[ShareExtension] 🔍 Starting content extraction")
        
        guard let extensionItem = extensionContext?.inputItems.first as? NSExtensionItem,
              let attachments = extensionItem.attachments else {
            NSLog("[ShareExtension] ❌ No attachments found")
            placeNameLabel.text = "No content"
            return
        }
        
        NSLog("[ShareExtension] 📦 Found \(attachments.count) attachment(s)")
        
        // Try to get URL first (most reliable)
        for provider in attachments {
            if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] (item, error) in
                    DispatchQueue.main.async {
                        if let url = item as? URL {
                            self?.handleURL(url)
                        } else if let urlString = item as? String, let url = URL(string: urlString) {
                            self?.handleURL(url)
                        }
                    }
                }
                return
            }
        }
        
        // Try plain text as fallback
        for provider in attachments {
            if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] (item, error) in
                    DispatchQueue.main.async {
                        if let text = item as? String {
                            // Check if the text contains a URL
                            if let url = self?.extractURL(from: text) {
                                self?.handleURL(url)
                            } else {
                                self?.sharedText = text
                                self?.placeNameLabel.text = String(text.prefix(60))
                            }
                        }
                    }
                }
                return
            }
        }
        
        placeNameLabel.text = "Unable to extract content"
    }
    
    private func extractURL(from text: String) -> URL? {
        let detector = try? NSDataDetector(types: NSTextCheckingResult.CheckingType.link.rawValue)
        let matches = detector?.matches(in: text, options: [], range: NSRange(location: 0, length: text.utf16.count))
        if let match = matches?.first, let range = Range(match.range, in: text) {
            return URL(string: String(text[range]))
        }
        return nil
    }
    
    private func handleURL(_ url: URL) {
        NSLog("[ShareExtension] 🔗 Handling URL: \(url.absoluteString)")
        
        let urlString = url.absoluteString
        
        // Check if this is a shortened URL that needs expanding
        if isShortURL(url) {
            NSLog("[ShareExtension] 🔄 Expanding shortened URL...")
            placeNameLabel.text = "Expanding link..."
            
            expandURL(url) { [weak self] expandedURL in
                DispatchQueue.main.async {
                    if let expanded = expandedURL {
                        NSLog("[ShareExtension] ✅ Expanded to: \(expanded.absoluteString)")
                        self?.sharedText = expanded.absoluteString
                        self?.parseAndDisplayURL(expanded)
                    } else {
                        // Fallback: save the short URL, AI will try to handle it
                        NSLog("[ShareExtension] ⚠️ Could not expand URL, using original")
                        self?.sharedText = urlString
                        self?.placeNameLabel.text = url.host ?? "Shared Link"
                        self?.locationLabel.text = "Tap Save to process"
                    }
                }
            }
        } else {
            self.sharedText = urlString
            parseAndDisplayURL(url)
        }
    }
    
    private func isShortURL(_ url: URL) -> Bool {
        let shortDomains = ["goo.gl", "maps.app.goo.gl", "bit.ly", "tinyurl.com", "t.co", "maps.google.com"]
        let host = url.host?.lowercased() ?? ""
        return shortDomains.contains { host.contains($0) } && !url.path.contains("/place/")
    }
    
    private func expandURL(_ url: URL, completion: @escaping (URL?) -> Void) {
        var request = URLRequest(url: url)
        request.httpMethod = "HEAD"
        request.timeoutInterval = 5
        
        let task = URLSession.shared.dataTask(with: request) { _, response, error in
            if let httpResponse = response as? HTTPURLResponse,
               let finalURL = httpResponse.url,
               finalURL.absoluteString != url.absoluteString {
                completion(finalURL)
            } else {
                // Try GET request as fallback (some servers don't support HEAD)
                var getRequest = URLRequest(url: url)
                getRequest.timeoutInterval = 5
                
                let getTask = URLSession.shared.dataTask(with: getRequest) { _, response, _ in
                    if let httpResponse = response as? HTTPURLResponse,
                       let finalURL = httpResponse.url {
                        completion(finalURL)
                    } else {
                        completion(nil)
                    }
                }
                getTask.resume()
            }
        }
        task.resume()
    }
    
    private func parseAndDisplayURL(_ url: URL) {
        let host = url.host?.lowercased() ?? ""
        
        // Google Maps
        if host.contains("google") {
            if let placeName = extractGoogleMapsPlace(from: url) {
                placeNameLabel.text = placeName
                locationLabel.text = "Google Maps"
                return
            }
        }
        
        // Apple Maps
        if host.contains("apple") || host.contains("maps.apple") {
            if let placeName = extractAppleMapsPlace(from: url) {
                placeNameLabel.text = placeName
                locationLabel.text = "Apple Maps"
                return
            }
        }
        
        // Yelp
        if host.contains("yelp") {
            if let placeName = extractYelpPlace(from: url) {
                placeNameLabel.text = placeName
                locationLabel.text = "Yelp"
                return
            }
        }
        
        // TripAdvisor
        if host.contains("tripadvisor") {
            if let placeName = extractTripAdvisorPlace(from: url) {
                placeNameLabel.text = placeName
                locationLabel.text = "TripAdvisor"
                return
            }
        }
        
        // Instagram
        if host.contains("instagram") {
            placeNameLabel.text = "Instagram Post"
            locationLabel.text = "Instagram"
            return
        }
        
        // Fallback: show the domain
        placeNameLabel.text = host.replacingOccurrences(of: "www.", with: "")
        locationLabel.text = "Web Link"
    }
    
    // MARK: - Place Name Extraction
    
    private func extractGoogleMapsPlace(from url: URL) -> String? {
        let path = url.path
        
        // Try /place/PlaceName/ pattern
        if path.contains("/place/") {
            let components = path.components(separatedBy: "/place/")
            if components.count > 1 {
                let afterPlace = components[1].components(separatedBy: "/").first ?? ""
                let decoded = afterPlace.removingPercentEncoding ?? afterPlace
                let cleaned = decoded.replacingOccurrences(of: "+", with: " ")
                if !cleaned.isEmpty {
                    return cleaned
                }
            }
        }
        
        // Try query parameter "q" (e.g., ?q=Restaurant+Name)
        if let queryItems = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems {
            for item in queryItems {
                if item.name == "q", let value = item.value, !value.isEmpty {
                    let decoded = value.removingPercentEncoding ?? value
                    return decoded.replacingOccurrences(of: "+", with: " ")
                }
            }
        }
        
        return nil
    }
    
    private func extractAppleMapsPlace(from url: URL) -> String? {
        if let queryItems = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems {
            for item in queryItems {
                if item.name == "q" || item.name == "address", let value = item.value, !value.isEmpty {
                    return value.removingPercentEncoding ?? value
                }
            }
        }
        return nil
    }
    
    private func extractYelpPlace(from url: URL) -> String? {
        // Yelp URLs: /biz/restaurant-name-city
        let path = url.path
        if path.contains("/biz/") {
            let bizPart = path.replacingOccurrences(of: "/biz/", with: "")
            let name = bizPart.components(separatedBy: "-").dropLast().joined(separator: " ")
            if !name.isEmpty {
                return name.capitalized
            }
        }
        return nil
    }
    
    private func extractTripAdvisorPlace(from url: URL) -> String? {
        // TripAdvisor URLs often have place name in path
        let path = url.path
        if let range = path.range(of: "-Reviews-") {
            let beforeReviews = path[..<range.lowerBound]
            let components = beforeReviews.components(separatedBy: "-")
            if components.count > 1 {
                return components.dropFirst().joined(separator: " ")
            }
        }
        return nil
    }
    
    // MARK: - Actions
    
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
        
        saveButton.layer.sublayers?.first?.removeFromSuperlayer()
        saveButton.backgroundColor = UIColor.systemGreen
        saveButton.setTitle("✓ Saved", for: .normal)
        
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
        
        NSLog("[ShareExtension] 📝 Saving: \(text.prefix(100))...")
        
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            NSLog("[ShareExtension] ❌ CRITICAL: Could not access App Group: \(appGroupID)")
            return
        }
        
        var items = defaults.array(forKey: sharedKey) as? [[String: Any]] ?? []
        
        // Check for duplicates
        let recentTexts = items.suffix(10).compactMap { $0["rawText"] as? String }
        if recentTexts.contains(text) {
            NSLog("[ShareExtension] ⚠️ Duplicate detected, skipping")
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
        defaults.synchronize()
        CFPreferencesAppSynchronize(appGroupID as CFString)
        
        NSLog("[ShareExtension] ✅ Saved successfully! Total items: \(items.count)")
    }
}

