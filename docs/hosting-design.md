# Hosting Design

## Problem statement
Prepare Firebase Hosting configuration for the admin web app so deployments are
repeatable and consistent across environments.

## Requirements
- Host the `admin-web` build output on Firebase Hosting.
- Keep deployment configuration in version control.
- Avoid committing local secrets.

## Approach
1. Add `firebase.json` with a hosting target mapped to `admin-web/dist`.
2. Include an SPA rewrite to `index.html`.
3. Provide a local env template for the web app and document deploy commands.

## Non-goals
- Automating deployments (CI/CD) in this step.
- Configuring custom domains or HTTPS certs.
