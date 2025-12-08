# Requirements Document

## Introduction

This document specifies the requirements for implementing internationalization (i18n) in the ERP System Frontend. The system will support multiple languages, enabling users to view the application in their preferred language. The implementation will use `next-intl` library integrated with Next.js App Router, providing locale-based routing, translation management, and seamless language switching.

## Glossary

- **Locale**: A language identifier (e.g., 'id', 'en') representing a supported language
- **i18n System**: The internationalization infrastructure responsible for managing translations and locale routing
- **Translation Message**: A key-value pair where the key is a unique identifier and the value is the localized text
- **Default Locale**: The fallback language ('id' - Indonesian) used when no locale is specified or detected
- **Locale Prefix**: The URL segment indicating the current language (e.g., '/en', '/es')
- **NextIntlClientProvider**: A React context provider that makes translations available to client components
- **Routing Configuration**: The centralized definition of supported locales and routing behavior

## Requirements

### Requirement 1

**User Story:** As a user, I want the application to detect and use my preferred language, so that I can interact with the system in a language I understand.

#### Acceptance Criteria

1. WHEN a user visits the application without a locale prefix THEN the i18n System SHALL redirect to the default locale ('id') path
2. WHEN a user visits a URL with a valid locale prefix THEN the i18n System SHALL display content in the specified language
3. WHEN a user visits a URL with an invalid locale prefix THEN the i18n System SHALL display a 404 not found page
4. WHEN the i18n System initializes THEN the i18n System SHALL support Indonesian ('id') as the main language and English ('en') as the secondary language

### Requirement 2

**User Story:** As a developer, I want a centralized routing configuration, so that I can manage supported locales and routing behavior in one place.

#### Acceptance Criteria

1. WHEN the routing configuration is defined THEN the i18n System SHALL export a routing object containing all supported locales and the default locale
2. WHEN the proxy processes a request THEN the i18n System SHALL use the routing configuration to determine locale handling
3. WHEN navigation APIs are created THEN the i18n System SHALL derive Link, redirect, usePathname, and useRouter from the routing configuration

### Requirement 3

**User Story:** As a developer, I want translation messages organized by locale, so that I can easily manage and update translations.

#### Acceptance Criteria

1. WHEN translation files are structured THEN the i18n System SHALL store messages in JSON files under a 'messages' directory with locale-based naming (e.g., 'id.json', 'en.json')
2. WHEN a locale is requested THEN the i18n System SHALL load the corresponding translation file dynamically
3. WHEN a translation key is accessed THEN the i18n System SHALL return the localized string for the current locale
4. WHEN serializing translation messages THEN the i18n System SHALL use JSON format
5. WHEN parsing translation messages THEN the i18n System SHALL validate the JSON structure and produce the original message object (round-trip consistency)

### Requirement 4

**User Story:** As a developer, I want to use translations in both Server and Client Components, so that I can internationalize the entire application.

#### Acceptance Criteria

1. WHEN a Server Component needs translations THEN the i18n System SHALL provide access via the getTranslations function
2. WHEN a Client Component needs translations THEN the i18n System SHALL provide access via the useTranslations hook
3. WHEN the root layout renders THEN the i18n System SHALL wrap children with NextIntlClientProvider to enable client-side translations
4. WHEN the request configuration is set up THEN the i18n System SHALL provide locale and messages to all components in the request scope

### Requirement 5

**User Story:** As a user, I want to switch between languages, so that I can view the application in my preferred language at any time.

#### Acceptance Criteria

1. WHEN a user clicks a language option THEN the i18n System SHALL navigate to the same page with the selected locale prefix
2. WHEN the language is switched THEN the i18n System SHALL preserve the current pathname and query parameters
3. WHEN displaying language options THEN the i18n System SHALL show all supported locales with their native names

### Requirement 6

**User Story:** As a developer, I want the existing proxy to integrate with i18n routing, so that authentication and locale handling work together seamlessly.

#### Acceptance Criteria

1. WHEN the proxy processes a request THEN the i18n System SHALL handle locale routing before authentication checks
2. WHEN authentication routes are defined THEN the i18n System SHALL include locale prefixes in the route patterns (e.g., '/[locale]/signin')
3. WHEN the proxy configuration is updated THEN the i18n System SHALL exclude API routes, static files, and Next.js internals from locale processing

### Requirement 7

**User Story:** As a developer, I want the application folder structure to support locale-based routing, so that each locale has its own URL namespace.

#### Acceptance Criteria

1. WHEN the app directory is restructured THEN the i18n System SHALL place all routes under an '[locale]' dynamic segment
2. WHEN a layout is created for the locale segment THEN the i18n System SHALL validate the locale parameter and render a 404 page for invalid locales
3. WHEN route groups are used THEN the i18n System SHALL maintain the existing '(app)' and '(auth)' groupings under the '[locale]' segment
