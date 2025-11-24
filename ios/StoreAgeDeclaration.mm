#import "StoreAgeDeclaration.h"
#import "StoreAgeDeclaration-Swift.h"

@interface StoreAgeDeclaration()
@property (nonatomic, strong) StoreAgeDeclarationSwift *swiftImpl;
@end

@implementation StoreAgeDeclaration

- (instancetype)init {
    if (self = [super init]) {
        _swiftImpl = [[StoreAgeDeclarationSwift alloc] init];
    }
    return self;
}

- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(a * b);
    return result;
}

- (void)getAndroidPlayAgeRangeStatus:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject {
    // Android-only method - return error on iOS
    NSDictionary *result = @{
        @"installId": [NSNull null],
        @"userStatus": [NSNull null],
        @"error": @"This method is only available on Android. Use requestIOSDeclaredAgeRange on iOS."
    };
    resolve(result);
}

- (void)requestIOSDeclaredAgeRange:(double)firstThresholdAge
                secondThresholdAge:(double)secondThresholdAge
                 thirdThresholdAge:(double)thirdThresholdAge
                           resolve:(RCTPromiseResolveBlock)resolve
                            reject:(RCTPromiseRejectBlock)reject {
    [self.swiftImpl requestIOSDeclaredAgeRange:@(firstThresholdAge)
                            secondThresholdAge:@(secondThresholdAge)
                             thirdThresholdAge:@(thirdThresholdAge)
                                       resolve:resolve
                                        reject:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeStoreAgeDeclarationSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"StoreAgeDeclaration";
}

@end
