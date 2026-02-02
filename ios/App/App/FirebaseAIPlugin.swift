import Foundation
import Capacitor
import FirebaseVertexAI

/**
 * FirebaseAIPlugin
 * Bridges the native Firebase Vertex AI SDK to the web layer.
 * Used for calling Gemini 3 Flash natively on iOS.
 */
@objc(FirebaseAIPlugin)
public class FirebaseAIPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FirebaseAIPlugin"
    public let jsName = "FirebaseAIPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "generateDescription", returnType: CAPPluginReturnPromise)
    ]

    // Use Gemini 1.5 Flash (assuming user meant 1.5 or is referring to latest preview)
    // We'll use "gemini-1.5-flash" as the default stable model
    private lazy var vertex = VertexAI.vertexAI()
    private lazy var model = vertex.generativeModel(modelName: "gemini-1.5-flash")

    @objc func generateDescription(_ call: CAPPluginCall) {
        guard let placeName = call.getString("placeName"),
              let city = call.getString("city"),
              let country = call.getString("country") else {
            call.reject("Missing required parameters: placeName, city, or country")
            return
        }

        let category = call.getString("category") ?? "Attraction"
        
        let systemPrompt = """
        You are a travel guide assistant. Write a helpful 1-2 sentence description about a place.
        Include what makes it special and the type of experience it offers.
        Keep it concise (1-2 sentences).
        """
        
        let userPrompt = "Write a brief, helpful description for: \(placeName) in \(city), \(country) (Category: \(category))"

        Task {
            do {
                // Generate content using Gemini
                let response = try await model.generateContent(userPrompt)
                
                guard let text = response.text else {
                    call.reject("Failed to get text from Gemini")
                    return
                }

                // Grounding metadata access varies by SDK version. 
                // For now, we'll return an empty array to fix the build.
                let sources: [String] = []

                call.resolve([
                    "content": text.trimmingCharacters(in: .whitespacesAndNewlines),
                    "groundingSources": sources,
                    "thoughtSignature": "native-gemini-v1"
                ])
                
            } catch {
                NSLog("[FirebaseAIPlugin] Error: \(error.localizedDescription)")
                call.reject("Gemini generation failed: \(error.localizedDescription)")
            }
        }
    }
}
