require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "StoreAgeDeclaration"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/kadarsh11/react-native-store-age-declaration.git", :tag => "#{s.version}" }
  
  # Swift support
  s.swift_version = '5.0'
  
  # Weak framework for iOS 26+ Declared Age Range API
  s.weak_frameworks = 'DeclaredAgeRange'

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  
  # Don't make headers private - RN needs to access them
  s.public_header_files = "ios/**/*.h"

  install_modules_dependencies(s)
end
