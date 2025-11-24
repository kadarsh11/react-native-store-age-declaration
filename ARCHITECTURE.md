# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Your React Native App                 │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │         UI Components / Screens                │   │
│  │  - Content Filtering                           │   │
│  │  - Age Gate UI                                 │   │
│  │  - Conditional Rendering                       │   │
│  └────────────────┬───────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────┐   │
│  │         Context Provider (Optional)            │   │
│  │  - AgeGateProvider                             │   │
│  │  - Caching Logic                               │   │
│  │  - State Management                            │   │
│  └────────────────┬───────────────────────────────┘   │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────┐   │
│  │    react-native-store-age-declaration          │   │
│  │    (This Library)                              │   │
│  │                                                 │   │
│  │  getAndroidPlayAgeRangeStatus()                │   │
│  └────────────────┬───────────────────────────────┘   │
└───────────────────┼──────────────────────────────────┘
                    │
                    │ React Native Bridge
                    │
┌───────────────────▼──────────────────────────────────┐
│              Native Android Module                    │
│              StoreAgeDeclarationModule                │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  Kotlin Implementation                        │   │
│  │  - Error Handling                             │   │
│  │  - Promise Management                         │   │
│  │  - Data Transformation                        │   │
│  └──────────────┬───────────────────────────────┘   │
└─────────────────┼────────────────────────────────────┘
                  │
                  │ Android API Call
                  │
┌─────────────────▼────────────────────────────────────┐
│         Google Play Age Signals API                   │
│         (com.google.android.play:agesignals)          │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  AgeSignalsManager                            │   │
│  │  - checkAgeSignals()                          │   │
│  │  - Returns installId & userStatus             │   │
│  └──────────────┬───────────────────────────────┘   │
└─────────────────┼────────────────────────────────────┘
                  │
                  │ Platform Data Sources
                  │
┌─────────────────▼────────────────────────────────────┐
│            Google Services & Data                     │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Family Link  │  │Google Account│  │ Play Store │ │
│  │   Settings   │  │  Age Data    │  │Declarations│ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└───────────────────────────────────────────────────────┘
```

## Data Flow

### Request Flow

```
User Action
    │
    ▼
React Component
    │
    │ calls getAndroidPlayAgeRangeStatus()
    ▼
TypeScript API Layer
    │
    │ via Turbo Module Bridge
    ▼
Native Kotlin Module
    │
    │ creates AgeSignalsManager
    │ builds AgeSignalsRequest
    ▼
Google Play Services
    │
    │ queries age data
    ▼
Family Link / Account Data
    │
    │ returns age status
    ▼
Google Play Services
    │
    │ Success or Failure callback
    ▼
Native Kotlin Module
    │
    │ formats response
    │ {installId, userStatus, error}
    ▼
TypeScript API Layer
    │
    │ Promise resolves
    ▼
React Component
    │
    │ updates UI
    ▼
User sees filtered content
```

### Response Flow

```
┌─────────────────────────────────────────┐
│         Age Status Response             │
└─────────────────┬───────────────────────┘
                  │
          ┌───────┴────────┐
          │                │
    ┌─────▼─────┐    ┌────▼─────┐
    │  Success  │    │  Error   │
    └─────┬─────┘    └────┬─────┘
          │                │
          │                ▼
          │          {
          │            installId: null,
          │            userStatus: null,
          │            error: "message"
          │          }
          │
          ▼
    {
      installId: "uuid",
      userStatus: "OVER_AGE" | "UNDER_AGE" | "UNKNOWN",
      error: null
    }
          │
          ▼
    ┌─────┴──────┬──────────┬──────────┐
    │            │          │          │
    ▼            ▼          ▼          ▼
OVER_AGE    UNDER_AGE   UNKNOWN    Handle
    │            │          │       Error
    ▼            ▼          ▼          │
Show All    Show Kids  Show Safe      │
Content     Content    Content        │
    │            │          │          │
    └────────────┴──────────┴──────────┘
                  │
                  ▼
           User Experience
```

## Component Architecture

### Recommended Structure

```
src/
├── services/
│   └── AgeGateService.ts          # Business logic
│       ├── getAgeStatus()
│       ├── caching logic
│       └── error handling
│
├── contexts/
│   └── AgeGateContext.tsx         # State management
│       ├── AgeGateProvider
│       ├── useAgeGate hook
│       └── global state
│
├── components/
│   ├── AgeGate.tsx                # Age gate UI
│   ├── ContentFilter.tsx          # Content filtering
│   └── AgeRestrictedContent.tsx   # Conditional content
│
├── screens/
│   ├── HomeScreen.tsx
│   ├── ContentScreen.tsx
│   └── SettingsScreen.tsx
│
└── utils/
    ├── contentRating.ts           # Rating logic
    └── analytics.ts               # Tracking
```

### Service Layer Pattern

```typescript
┌──────────────────────────────────────┐
│      AgeGateService                  │
│  (Singleton Pattern)                 │
├──────────────────────────────────────┤
│                                      │
│  - cachedStatus: AgeStatus           │
│  - cacheTimestamp: number            │
│  - CACHE_DURATION: constant          │
│                                      │
│  + getAgeStatus(): Promise<Status>   │
│  + clearCache(): void                │
│  - isCacheValid(): boolean           │
│                                      │
└──────────────────────────────────────┘
           │
           │ uses
           ▼
┌──────────────────────────────────────┐
│  react-native-store-age-declaration  │
├──────────────────────────────────────┤
│                                      │
│  getAndroidPlayAgeRangeStatus()     │
│                                      │
└──────────────────────────────────────┘
```

### Context Provider Pattern

```typescript
┌─────────────────────────────────────────┐
│         App Component                   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   <AgeGateProvider>               │ │
│  │                                   │ │
│  │     ┌─────────────────────────┐  │ │
│  │     │   <Navigation>          │  │ │
│  │     │                         │  │ │
│  │     │   ┌─────────────────┐  │  │ │
│  │     │   │  <HomeScreen>   │  │  │ │
│  │     │   │                 │  │  │ │
│  │     │   │  useAgeGate()   │  │  │ │
│  │     │   └─────────────────┘  │  │ │
│  │     │                         │  │ │
│  │     │   ┌─────────────────┐  │  │ │
│  │     │   │  <GameScreen>   │  │  │ │
│  │     │   │                 │  │  │ │
│  │     │   │  useAgeGate()   │  │  │ │
│  │     │   └─────────────────┘  │  │ │
│  │     └─────────────────────────┘  │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## State Management

### State Flow

```
App Startup
    │
    ▼
AgeGateProvider mounts
    │
    │ useEffect
    ▼
Call getAgeStatus()
    │
    ├──► Check cache
    │      │
    │      ├─► Valid cache?
    │      │     │
    │      │     ├─► Yes: Return cached
    │      │     │
    │      │     └─► No: Fetch new
    │      │           │
    ▼      ▼           ▼
Call native method
    │
    ▼
Update state
    │
    ├─► ageStatus
    ├─► isLoading
    ├─► isAdult
    └─► isChild
    │
    ▼
Children re-render
    │
    ▼
Content filtered based on age
```

## Caching Strategy

```
┌─────────────────────────────────────────┐
│         Cache Architecture              │
└─────────────────┬───────────────────────┘
                  │
          ┌───────┴────────┐
          │                │
    ┌─────▼─────┐    ┌────▼─────┐
    │ In-Memory │    │ Timestamp│
    │   Cache   │    │  Check   │
    └─────┬─────┘    └────┬─────┘
          │                │
          ▼                ▼
    cachedStatus    cacheTimestamp
          │                │
          └────────┬───────┘
                   │
            ┌──────▼──────┐
            │  Is Valid?  │
            └──────┬──────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼─────┐      ┌─────▼────┐
    │   Yes    │      │    No    │
    │  Return  │      │  Fetch   │
    │  Cached  │      │   New    │
    └──────────┘      └──────────┘
```

## Error Handling Flow

```
Call getAndroidPlayAgeRangeStatus()
    │
    ├─► Try
    │    │
    │    ├─► Initialize Manager
    │    │    │
    │    │    ├─► Success
    │    │    │    │
    │    │    │    ├─► Make API Call
    │    │    │    │    │
    │    │    │    │    ├─► Success
    │    │    │    │    │    │
    │    │    │    │    │    └─► Return Data
    │    │    │    │    │
    │    │    │    │    └─► Failure
    │    │    │    │         │
    │    │    │    │         └─► Return Error
    │    │    │
    │    │    └─► Failure
    │    │         │
    │    │         └─► Throw Exception
    │
    └─► Catch
         │
         └─► Return Init Error
```

## Integration Points

### 1. React Native Bridge

```
TypeScript ←→ Bridge ←→ Kotlin
   │                      │
   │ Promise              │ Promise callback
   │                      │
   └──────────────────────┘
```

### 2. Google Play Services

```
Your App ←→ Age Signals API ←→ Google Services
   │              │                  │
   │         AgeSignalsManager       │
   │              │                  │
   └──────────────┴──────────────────┘
```

### 3. Data Sources

```
Age Signals API
    │
    ├─► Family Link API
    │   └─► Parent-managed accounts
    │
    ├─► Google Account API
    │   └─► Account age data
    │
    └─► Play Store API
        └─► Self-reported age
```

## Platform Architecture

### Android (Current)

```
React Native App
    │
    ├─► JavaScript Layer
    │   └─► src/index.tsx
    │
    ├─► Bridge Layer
    │   └─► Turbo Module
    │
    ├─► Native Layer
    │   └─► StoreAgeDeclarationModule.kt
    │
    └─► Google Play Services
        └─► Age Signals API
```

### iOS (Future)

```
React Native App
    │
    ├─► JavaScript Layer
    │   └─► src/index.tsx
    │
    ├─► Bridge Layer
    │   └─► Turbo Module
    │
    ├─► Native Layer
    │   └─► StoreAgeDeclaration.mm
    │
    └─► iOS APIs
        ├─► Screen Time API
        └─► Family Sharing API
```

---

## Performance Considerations

### Optimization Points

1. **Caching**: 30-minute default cache
2. **Lazy Loading**: Only fetch when needed
3. **Async Operations**: Non-blocking UI
4. **Error Recovery**: Graceful fallbacks
5. **Memory**: Minimal footprint

### Timing

```
First Call:
├─► Network Request: 100-500ms
├─► Processing: 10-50ms
└─► Total: ~150-550ms

Cached Call:
├─► Cache Lookup: 1-5ms
├─► Processing: 1-5ms
└─► Total: ~2-10ms
```

---

For more details, see:
- [API Documentation](./API.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [README](./README.md)
