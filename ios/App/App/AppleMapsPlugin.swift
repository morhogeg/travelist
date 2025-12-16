import Foundation
import Capacitor
import MapKit
import CoreLocation

@objc(AppleMapsPlugin)
public class AppleMapsPlugin: CAPPlugin, CAPBridgedPlugin, MKMapViewDelegate {
    
    // MARK: - CAPBridgedPlugin Requirements
    public let identifier = "AppleMapsPlugin"
    public let jsName = "AppleMapsPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "showMap", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hideMap", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addMarkers", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "centerOn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearMarkers", returnType: CAPPluginReturnPromise)
    ]
    
    // MARK: - Properties
    private var mapView: MKMapView?
    private var headerContainer: UIView?
    private var placeCountLabel: UILabel?
    private var geocoder = CLGeocoder()
    private var markerData: [String: [String: Any]] = [:]
    private var addedMarkersCount = 0
    
    // MARK: - Show Map
    @objc func showMap(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self,
                  let viewController = self.bridge?.viewController else {
                call.reject("Could not access view controller")
                return
            }
            
            if self.mapView != nil {
                self.mapView?.isHidden = false
                self.headerContainer?.isHidden = false
                call.resolve()
                return
            }
            
            // Create map view with standard style
            let map = MKMapView()
            map.delegate = self
            map.translatesAutoresizingMaskIntoConstraints = false
            map.showsUserLocation = false
            map.mapType = .standard  // Standard roads/streets view
            map.showsCompass = true
            map.showsScale = true
            
            viewController.view.addSubview(map)
            
            // Map constraints - full screen with bottom navbar space
            NSLayoutConstraint.activate([
                map.topAnchor.constraint(equalTo: viewController.view.topAnchor),
                map.leadingAnchor.constraint(equalTo: viewController.view.leadingAnchor),
                map.trailingAnchor.constraint(equalTo: viewController.view.trailingAnchor),
                map.bottomAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.bottomAnchor, constant: -80)
            ])
            
            self.mapView = map
            
            // Create floating header with buttons
            self.createFloatingHeader(in: viewController.view)
            
            NSLog("[AppleMapsPlugin] Map view created with standard style")
            call.resolve()
        }
    }
    
    // MARK: - Create Floating Header
    private func createFloatingHeader(in parentView: UIView) {
        // Container for header elements
        let container = UIView()
        container.translatesAutoresizingMaskIntoConstraints = false
        parentView.addSubview(container)
        
        NSLayoutConstraint.activate([
            container.topAnchor.constraint(equalTo: parentView.safeAreaLayoutGuide.topAnchor, constant: 8),
            container.leadingAnchor.constraint(equalTo: parentView.leadingAnchor, constant: 16),
            container.trailingAnchor.constraint(equalTo: parentView.trailingAnchor, constant: -16),
            container.heightAnchor.constraint(equalToConstant: 44)
        ])
        
        self.headerContainer = container
        
        // Back Button (List View)
        let backButton = createGlassButton(title: "List View", icon: "list.bullet")
        backButton.addTarget(self, action: #selector(backButtonTapped), for: .touchUpInside)
        container.addSubview(backButton)
        
        NSLayoutConstraint.activate([
            backButton.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            backButton.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            backButton.heightAnchor.constraint(equalToConstant: 40)
        ])
        
        // Place Count Badge
        let countBadge = createGlassBadge()
        container.addSubview(countBadge)
        
        NSLayoutConstraint.activate([
            countBadge.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            countBadge.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            countBadge.heightAnchor.constraint(equalToConstant: 36)
        ])
    }
    
    // MARK: - UI Components
    private func createGlassButton(title: String, icon: String) -> UIButton {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        
        // Blur background
        let blurEffect = UIBlurEffect(style: .systemThinMaterial)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.translatesAutoresizingMaskIntoConstraints = false
        blurView.isUserInteractionEnabled = false
        blurView.layer.cornerRadius = 20
        blurView.clipsToBounds = true
        button.insertSubview(blurView, at: 0)
        
        // Icon
        let config = UIImage.SymbolConfiguration(pointSize: 15, weight: .semibold)
        let image = UIImage(systemName: icon, withConfiguration: config)
        button.setImage(image, for: .normal)
        
        // Title
        button.setTitle("  \(title)", for: .normal)
        button.tintColor = UIColor(red: 0.4, green: 0.49, blue: 0.92, alpha: 1.0) // #667eea
        button.titleLabel?.font = UIFont.systemFont(ofSize: 15, weight: .semibold)
        button.setTitleColor(UIColor.label, for: .normal)
        button.contentEdgeInsets = UIEdgeInsets(top: 0, left: 16, bottom: 0, right: 20)
        
        // Blur constraints
        NSLayoutConstraint.activate([
            blurView.topAnchor.constraint(equalTo: button.topAnchor),
            blurView.leadingAnchor.constraint(equalTo: button.leadingAnchor),
            blurView.trailingAnchor.constraint(equalTo: button.trailingAnchor),
            blurView.bottomAnchor.constraint(equalTo: button.bottomAnchor)
        ])
        
        // Shadow
        button.layer.shadowColor = UIColor.black.cgColor
        button.layer.shadowOffset = CGSize(width: 0, height: 2)
        button.layer.shadowRadius = 8
        button.layer.shadowOpacity = 0.15
        
        return button
    }
    
    private func createGlassBadge() -> UIView {
        let container = UIView()
        container.translatesAutoresizingMaskIntoConstraints = false
        
        // Blur background
        let blurEffect = UIBlurEffect(style: .systemThinMaterial)
        let blurView = UIVisualEffectView(effect: blurEffect)
        blurView.translatesAutoresizingMaskIntoConstraints = false
        blurView.layer.cornerRadius = 18
        blurView.clipsToBounds = true
        container.addSubview(blurView)
        
        // Pin icon
        let pinIcon = UIImageView()
        pinIcon.translatesAutoresizingMaskIntoConstraints = false
        let config = UIImage.SymbolConfiguration(pointSize: 13, weight: .semibold)
        pinIcon.image = UIImage(systemName: "mappin.circle.fill", withConfiguration: config)
        pinIcon.tintColor = UIColor(red: 0.4, green: 0.49, blue: 0.92, alpha: 1.0)
        container.addSubview(pinIcon)
        
        // Count label
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 14, weight: .semibold)
        label.textColor = .label
        label.text = "0 places"
        container.addSubview(label)
        
        self.placeCountLabel = label
        
        NSLayoutConstraint.activate([
            blurView.topAnchor.constraint(equalTo: container.topAnchor),
            blurView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            blurView.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            blurView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
            
            pinIcon.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 12),
            pinIcon.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            pinIcon.widthAnchor.constraint(equalToConstant: 18),
            pinIcon.heightAnchor.constraint(equalToConstant: 18),
            
            label.leadingAnchor.constraint(equalTo: pinIcon.trailingAnchor, constant: 6),
            label.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -14),
            label.centerYAnchor.constraint(equalTo: container.centerYAnchor)
        ])
        
        // Shadow
        container.layer.shadowColor = UIColor.black.cgColor
        container.layer.shadowOffset = CGSize(width: 0, height: 2)
        container.layer.shadowRadius = 8
        container.layer.shadowOpacity = 0.15
        
        return container
    }
    
    @objc private func backButtonTapped() {
        NSLog("[AppleMapsPlugin] Back button tapped")
        notifyListeners("backTap", data: [:])
    }
    
    private func updatePlaceCount(_ count: Int) {
        DispatchQueue.main.async { [weak self] in
            let text = count == 1 ? "1 place" : "\(count) places"
            self?.placeCountLabel?.text = text
            NSLog("[AppleMapsPlugin] Updated place count to: \(count)")
        }
    }
    
    // MARK: - Hide Map
    @objc func hideMap(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.mapView?.removeFromSuperview()
            self?.mapView = nil
            self?.headerContainer?.removeFromSuperview()
            self?.headerContainer = nil
            self?.placeCountLabel = nil
            self?.markerData.removeAll()
            self?.addedMarkersCount = 0
            NSLog("[AppleMapsPlugin] Map view hidden")
            call.resolve()
        }
    }
    
    // MARK: - Add Markers
    @objc func addMarkers(_ call: CAPPluginCall) {
        guard let markers = call.getArray("markers") as? [[String: Any]] else {
            call.reject("Missing markers array")
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let mapView = self.mapView else {
                call.reject("Map not initialized")
                return
            }
            
            NSLog("[AppleMapsPlugin] Processing \(markers.count) markers")
            
            // Update count immediately with total expected
            self.updatePlaceCount(markers.count)
            
            var pendingGeocode = markers.count
            var addedAnnotations: [MKPointAnnotation] = []
            
            if markers.isEmpty {
                call.resolve(["added": 0])
                return
            }
            
            for marker in markers {
                guard let id = marker["id"] as? String,
                      let name = marker["name"] as? String,
                      let address = marker["address"] as? String else {
                    pendingGeocode -= 1
                    if pendingGeocode == 0 {
                        self.finishAddingMarkers(addedAnnotations, mapView: mapView, call: call)
                    }
                    continue
                }
                
                let category = marker["category"] as? String ?? "general"
                let visited = marker["visited"] as? Bool ?? false
                
                self.markerData[id] = marker
                
                // Geocode address
                self.geocoder.geocodeAddressString(address) { placemarks, error in
                    defer {
                        pendingGeocode -= 1
                        if pendingGeocode == 0 {
                            self.finishAddingMarkers(addedAnnotations, mapView: mapView, call: call)
                        }
                    }
                    
                    if let error = error {
                        NSLog("[AppleMapsPlugin] Geocode error for \(name): \(error.localizedDescription)")
                        return
                    }
                    
                    guard let location = placemarks?.first?.location else {
                        NSLog("[AppleMapsPlugin] No location for: \(address)")
                        return
                    }
                    
                    DispatchQueue.main.async {
                        let annotation = PlaceAnnotation()
                        annotation.coordinate = location.coordinate
                        annotation.title = name
                        annotation.subtitle = category.capitalized
                        annotation.placeId = id
                        annotation.category = category
                        annotation.visited = visited
                        
                        mapView.addAnnotation(annotation)
                        addedAnnotations.append(annotation)
                        
                        NSLog("[AppleMapsPlugin] Added: \(name)")
                    }
                }
            }
        }
    }
    
    private func finishAddingMarkers(_ annotations: [MKPointAnnotation], mapView: MKMapView, call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            if !annotations.isEmpty {
                mapView.showAnnotations(annotations, animated: true)
            }
            self?.addedMarkersCount = annotations.count
            call.resolve(["added": annotations.count])
            NSLog("[AppleMapsPlugin] Finished adding \(annotations.count) markers")
        }
    }
    
    // MARK: - Center Map
    @objc func centerOn(_ call: CAPPluginCall) {
        guard let lat = call.getDouble("lat"),
              let lng = call.getDouble("lng") else {
            call.reject("Missing lat/lng")
            return
        }
        
        let zoom = call.getDouble("zoom") ?? 0.05
        
        DispatchQueue.main.async { [weak self] in
            guard let mapView = self?.mapView else {
                call.reject("Map not initialized")
                return
            }
            
            let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lng)
            let region = MKCoordinateRegion(
                center: coordinate,
                span: MKCoordinateSpan(latitudeDelta: zoom, longitudeDelta: zoom)
            )
            
            mapView.setRegion(region, animated: true)
            call.resolve()
        }
    }
    
    // MARK: - Clear Markers
    @objc func clearMarkers(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let mapView = self?.mapView else {
                call.resolve()
                return
            }
            
            let annotations = mapView.annotations.filter { !($0 is MKUserLocation) }
            mapView.removeAnnotations(annotations)
            self?.markerData.removeAll()
            self?.addedMarkersCount = 0
            self?.updatePlaceCount(0)
            
            NSLog("[AppleMapsPlugin] Cleared all markers")
            call.resolve()
        }
    }
    
    // MARK: - MKMapViewDelegate
    public func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
        guard let placeAnnotation = annotation as? PlaceAnnotation else { return nil }
        
        let identifier = "PlaceMarker"
        var view = mapView.dequeueReusableAnnotationView(withIdentifier: identifier) as? MKMarkerAnnotationView
        
        if view == nil {
            view = MKMarkerAnnotationView(annotation: annotation, reuseIdentifier: identifier)
            view?.canShowCallout = true
            view?.rightCalloutAccessoryView = UIButton(type: .detailDisclosure)
        } else {
            view?.annotation = annotation
        }
        
        view?.markerTintColor = colorForCategory(placeAnnotation.category)
        view?.glyphImage = imageForCategory(placeAnnotation.category)
        view?.alpha = placeAnnotation.visited ? 0.6 : 1.0
        
        return view
    }
    
    public func mapView(_ mapView: MKMapView, annotationView view: MKAnnotationView, calloutAccessoryControlTapped control: UIControl) {
        guard let annotation = view.annotation as? PlaceAnnotation,
              let id = annotation.placeId,
              let data = markerData[id] else { return }
        
        notifyListeners("markerTap", data: data)
    }
    
    public func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
        guard let annotation = view.annotation as? PlaceAnnotation,
              let id = annotation.placeId,
              let data = markerData[id] else { return }
        
        notifyListeners("markerSelect", data: data)
    }
    
    // MARK: - Category Helpers
    private func colorForCategory(_ category: String) -> UIColor {
        switch category.lowercased() {
        case "food", "restaurant", "cafe": return UIColor(red: 0.95, green: 0.5, blue: 0.2, alpha: 1.0)
        case "lodging", "hotel": return UIColor(red: 0.3, green: 0.6, blue: 0.9, alpha: 1.0)
        case "attractions", "museum": return UIColor(red: 0.6, green: 0.2, blue: 0.8, alpha: 1.0)
        case "shopping": return UIColor(red: 0.9, green: 0.3, blue: 0.5, alpha: 1.0)
        case "nightlife", "bar": return UIColor(red: 0.5, green: 0.2, blue: 0.7, alpha: 1.0)
        case "outdoors", "park": return UIColor(red: 0.2, green: 0.7, blue: 0.4, alpha: 1.0)
        default: return UIColor(red: 0.4, green: 0.49, blue: 0.92, alpha: 1.0)
        }
    }
    
    private func imageForCategory(_ category: String) -> UIImage? {
        let name: String
        switch category.lowercased() {
        case "food", "restaurant", "cafe": name = "fork.knife"
        case "lodging", "hotel": name = "bed.double.fill"
        case "attractions", "museum": name = "star.fill"
        case "shopping": name = "bag.fill"
        case "nightlife", "bar": name = "music.note"
        case "outdoors", "park": name = "leaf.fill"
        default: name = "mappin"
        }
        return UIImage(systemName: name)
    }
}

// MARK: - Custom Annotation
class PlaceAnnotation: MKPointAnnotation {
    var placeId: String?
    var category: String = "general"
    var visited: Bool = false
}
