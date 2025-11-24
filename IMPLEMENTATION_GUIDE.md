# Implementation Guide

This guide walks you through implementing age-appropriate content filtering in your React Native app using `react-native-store-age-declaration`.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Complete Implementation](#complete-implementation)
3. [Real-World Examples](#real-world-examples)
4. [Testing Strategy](#testing-strategy)
5. [Production Checklist](#production-checklist)

---

## Quick Start

### Step 1: Install the Package

```bash
npm install react-native-store-age-declaration
# or
yarn add react-native-store-age-declaration
```

### Step 2: Rebuild Your App

```bash
# Android
cd android && ./gradlew clean && cd ..
npx react-native run-android

# iOS (when available)
cd ios && pod install && cd ..
npx react-native run-ios
```

### Step 3: Basic Usage

```typescript
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

async function checkUserAge() {
  const result = await getAndroidPlayAgeRangeStatus();
  
  if (result.userStatus === 'OVER_AGE') {
    // User is above age threshold
    showAllContent();
  } else {
    // User is under age or unknown - show safe content
    showAgeAppropriateContent();
  }
}
```

---

## Complete Implementation

### Architecture Overview

```
┌─────────────────────────────────────┐
│         Your React Native App       │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  react-native-store-age-declaration │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│     Google Play Age Signals API     │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Family Link / Account Age Data     │
└─────────────────────────────────────┘
```

### Step-by-Step Implementation

#### 1. Create an Age Gate Service

```typescript
// services/AgeGateService.ts
import { Platform } from 'react-native';
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

export type AgeStatus = 'ADULT' | 'CHILD' | 'UNKNOWN';

class AgeGateService {
  private cachedStatus: AgeStatus | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Get the user's age status
   * @param forceRefresh - Skip cache and fetch fresh data
   */
  async getAgeStatus(forceRefresh: boolean = false): Promise<AgeStatus> {
    // Check cache first
    if (!forceRefresh && this.isCacheValid()) {
      return this.cachedStatus!;
    }

    // Platform-specific implementation
    if (Platform.OS === 'android') {
      return await this.getAndroidAgeStatus();
    } else {
      // iOS implementation (when available)
      return 'UNKNOWN';
    }
  }

  private async getAndroidAgeStatus(): Promise<AgeStatus> {
    try {
      const result = await getAndroidPlayAgeRangeStatus();

      if (result.error) {
        console.warn('Age status error:', result.error);
        return this.cacheAndReturn('UNKNOWN');
      }

      switch (result.userStatus) {
        case 'OVER_AGE':
          return this.cacheAndReturn('ADULT');
        case 'UNDER_AGE':
          return this.cacheAndReturn('CHILD');
        default:
          return this.cacheAndReturn('UNKNOWN');
      }
    } catch (error) {
      console.error('Failed to get age status:', error);
      return this.cacheAndReturn('UNKNOWN');
    }
  }

  private cacheAndReturn(status: AgeStatus): AgeStatus {
    this.cachedStatus = status;
    this.cacheTimestamp = Date.now();
    return status;
  }

  private isCacheValid(): boolean {
    if (!this.cachedStatus) return false;
    const age = Date.now() - this.cacheTimestamp;
    return age < this.CACHE_DURATION;
  }

  clearCache() {
    this.cachedStatus = null;
    this.cacheTimestamp = 0;
  }
}

export const ageGateService = new AgeGateService();
```

#### 2. Create a Context Provider

```typescript
// contexts/AgeGateContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ageGateService, type AgeStatus } from '../services/AgeGateService';

interface AgeGateContextValue {
  ageStatus: AgeStatus;
  isLoading: boolean;
  isAdult: boolean;
  isChild: boolean;
  refresh: () => Promise<void>;
}

const AgeGateContext = createContext<AgeGateContextValue | undefined>(undefined);

export function AgeGateProvider({ children }: { children: React.ReactNode }) {
  const [ageStatus, setAgeStatus] = useState<AgeStatus>('UNKNOWN');
  const [isLoading, setIsLoading] = useState(true);

  const loadAgeStatus = async () => {
    setIsLoading(true);
    try {
      const status = await ageGateService.getAgeStatus();
      setAgeStatus(status);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgeStatus();
  }, []);

  const refresh = async () => {
    ageGateService.clearCache();
    await loadAgeStatus();
  };

  const value: AgeGateContextValue = {
    ageStatus,
    isLoading,
    isAdult: ageStatus === 'ADULT',
    isChild: ageStatus === 'CHILD',
    refresh,
  };

  return (
    <AgeGateContext.Provider value={value}>
      {children}
    </AgeGateContext.Provider>
  );
}

export function useAgeGate() {
  const context = useContext(AgeGateContext);
  if (!context) {
    throw new Error('useAgeGate must be used within AgeGateProvider');
  }
  return context;
}
```

#### 3. Wrap Your App

```typescript
// App.tsx
import React from 'react';
import { AgeGateProvider } from './contexts/AgeGateContext';
import MainNavigator from './navigation/MainNavigator';

export default function App() {
  return (
    <AgeGateProvider>
      <MainNavigator />
    </AgeGateProvider>
  );
}
```

#### 4. Use in Components

```typescript
// screens/HomeScreen.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useAgeGate } from '../contexts/AgeGateContext';

interface GameItem {
  id: string;
  title: string;
  rating: 'EVERYONE' | 'TEEN' | 'MATURE';
}

const GAMES: GameItem[] = [
  { id: '1', title: 'Kids Puzzle', rating: 'EVERYONE' },
  { id: '2', title: 'Teen Racing', rating: 'TEEN' },
  { id: '3', title: 'Action Shooter', rating: 'MATURE' },
];

export default function HomeScreen() {
  const { isAdult, isChild, isLoading, ageStatus } = useAgeGate();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Checking age status...</Text>
      </View>
    );
  }

  // Filter games based on age
  const filteredGames = GAMES.filter(game => {
    if (isAdult) return true; // Adults see everything
    if (isChild) return game.rating === 'EVERYONE'; // Kids see only everyone-rated
    // Unknown - be conservative
    return game.rating === 'EVERYONE';
  });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Available Games
      </Text>
      
      {ageStatus === 'UNKNOWN' && (
        <View style={{ padding: 12, backgroundColor: '#FFF3CD', marginBottom: 16 }}>
          <Text>Showing age-appropriate content for all ages</Text>
        </View>
      )}

      <FlatList
        data={filteredGames}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 16, backgroundColor: '#f5f5f5', marginBottom: 8 }}>
            <Text style={{ fontSize: 18 }}>{item.title}</Text>
            <Text style={{ color: '#666' }}>{item.rating}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

---

## Real-World Examples

### Example 1: Gaming App with Age Ratings

```typescript
// models/Game.ts
export interface Game {
  id: string;
  title: string;
  description: string;
  ageRating: number; // Minimum age
  imageUrl: string;
}

// services/GameService.ts
import { ageGateService } from './AgeGateService';

class GameService {
  async getAvailableGames(): Promise<Game[]> {
    const allGames = await this.fetchAllGames();
    const ageStatus = await ageGateService.getAgeStatus();

    // Filter based on age status
    if (ageStatus === 'CHILD') {
      // Show only games rated for 12 and under
      return allGames.filter(game => game.ageRating <= 12);
    } else if (ageStatus === 'ADULT') {
      // Show all games
      return allGames;
    } else {
      // Unknown - show only universal content
      return allGames.filter(game => game.ageRating <= 7);
    }
  }

  private async fetchAllGames(): Promise<Game[]> {
    // Your API call here
    return [];
  }
}
```

### Example 2: Social Media App with Content Filtering

```typescript
// components/ContentFeed.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import { useAgeGate } from '../contexts/AgeGateContext';

interface Post {
  id: string;
  content: string;
  isMature: boolean;
}

export function ContentFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { isAdult, isLoading } = useAgeGate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const allPosts = await fetchPosts();
    setPosts(allPosts);
  };

  // Filter posts on render
  const visiblePosts = posts.filter(post => {
    // Adults see everything
    if (isAdult) return true;
    // Non-adults only see non-mature content
    return !post.isMature;
  });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <FlatList
      data={visiblePosts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 1 }}>
          <Text>{item.content}</Text>
          {item.isMature && <Text style={{ fontSize: 10 }}>18+</Text>}
        </View>
      )}
    />
  );
}
```

### Example 3: E-commerce App with Age-Restricted Products

```typescript
// screens/ProductListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { useAgeGate } from '../contexts/AgeGateContext';

interface Product {
  id: string;
  name: string;
  price: number;
  ageRestricted: boolean; // e.g., alcohol, tobacco
}

export function ProductListScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const { isAdult, ageStatus } = useAgeGate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const allProducts = await fetchProducts();
    setProducts(allProducts);
  };

  const visibleProducts = products.filter(product => {
    // Show age-restricted products only to verified adults
    if (product.ageRestricted) {
      return isAdult;
    }
    return true;
  });

  return (
    <View>
      {ageStatus === 'UNKNOWN' && (
        <View style={{ padding: 12, backgroundColor: '#f0f0f0' }}>
          <Text>Some products may be hidden due to age restrictions</Text>
        </View>
      )}
      
      <FlatList
        data={visibleProducts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
      />
    </View>
  );
}
```

### Example 4: Video Streaming App

```typescript
// services/ContentRatingService.ts
import { ageGateService, type AgeStatus } from './AgeGateService';

export type ContentRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';

class ContentRatingService {
  private ratingToMinAge: Record<ContentRating, number> = {
    'G': 0,
    'PG': 7,
    'PG-13': 13,
    'R': 17,
    'NC-17': 18,
  };

  async canWatchContent(rating: ContentRating): Promise<boolean> {
    const ageStatus = await ageGateService.getAgeStatus();
    
    switch (ageStatus) {
      case 'ADULT':
        return true; // Adults can watch everything
      
      case 'CHILD':
        // Children can only watch G and PG
        return rating === 'G' || rating === 'PG';
      
      case 'UNKNOWN':
        // Unknown - only allow G rated content
        return rating === 'G';
      
      default:
        return false;
    }
  }

  async filterVideos<T extends { rating: ContentRating }>(
    videos: T[]
  ): Promise<T[]> {
    const results = await Promise.all(
      videos.map(async video => ({
        video,
        allowed: await this.canWatchContent(video.rating),
      }))
    );

    return results
      .filter(result => result.allowed)
      .map(result => result.video);
  }
}

export const contentRatingService = new ContentRatingService();
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/AgeGateService.test.ts
import { ageGateService } from '../services/AgeGateService';
import { getAndroidPlayAgeRangeStatus } from 'react-native-store-age-declaration';

jest.mock('react-native-store-age-declaration');

describe('AgeGateService', () => {
  beforeEach(() => {
    ageGateService.clearCache();
    jest.clearAllMocks();
  });

  it('should return ADULT for OVER_AGE status', async () => {
    (getAndroidPlayAgeRangeStatus as jest.Mock).mockResolvedValue({
      installId: 'test-id',
      userStatus: 'OVER_AGE',
      error: null,
    });

    const status = await ageGateService.getAgeStatus();
    expect(status).toBe('ADULT');
  });

  it('should return CHILD for UNDER_AGE status', async () => {
    (getAndroidPlayAgeRangeStatus as jest.Mock).mockResolvedValue({
      installId: 'test-id',
      userStatus: 'UNDER_AGE',
      error: null,
    });

    const status = await ageGateService.getAgeStatus();
    expect(status).toBe('CHILD');
  });

  it('should return UNKNOWN on error', async () => {
    (getAndroidPlayAgeRangeStatus as jest.Mock).mockResolvedValue({
      installId: null,
      userStatus: null,
      error: 'Test error',
    });

    const status = await ageGateService.getAgeStatus();
    expect(status).toBe('UNKNOWN');
  });

  it('should cache results', async () => {
    (getAndroidPlayAgeRangeStatus as jest.Mock).mockResolvedValue({
      installId: 'test-id',
      userStatus: 'OVER_AGE',
      error: null,
    });

    await ageGateService.getAgeStatus();
    await ageGateService.getAgeStatus();

    expect(getAndroidPlayAgeRangeStatus).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
// __tests__/ContentFilter.integration.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AgeGateProvider } from '../contexts/AgeGateContext';
import { HomeScreen } from '../screens/HomeScreen';

describe('Content Filtering Integration', () => {
  it('should show all content for adults', async () => {
    const { getByText, queryByText } = render(
      <AgeGateProvider>
        <HomeScreen />
      </AgeGateProvider>
    );

    await waitFor(() => {
      expect(getByText('Kids Puzzle')).toBeTruthy();
      expect(getByText('Teen Racing')).toBeTruthy();
      expect(getByText('Action Shooter')).toBeTruthy();
    });
  });

  it('should hide mature content for children', async () => {
    // Mock as child
    jest.mock('react-native-store-age-declaration', () => ({
      getAndroidPlayAgeRangeStatus: () => Promise.resolve({
        installId: 'test',
        userStatus: 'UNDER_AGE',
        error: null,
      }),
    }));

    const { getByText, queryByText } = render(
      <AgeGateProvider>
        <HomeScreen />
      </AgeGateProvider>
    );

    await waitFor(() => {
      expect(getByText('Kids Puzzle')).toBeTruthy();
      expect(queryByText('Action Shooter')).toBeNull();
    });
  });
});
```

### Manual Testing Checklist

- [ ] Test with Family Link child account
- [ ] Test with Family Link adult account
- [ ] Test with regular Google account
- [ ] Test with no Google account signed in
- [ ] Test on device without Google Play Services
- [ ] Test with airplane mode (offline)
- [ ] Test app restart (cache persistence)
- [ ] Test account switching

---

## Production Checklist

### Pre-Launch

- [ ] **Legal Review**: Consult legal counsel for age verification compliance
- [ ] **Privacy Policy**: Update to mention age verification usage
- [ ] **Analytics**: Add tracking for age status distribution
- [ ] **Fallback Content**: Ensure safe defaults for UNKNOWN status
- [ ] **Error Handling**: All error paths have user-friendly messages
- [ ] **Testing**: Test on multiple devices and Android versions
- [ ] **Performance**: Verify caching works correctly
- [ ] **Documentation**: Update app store listing with age requirements

### Configuration

```typescript
// config/ageGate.config.ts
export const AGE_GATE_CONFIG = {
  // Cache duration in milliseconds
  CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Default behavior
  DEFAULT_STATUS: 'UNKNOWN', // What to show when status can't be determined
  STRICT_MODE: false, // If true, hide ALL content when UNKNOWN
  
  // Analytics
  TRACK_AGE_CHECKS: true,
  TRACK_CONTENT_FILTERING: true,
};
```

### Monitoring

Set up monitoring for:

```typescript
// utils/monitoring.ts
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

export async function logAgeCheckResult(
  result: PlayAgeRangeStatusResult
) {
  // Log to analytics
  await analytics().logEvent('age_check_completed', {
    status: result.userStatus,
    has_error: !!result.error,
    error_type: result.error?.split(':')[0],
  });

  // Log errors to crashlytics
  if (result.error) {
    crashlytics().log(`Age check error: ${result.error}`);
  }
}
```

### Post-Launch

- [ ] Monitor error rates
- [ ] Track age status distribution
- [ ] Gather user feedback
- [ ] Monitor content filtering accuracy
- [ ] Check performance metrics
- [ ] Review privacy compliance

---

## Troubleshooting Common Issues

### Issue: Always returns UNKNOWN

**Causes:**
- User not signed in to Google account
- Family Link not set up
- Google Play Services unavailable

**Solutions:**
1. Check if user is signed in
2. Provide manual age verification as fallback
3. Test on different devices

### Issue: Slow Response Times

**Solutions:**
```typescript
// Implement request timeout
const TIMEOUT_MS = 5000;

async function getAgeStatusWithTimeout(): Promise<PlayAgeRangeStatusResult> {
  const timeoutPromise = new Promise<PlayAgeRangeStatusResult>((resolve) => {
    setTimeout(() => {
      resolve({
        installId: null,
        userStatus: null,
        error: 'Timeout',
      });
    }, TIMEOUT_MS);
  });

  return Promise.race([
    getAndroidPlayAgeRangeStatus(),
    timeoutPromise,
  ]);
}
```

### Issue: Cache Not Working

```typescript
// Debug cache
console.log('Cache valid:', ageGateService.isCacheValid());
console.log('Cached status:', ageGateService.cachedStatus);
console.log('Cache age:', Date.now() - ageGateService.cacheTimestamp);
```

---

## Additional Resources

- [Google Play Age Signals Documentation](https://developer.android.com/guide/playcore/age-signals)
- [COPPA Compliance Guide](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business)
- [React Native Documentation](https://reactnative.dev/)
- [API Reference](./API.md)

---

## Support

Need help? 

- 📖 Check the [API Documentation](./API.md)
- 🐛 [Report a Bug](https://github.com/meneetu/ccep-technical-assignment/issues)
- 💬 [Ask a Question](https://github.com/meneetu/ccep-technical-assignment/discussions)
