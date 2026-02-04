import Foundation
import Capacitor
import FirebaseVertexAI

/**
 * FirebaseAIPlugin
 * Uses Firebase Vertex AI with project-level credentials (no separate API key needed).
 */
@objc(FirebaseAIPlugin)
public class FirebaseAIPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "FirebaseAIPlugin"
    public let jsName = "FirebaseAIPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "generateDescription", returnType: CAPPluginReturnPromise)
    ]

    // Use Vertex AI (works with Firebase project credentials)
    private lazy var vertex = VertexAI.vertexAI()
    private lazy var model = vertex.generativeModel(
        modelName: "gemini-3-flash-preview",
        generationConfig: GenerationConfig(
            temperature: 0.3,
            maxOutputTokens: 500
        ),
        systemInstruction: ModelContent(role: "system", parts: """
            You are a travel guide assistant. Write exactly 2 sentences about a place that a traveler would find useful.
            Include what makes it special and practical tips.
            
            CRITICAL LOCATION RULE: The user provides a SPECIFIC city and country. You MUST write about that EXACT location.
            - If the user says "Tel Aviv, Israel" - write ONLY about Tel Aviv, NOT Jerusalem or any other city.
            - If the user says "Paris, France" - write ONLY about Paris, NOT Lyon or any other city.
            - Never guess or assume a different location than what is specified.
            
            CRITICAL: Output ONLY the final 2-sentence description. Do NOT include thinking, revisions, or explanations.
            """)
    )

    @objc func generateDescription(_ call: CAPPluginCall) {
        guard let placeName = call.getString("placeName"),
              let city = call.getString("city"),
              let country = call.getString("country") else {
            call.reject("Missing required parameters: placeName, city, or country")
            return
        }

        let category = call.getString("category") ?? "Attraction"
        
        let userPrompt = """
        Write a brief description for: \(placeName)
        LOCATION: \(city), \(country)
        Category: \(category)
        
        Remember: This place is in \(city), \(country). Write ONLY about this specific location.
        """

        Task {
            do {
                NSLog("[FirebaseAIPlugin] Generating for: \(placeName) in \(city), \(country)")
                
                let response = try await model.generateContent(userPrompt)
                
                guard let text = response.text else {
                    call.reject("Failed to get text from Gemini")
                    return
                }

                NSLog("[FirebaseAIPlugin] Success: \(text.prefix(50))...")
                
                call.resolve([
                    "content": text.trimmingCharacters(in: .whitespacesAndNewlines),
                    "groundingSources": [] as [String],
                    "thoughtSignature": "gemini-3-flash-vertex"
                ])
                
            } catch {
                NSLog("[FirebaseAIPlugin] Error: \(error.localizedDescription)")
                call.reject("Gemini generation failed: \(error.localizedDescription)")
            }
        }
    }
}
