import Foundation
import Capacitor
import MapKit
import CoreLocation

@objc(AppleMapsPlugin)
public class AppleMapsPlugin: CAPPlugin, CAPBridgedPlugin, MKMapViewDelegate {
    
    // MARK: - CAPBridgedPlugin Requirements (Capacitor 7)
    public let identifier = "AppleMapsPlugin"
    public let jsName = "AppleMapsPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "showMap", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hideMap", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addMarkers", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "centerOn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearMarkers", returnType: CAPPluginReturnPromise)
    ]
    
    private var mapView: MKMapView?
    private var geocoder = CLGeocoder()
    private var markerData: [String: [String: Any]] = [:] // Store marker info by ID
    
    // MARK: - Show Map
    @objc func showMap(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self,
                  let viewController = self.bridge?.viewController else {
                call.reject("Could not access view controller")
                return
            }
            
            if self.mapView != nil {
                // Map already exists, just make sure it's visible
                self.mapView?.isHidden = false
                call.resolve()
                return
            }
            
            // Create map view
            let map = MKMapView()
            map.delegate = self
            map.translatesAutoresizingMaskIntoConstraints = false
            map.showsUserLocation = false
            map.mapType = .standard
            
            // Add to view hierarchy above the web view
            viewController.view.addSubview(map)
            
            // Constraints: full screen with safe area margins, leaving room for navbar
            NSLayoutConstraint.activate([
                map.topAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.topAnchor),
                map.leadingAnchor.constraint(equalTo: viewController.view.leadingAnchor),
                map.trailingAnchor.constraint(equalTo: viewController.view.trailingAnchor),
                map.bottomAnchor.constraint(equalTo: viewController.view.safeAreaLayoutGuide.bottomAnchor, constant: -80) // Leave room for navbar
            ])
            
            self.mapView = map
            
            NSLog("[AppleMapsPlugin] Map view created and displayed")
            call.resolve()
        }
    }
    
    // MARK: - Hide Map
    @objc func hideMap(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            self?.mapView?.removeFromSuperview()
            self?.mapView = nil
            self?.markerData.removeAll()
            NSLog("[AppleMapsPlugin] Map view hidden and removed")
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
            
            NSLog("[AppleMapsPlugin] Adding \(markers.count) markers")
            
            var pendingGeocode = markers.count
            var addedAnnotations: [MKPointAnnotation] = []
            
            for marker in markers {
                guard let id = marker["id"] as? String,
                      let name = marker["name"] as? String,
                      let address = marker["address"] as? String else {
                    pendingGeocode -= 1
                    continue
                }
                
                let category = marker["category"] as? String ?? "general"
                let visited = marker["visited"] as? Bool ?? false
                
                // Store marker data for later lookup
                self.markerData[id] = marker
                
                // Geocode the address
                self.geocoder.geocodeAddressString(address) { placemarks, error in
                    defer {
                        pendingGeocode -= 1
                        if pendingGeocode == 0 {
                            // All geocoding complete
                            if !addedAnnotations.isEmpty {
                                // Fit map to show all annotations
                                mapView.showAnnotations(addedAnnotations, animated: true)
                            }
                            call.resolve(["added": addedAnnotations.count])
                        }
                    }
                    
                    if let error = error {
                        NSLog("[AppleMapsPlugin] Geocode error for \(name): \(error.localizedDescription)")
                        return
                    }
                    
                    guard let location = placemarks?.first?.location else {
                        NSLog("[AppleMapsPlugin] No location found for: \(address)")
                        return
                    }
                    
                    DispatchQueue.main.async {
                        let annotation = PlaceAnnotation()
                        annotation.coordinate = location.coordinate
                        annotation.title = name
                        annotation.subtitle = category
                        annotation.placeId = id
                        annotation.category = category
                        annotation.visited = visited
                        
                        mapView.addAnnotation(annotation)
                        addedAnnotations.append(annotation)
                        
                        NSLog("[AppleMapsPlugin] Added marker: \(name) at \(location.coordinate)")
                    }
                }
            }
            
            // If no markers to geocode, resolve immediately
            if markers.isEmpty {
                call.resolve(["added": 0])
            }
        }
    }
    
    // MARK: - Center Map
    @objc func centerOn(_ call: CAPPluginCall) {
        guard let lat = call.getDouble("lat"),
              let lng = call.getDouble("lng") else {
            call.reject("Missing lat/lng")
            return
        }
        
        let zoom = call.getDouble("zoom") ?? 0.05 // Default zoom level (smaller = more zoomed in)
        
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
            
            NSLog("[AppleMapsPlugin] Cleared all markers")
            call.resolve()
        }
    }
    
    // MARK: - MKMapViewDelegate
    public func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
        guard let placeAnnotation = annotation as? PlaceAnnotation else {
            return nil
        }
        
        let identifier = "PlaceMarker"
        var annotationView = mapView.dequeueReusableAnnotationView(withIdentifier: identifier) as? MKMarkerAnnotationView
        
        if annotationView == nil {
            annotationView = MKMarkerAnnotationView(annotation: annotation, reuseIdentifier: identifier)
            annotationView?.canShowCallout = true
            
            // Add detail button
            let button = UIButton(type: .detailDisclosure)
            annotationView?.rightCalloutAccessoryView = button
        } else {
            annotationView?.annotation = annotation
        }
        
        // Set marker color based on category
        annotationView?.markerTintColor = colorForCategory(placeAnnotation.category)
        
        // Set glyph based on category
        annotationView?.glyphImage = imageForCategory(placeAnnotation.category)
        
        // Dim if visited
        if placeAnnotation.visited {
            annotationView?.alpha = 0.6
        } else {
            annotationView?.alpha = 1.0
        }
        
        return annotationView
    }
    
    public func mapView(_ mapView: MKMapView, annotationView view: MKAnnotationView, calloutAccessoryControlTapped control: UIControl) {
        guard let placeAnnotation = view.annotation as? PlaceAnnotation,
              let id = placeAnnotation.placeId,
              let data = markerData[id] else {
            return
        }
        
        // Notify JavaScript about the tap
        notifyListeners("markerTap", data: data)
        
        NSLog("[AppleMapsPlugin] Marker tapped: \(placeAnnotation.title ?? "unknown")")
    }
    
    public func mapView(_ mapView: MKMapView, didSelect view: MKAnnotationView) {
        guard let placeAnnotation = view.annotation as? PlaceAnnotation,
              let id = placeAnnotation.placeId,
              let data = markerData[id] else {
            return
        }
        
        // Notify JavaScript about selection
        notifyListeners("markerSelect", data: data)
    }
    
    // MARK: - Helpers
    private func colorForCategory(_ category: String) -> UIColor {
        switch category.lowercased() {
        case "food", "restaurant", "cafe":
            return UIColor(red: 0.95, green: 0.6, blue: 0.3, alpha: 1.0) // Orange
        case "lodging", "hotel":
            return UIColor(red: 0.4, green: 0.6, blue: 0.9, alpha: 1.0) // Blue
        case "attractions", "museum":
            return UIColor(red: 0.6, green: 0.2, blue: 0.8, alpha: 1.0) // Purple
        case "shopping":
            return UIColor(red: 0.9, green: 0.4, blue: 0.6, alpha: 1.0) // Pink
        case "nightlife", "bar":
            return UIColor(red: 0.5, green: 0.3, blue: 0.7, alpha: 1.0) // Deep Purple
        case "outdoors", "park":
            return UIColor(red: 0.3, green: 0.7, blue: 0.4, alpha: 1.0) // Green
        default:
            return UIColor(red: 0.4, green: 0.5, blue: 0.9, alpha: 1.0) // Default purple-blue
        }
    }
    
    private func imageForCategory(_ category: String) -> UIImage? {
        let systemName: String
        switch category.lowercased() {
        case "food", "restaurant", "cafe":
            systemName = "fork.knife"
        case "lodging", "hotel":
            systemName = "bed.double.fill"
        case "attractions", "museum":
            systemName = "star.fill"
        case "shopping":
            systemName = "bag.fill"
        case "nightlife", "bar":
            systemName = "music.note"
        case "outdoors", "park":
            systemName = "leaf.fill"
        default:
            systemName = "mappin"
        }
        return UIImage(systemName: systemName)
    }
}

// MARK: - Custom Annotation Class
class PlaceAnnotation: MKPointAnnotation {
    var placeId: String?
    var category: String = "general"
    var visited: Bool = false
}
