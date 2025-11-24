package com.storeagedeclaration

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.module.annotations.ReactModule
import com.google.android.play.agesignals.AgeSignalsManagerFactory
import com.google.android.play.agesignals.AgeSignalsRequest

/**
 * React Native Turbo Module for Store Age Declaration
 * Provides access to Google Play Age Signals API for age-appropriate content filtering
 */
@ReactModule(name = StoreAgeDeclarationModule.NAME)
class StoreAgeDeclarationModule(reactContext: ReactApplicationContext) :
  NativeStoreAgeDeclarationSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  /**
   * Example multiplication method
   * @param a First number
   * @param b Second number
   * @return Product of a and b
   */
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  /**
   * Retrieves the age range declaration status from Google Play Age Signals API.
   * 
   * This method queries Google Play Services to determine if the user is above or below
   * the age threshold set for this application. The status is based on:
   * - Family Link parental controls
   * - Google account age information
   * - Play Store age declarations
   * 
   * The promise always resolves (never rejects) with a result object containing:
   * - installId: Unique identifier for this installation (not linked to user)
   * - userStatus: "OVER_AGE", "UNDER_AGE", or "UNKNOWN"
   * - error: Error message if operation failed, null otherwise
   * 
   * @param promise React Native Promise to resolve with the result
   * 
   * Success case:
   * {
   *   "installId": "uuid-string",
   *   "userStatus": "OVER_AGE" | "UNDER_AGE" | "UNKNOWN",
   *   "error": null
   * }
   * 
   * Error case:
   * {
   *   "installId": null,
   *   "userStatus": null,
   *   "error": "error message"
   * }
   * 
   * Common errors:
   * - AGE_SIGNALS_INIT_ERROR: Google Play Services unavailable or initialization failed
   * - Network errors: Connection or timeout issues
   * 
   * @see <a href="https://developer.android.com/guide/playcore/age-signals">Google Play Age Signals</a>
   */
  override fun getAndroidPlayAgeRangeStatus(promise: Promise) {
    try {
      // Get application context for Age Signals Manager
      val appContext = reactApplicationContext.applicationContext
      
      // Create Age Signals Manager instance
      val manager = AgeSignalsManagerFactory.create(appContext)
      
      // Build age signals request
      val request = AgeSignalsRequest.builder().build()
      
      // Query Age Signals API asynchronously
      manager.checkAgeSignals(request)
        .addOnSuccessListener { result ->
          // Successfully retrieved age signals
          val response = WritableNativeMap()
          response.putString("installId", result.installId())
          response.putString("userStatus", result.userStatus()?.toString() ?: "UNKNOWN")
          response.putNull("error")
          promise.resolve(response)
        }
        .addOnFailureListener { error ->
          // API call failed (network, service unavailable, etc.)
          Log.w(NAME, "Age Signals API call failed", error)
          val response = WritableNativeMap()
          response.putNull("installId")
          response.putNull("userStatus")
          response.putString("error", error.message ?: "Unknown error occurred")
          promise.resolve(response)
        }
    } catch (e: Exception) {
      // Initialization failed (likely Google Play Services not available)
      Log.e(NAME, "Error initializing Age Signals", e)
      val response = WritableNativeMap()
      response.putNull("installId")
      response.putNull("userStatus")
      response.putString("error", "AGE_SIGNALS_INIT_ERROR: ${e.message}")
      promise.resolve(response)
    }
  }

  /**
   * iOS-only method for Declared Age Range API.
   * Returns an error on Android as this API is not available.
   * 
   * @param firstThresholdAge First age threshold (unused on Android)
   * @param secondThresholdAge Second age threshold (unused on Android)
   * @param thirdThresholdAge Third age threshold (unused on Android)
   * @param promise React Native Promise to resolve with error
   */
  override fun requestIOSDeclaredAgeRange(
    firstThresholdAge: Double,
    secondThresholdAge: Double,
    thirdThresholdAge: Double,
    promise: Promise
  ) {
    // iOS-only method - return error on Android
    val response = WritableNativeMap()
    response.putNull("status")
    response.putNull("parentControls")
    response.putNull("lowerBound")
    response.putNull("upperBound")
    
    // Reject the promise as this is not supported on Android
    promise.reject(
      "PLATFORM_NOT_SUPPORTED",
      "requestIOSDeclaredAgeRange is only available on iOS. Use getAndroidPlayAgeRangeStatus on Android."
    )
  }

  companion object {
    const val NAME = "StoreAgeDeclaration"
  }
}
