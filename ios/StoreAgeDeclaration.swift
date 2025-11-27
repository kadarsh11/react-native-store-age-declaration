// DeclaredAgeRange framework requires iOS 26.0+ and com.apple.developer.declared-age-range entitlement
#if canImport(DeclaredAgeRange)
import DeclaredAgeRange
#endif
import React

/**
 * iOS implementation for Store Age Declaration
 * Provides age verification using iOS Declared Age Range API (iOS 26.0+)
 * 
 * @see https://developer.apple.com/documentation/declaredagerange
 * 
 * Requirements:
 * - iOS 26.0+, iPadOS 26.0+, macOS 26.0+, or Mac Catalyst 26.0+
 * - Xcode 26+ (for iOS 26 SDK)
 * - Entitlement: com.apple.developer.declared-age-range = true
 * 
 * Important: Age data is based on information declared by end users or their parent/guardian.
 * You are solely responsible for ensuring compliance with laws and regulations.
 */
@objc(StoreAgeDeclarationSwift)
public class StoreAgeDeclarationSwift: NSObject {
  
  /**
   * Requests age range declaration from iOS Declared Age Range API
   * 
   * Uses AgeRangeService to request a person's declared age range.
   * For children in Family Sharing, parents/guardians control sharing preferences.
   * 
   * @param firstThresholdAge First age threshold (e.g., 13)
   * @param secondThresholdAge Second age threshold (e.g., 17)
   * @param thirdThresholdAge Third age threshold (e.g., 21)
   * @param resolve RCT promise resolve callback
   * @param reject RCT promise reject callback
   * 
   * @see https://developer.apple.com/documentation/declaredagerange/agerangeservice
   */
  @objc
  public func requestIOSDeclaredAgeRange(
    _ firstThresholdAge: NSNumber,
    secondThresholdAge: NSNumber,
    thirdThresholdAge: NSNumber,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    print("[StoreAgeDeclaration] requestIOSDeclaredAgeRange called")
    // Check iOS version - Declared Age Range requires iOS 26.0+
    if #available(iOS 26.0, *) {
      // Framework import check - only available in iOS 26+ SDK
      #if canImport(DeclaredAgeRange)
      Task { @MainActor in
        print("[StoreAgeDeclaration] Inside Task")
        do {
          guard let viewController = self.topViewController() else {
             print("[StoreAgeDeclaration] Failed to find top view controller")
             reject("VIEW_CONTROLLER_ERROR", "Could not find top view controller to present UI", nil)
             return
          }

          // Request the age range using AgeRangeService
          print("[StoreAgeDeclaration] Requesting age range from AgeRangeService", firstThresholdAge, secondThresholdAge, thirdThresholdAge)
          
          let thresholds = [
            firstThresholdAge.intValue,
            secondThresholdAge.intValue,
            thirdThresholdAge.intValue
          ].sorted()
          let firstThreshold = Int(firstThresholdAge)

                 let secondThreshold = Int(secondThresholdAge)

                 let thirdThreshold = Int(thirdThresholdAge)
          
          print("[StoreAgeDeclaration] Thresholds: \(thresholds)", firstThreshold, secondThreshold, thirdThreshold)
          
          let response = try await AgeRangeService.shared.requestAgeRange(
            ageGates: firstThreshold, secondThreshold, thirdThreshold,
            in: viewController)

          
          print("[StoreAgeDeclaration] Received response from AgeRangeService")
          
          // Process the result
          var statusString = "declined"
          var lowerBound: Int? = nil
          var upperBound: Int? = nil
          var declarationType: String? = nil
          var parentControls: String? = nil
          
          switch response {
          case .sharing(let declaration):
            print("[StoreAgeDeclaration] Response: sharing")
            if let declarationStatus = declaration.ageRangeDeclaration {
                statusString = String(describing: declarationStatus)
            } else {
                statusString = "unknown"
            }
            
            lowerBound = declaration.lowerBound
            upperBound = declaration.upperBound
            
            // Map parental controls
            let controlsRawValue = declaration.activeParentalControls.rawValue
            parentControls = "\(controlsRawValue)"
            
            print("lower bound", lowerBound)
            print("upper bound", upperBound)
            
            // We don't have direct access to 'declaration type' enum in the snippet, 
            // but we can infer or leave it nil if not available in the new API response.
            // The snippet uses 'declaration.ageRangeDeclaration' for status.
            
          case .declinedSharing:
            print("[StoreAgeDeclaration] Response: declinedSharing")
            statusString = "declined"
          }
          
          let result: [String: Any?] = [
            "status": statusString,
            "lowerBound": lowerBound,
            "upperBound": upperBound,
            "declaration": declarationType, // Might be nil now if not in response
            "parentControls": parentControls
          ]
          
          print("[StoreAgeDeclaration] Resolving promise with result: \(result)")
          resolve(result)
          
        } catch {
          print("[StoreAgeDeclaration] Error: \(error)")
          // Handle errors (e.g., user cancellation, system errors)
          reject(
            "AGE_RANGE_ERROR",
            "Failed to request age range: \(error.localizedDescription)",
            error
          )
        }
      }
      #else
      print("[StoreAgeDeclaration] DeclaredAgeRange framework not available")
      // DeclaredAgeRange framework not available in current build
      reject(
        "SDK_NOT_AVAILABLE",
        "Declared Age Range API requires iOS 26.0+ SDK. Please build with Xcode 26 or later with iOS 26 SDK. Current iOS version: \(UIDevice.current.systemVersion)",
        nil as Error?
      )
      #endif
    } else {
      print("[StoreAgeDeclaration] iOS version too low: \(UIDevice.current.systemVersion)")
      // iOS version is below 26.0
      reject(
        "IOS_VERSION_ERROR",
        "Declared Age Range API requires iOS 26.0 or later. Current version: \(UIDevice.current.systemVersion). Consider using a fallback age verification method.",
        nil as Error?
      )
    }
  }
  
  /**
   * Helper method to get the top-most view controller
   * Required for presenting the age verification UI
   */
  private func topViewController() -> UIViewController? {
    guard let windowScene = UIApplication.shared.connectedScenes
      .compactMap({ $0 as? UIWindowScene })
      .first(where: { $0.activationState == .foregroundActive }),
          let window = windowScene.windows.first(where: { $0.isKeyWindow }),
          let rootViewController = window.rootViewController else {
      return nil
    }
    
    var topController = rootViewController
    while let presentedViewController = topController.presentedViewController {
      topController = presentedViewController
    }
    
    return topController
  }
}
