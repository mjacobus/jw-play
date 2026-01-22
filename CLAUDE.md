# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JWPlay is an Electron-based media presenter application designed for 2-screen setups (remote meetings). It displays images and videos with a control window on one screen and a display window on another.

## Commands

```bash
# Development (with hot reload via nodemon)
npm run dev

# Run tests
npm test

# Run a single test file
npx jest test/MediaFile.test.js

# Lint and format code
npm run lint

# Package for development testing
npm run package

# Build for distribution
npm run make
npm run pack-win     # Windows
npm run pack-linux   # Linux
npm run pack-mac     # macOS

# Clear app config (useful for testing)
npm run clear-config
```

## Architecture

### Two-Window System
The application uses two Electron BrowserWindow instances:
- **ControlWindow** (`src/ControlWindow.js`) - Displays media thumbnails and playback controls. Loads `src/pages/controls.html`
- **DisplayWindow** (`src/DisplayWindow.js`) - Shows the actual media (fullscreen capable). Loads `src/pages/display-window.html`

Both extend `Window` (`src/Window.js`), which is a base class wrapping BrowserWindow with common functionality.

### Main Process Flow
- `src/app.js` - Entry point, creates ApplicationDriver
- `src/ApplicationDriver.js` - Orchestrates the app: manages both windows, handles file/folder dialogs, screen positioning
- `src/ApplicationMenu.js` - Native menu configuration

### Media Management
- `src/MediaFiles.js` - Collection manager using electron-store for persistence. Handles file creation, thumbnail generation
- `src/MediaFile.js` - Individual media file representation. Supports images (png, jpeg, jpg, gif) and videos (mp4, mpeg, m4v, mov)

### IPC Communication
Windows communicate via Electron's IPC:
- Control window sends commands: `file:display`, `video:play`, `video:pause`, `video:rewind`, `video:forward`, `video:toggle-mute`
- Display window sends updates: `video:time-updated`

### Data Persistence
- `src/store.js` - Wrapper around electron-store. Uses `config_test` store name in test environment
- Media files stored at `{appData}/JWPlay/files`
- Video thumbnails generated via ffmpeg at `{appData}/JWPlay/files/thumbnails`

### Translations
- `src/translations.js` - Translation function `t(key, args)` with interpolation support
- Language files in `translations/` directory (en.json, pt-BR.json)

## Testing

Tests are in `test/` directory using Jest. Test files must set `NODE_ENV=test` before requiring store to use separate config.
