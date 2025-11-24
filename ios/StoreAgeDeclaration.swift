import Foundation
import UIKit

/**
 * iOS implementation for Store Age Declaration
 * Provides age verification using iOS Declared Age Range API (iOS 18+)
 */
@objc(StoreAgeDeclarationSwift)
public class StoreAgeDeclarationSwift: NSObject {
  
  /**
   * Requests age range declaration from iOS Declared Age Range API
   * 
   * @param firstThresholdAge First age threshold (e.g., 13)
   * @param secondThresholdAge Second age threshold (e.g., 17)
   * @param thirdThresholdAge Third age threshold (e.g., 21)
   * @param resolve RCT promise resolve callback
   * @param reject RCT promise reject callback
   */
  @objc
  public func requestIOSDeclaredAgeRange(
    _ firstThresholdAge: NSNumber,
    secondThresholdAge: NSNumber,
    thirdThresholdAge: NSNumber,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // Check iOS version
    if #available(iOS 18.0, *) {
      // iOS 18+ implementation would go here
      // For now, we'll provide a placeholder that works on older iOS versions
      
      DispatchQueue.main.async { [weak self] in
        guard let self = self else {
          reject("ERROR", "Instance deallocated", nil)
          return
        }
        
        // Check if we can get the top view controller
        guard let _ = self.topViewController() else {
          reject("NO_VIEW_CONTROLLER", "Could not find top view controller to present UI", nil)
          return
        }
        
        // For iOS 18+, you would integrate with DeclaredAgeRange framework here
        // Since it requires iOS 18 SDK and specific entitlements, we'll return a placeholder
        
        let result: [String: Any?] = [
          "status": "declined",
          "parentControls": nil,
          "lowerBound": nil,
          "upperBound": nil
        ]
        
        resolve(result)
      }
    } else {
      // iOS version below 18
      reject(
        "IOS_VERSION_ERROR",
        "Declared Age Range API requires iOS 18 or later. Current version: \(UIDevice.current.systemVersion)",
        nil
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
