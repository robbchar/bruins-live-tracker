# Firebase Setup Notes

## Problem statement
Track Firebase project configuration in a safe, repeatable way without
committing app secrets or accidentally overwriting shared Firestore rules.

## Requirements
- Keep platform configs out of git (`.env.local`, `GoogleService-Info.plist`).
- Provide a clear local setup path for web and iOS apps.
- Avoid deploying partial Firestore rules.

## Approach
1. Store the Firebase project ID in `.firebaserc` for local CLI use.
2. Keep Firebase app configs in local files:
   - `admin-web/.env.local`
   - `ios/GoogleService-Info.plist`
3. Provide example templates and README guidance.
4. Configure Firebase Hosting for the admin web build in `firebase.json`.
5. Only deploy Firestore rules after merging the Bruins Live additive section
   into the shared rules file used by the rest of the Firebase project.

## Hosting
Build and deploy the admin UI with:
```
pnpm -C admin-web build
firebase deploy --only hosting:buins-live-tracker
```
