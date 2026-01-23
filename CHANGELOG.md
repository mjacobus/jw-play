# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.0] - 2026-01-23

### Added
- Import JW Library playlists (.jwlplaylist files) via drag/drop or Add Files menu
- Optional title field for media files, displayed instead of filename when set
- Imported playlist items preserve their original order and titles

## [2.5.0] - 2026-01-22

### Added
- Drag and drop files onto control window to add them
- Keyboard shortcuts for pan (hjkl, arrow keys) and zoom (u/i)
- Mouse wheel zoom in display window
- Click and drag to pan zoomed content in display window
- Pan arrows in control bar to move zoomed images and PDFs
- Translations for control tooltips (English and Portuguese)

### Changed
- Zoom now uses 10% increments instead of 25%
- Control bar is responsive for narrow window widths

### Fixed
- Image centering now uses flexbox properly
- Fit-to-window button correctly resets image size

## [2.4.0] - 2026-01-22

### Added
- Unified control bar for all media types (images, videos, PDFs)
- File type badges with color coding (green for images, red for videos, orange for PDFs)
- Filename display in controls for all media types
- Close button to clear the display window
- Zoom in/out/fit controls for images and PDFs
- Auto-resize content on window resize

### Changed
- Control bar layout now uses flexbox for consistent styling
- Display window supports scrollable content when zoomed beyond viewport

## [2.3.0] - 2026-01-22

### Added
- PDF file support with page navigation controls (next/prev buttons, page slider)
- PDF thumbnails generated automatically when files are added

## [2.2.0]

### Added
- Drag and drop reordering for media files

## [2.1.1]

### Fixed
- Missing translation

## [2.1.0]

### Added
- Portuguese translations
- Confirmation dialog for file removal with translation support

## [2.0.0]

### Added
- Keyboard shortcuts with Ctrl/Cmd prefix
- Shortcut for quitting the application

### Changed
- Major version bump for new features
