### Firebase ios repo: 
```
https://github.com/firebase/firebase-ios-sdk
```

### Firebase ios init code:
```swift
import SwiftUI
import FirebaseCore


class AppDelegate: NSObject, UIApplicationDelegate {
  func application(_ application: UIApplication,
                   didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    FirebaseApp.configure()

    return true
  }
}

@main
struct YourApp: App {
  // register app delegate for Firebase setup
  @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate


  var body: some Scene {
    WindowGroup {
      NavigationView {
        ContentView()
      }
    }
  }
}
```

### Firebase config file
The Firebase iOS config should live at:
`ios/GoogleService-Info.plist`

Keep that file local only. Use `ios/GoogleService-Info.plist.example` as the
template and download a fresh plist from the Firebase console when needed.