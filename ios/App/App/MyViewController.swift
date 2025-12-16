import UIKit
import Capacitor

class MyViewController: CAPBridgeViewController {
    
    override open func capacitorDidLoad() {
        // Register all custom local plugins here
        bridge?.registerPluginInstance(AppleMapsPlugin())
    }
}
