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
   * Retrieves comprehensive age signals from Google Play Age Signals API (Beta).
   * 
   * This method queries Google Play Services to get detailed age verification information
   * including age ranges for supervised users and verification status for adults.
   * 
   * The API returns different data based on user type:
   * - VERIFIED users (18+): Only userStatus is set
   * - SUPERVISED users: userStatus + ageLower + ageUpper + installId + mostRecentApprovalDate
   * - UNKNOWN users: Only userStatus is set
   * 
   * The promise always resolves (never rejects) with all available fields.
   * 
   * @param promise React Native Promise to resolve with the result
   * 
   * @see <a href="https://developer.android.com/google/play/age-signals/use-age-signals-api">Play Age Signals API</a>
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
          
          // Install ID (supervised users only)
          val installId = result.installId()
          if (installId != null && installId.isNotEmpty()) {
            response.putString("installId", installId)
          } else {
            response.putNull("installId")
          }
          
          // User Status (all users)
          val userStatus = result.userStatus()
          if (userStatus != null) {
            response.putString("userStatus", userStatus.toString())
          } else {
            response.putString("userStatus", "")
          }
          
          // Age Lower bound (supervised users only)
          val ageLower = result.ageLower()
          if (ageLower != null) {
            response.putInt("ageLower", ageLower)
          } else {
            response.putNull("ageLower")
          }
          
          // Age Upper bound (supervised users only)
          val ageUpper = result.ageUpper()
          if (ageUpper != null) {
            response.putInt("ageUpper", ageUpper)
          } else {
            response.putNull("ageUpper")
          }
          
          // Most Recent Approval Date (supervised users with approved changes)
          val approvalDate = result.mostRecentApprovalDate()
          if (approvalDate != null) {
            // Convert Java Date to ISO 8601 date string (YYYY-MM-DD)
            val dateFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
            response.putString("mostRecentApprovalDate", dateFormat.format(approvalDate))
          } else {
            response.putNull("mostRecentApprovalDate")
          }
          
          // No error
          response.putNull("error")
          response.putNull("errorCode")
          
          promise.resolve(response)
        }
        .addOnFailureListener { error ->
          // API call failed (network, service unavailable, etc.)
          Log.w(NAME, "Age Signals API call failed", error)
          
          val response = WritableNativeMap()
          response.putNull("installId")
          response.putNull("userStatus")
          response.putNull("ageLower")
          response.putNull("ageUpper")
          response.putNull("mostRecentApprovalDate")
          
          // Parse error code if available
          val errorMessage = error.message ?: "Unknown error occurred"
          response.putString("error", errorMessage)
          
          // Try to extract error code from exception
          try {
            if (error is com.google.android.gms.common.api.ApiException) {
              response.putInt("errorCode", error.statusCode)
            } else {
              response.putNull("errorCode")
            }
          } catch (e: Exception) {
            response.putNull("errorCode")
          }
          
          promise.resolve(response)
        }
    } catch (e: Exception) {
      // Initialization failed (likely Google Play Services not available)
      Log.e(NAME, "Error initializing Age Signals", e)
      
      val response = WritableNativeMap()
      response.putNull("installId")
      response.putNull("userStatus")
      response.putNull("ageLower")
      response.putNull("ageUpper")
      response.putNull("mostRecentApprovalDate")
      response.putString("error", "AGE_SIGNALS_INIT_ERROR: ${e.message}")
      response.putNull("errorCode")
      
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
