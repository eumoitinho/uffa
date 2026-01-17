# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Google-only authentication with backend token verification.
- Onboarding flow to confirm user name and optional profile photo.
- User table support for Google account IDs and nullable passwords.
- Legal pages: Privacy, Terms, LGPD, and Open Finance.
- Belvo Open Finance integration with widget token, links, and transaction sync.

### Changed
- User and transaction APIs now require JWT bearer tokens.
- Profile editing flow no longer exposes password changes.

### Removed
- Email/password login and registration flows.

## 0.3.1 - 2026-01-12

### Changed
- Use cross-env for HTTPS start script and add it as a dev dependency.

## 0.3.0 - 2026-01-06

### Added
- Node.js/Express backend with PostgreSQL API.

### Changed
- Migrate data access from Firebase to the PostgreSQL API.

### Removed
- Firebase dependency.

## 0.2.0 - 2025-02-04

### Added
- Firebase configuration using environment variables.

### Changed
- Update .gitignore to avoid tracking sensitive files.

### Removed
- Sensitive certificate files and legacy Firebase config files.

## 0.1.1 - 2023-08-15

### Added
- Hotjar tracking script.

## 0.1.0 - 2023-08-14

### Added
- Initial React app and core UI screens.
- Deployment redirects for static hosting.

### Fixed
- Responsive layout adjustments for charts, header, and news container.
