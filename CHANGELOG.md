# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `getAndroidPlayAgeRangeStatus()` method for Android age verification
- `requestIOSDeclaredAgeRange()` method for iOS age verification
- Support for Google Play Age Signals API integration (Android)
- Support for iOS Declared Age Range API (iOS 18+)
- TypeScript type definitions for `PlayAgeRangeStatusResult` and `DeclaredAgeRangeResult`
- Comprehensive JSDoc documentation in TypeScript files
- Complete API documentation in `API.md`
- Implementation guide with real-world examples in `IMPLEMENTATION_GUIDE.md`
- Detailed inline code comments in Kotlin and Swift native modules
- Example app demonstrating age gate functionality for both platforms
- Automatic inclusion of Google Play Age Signals dependency
- Cross-platform age verification API

### Changed
- Updated README with detailed usage examples for both iOS and Android
- Enhanced example app with platform-specific age status checking
- Updated documentation to reflect iOS support

### Documentation
- Added complete API reference with method signatures and return types
- Added implementation guide with step-by-step instructions
- Added real-world examples for gaming apps, social media, e-commerce, and video streaming
- Added testing strategy and production checklist
- Added troubleshooting guide for common issues
- Added JSDoc comments for IntelliSense support

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release
- Basic module structure
- Example multiplication method

[Unreleased]: https://github.com/meneetu/ccep-technical-assignment/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/meneetu/ccep-technical-assignment/releases/tag/v1.0.0
