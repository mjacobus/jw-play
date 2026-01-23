# JW Play

A media presenter application designed for 2-screen setups, perfect for remote meetings. Built with [Electron](https://www.electronjs.org/).

## Features

### Media Support
- **Images** - PNG, JPEG, JPG, GIF with zoom and pan controls
- **Videos** - MP4, MPEG, M4V, MOV with playback controls
- **PDFs** - Page navigation with slider, zoom and pan support
- **JW Library Playlists** - Import .jwlplaylist files with preserved order and titles

### Two-Window System
- **Control Window** - Manage your media library with thumbnails
- **Display Window** - Full-screen capable output for your audience

### Controls
- Unified control bar for all media types
- Zoom in/out/fit controls for images and PDFs
- Pan controls (arrow buttons, keyboard, or click-and-drag)
- Video playback controls with progress bar
- PDF page navigation with slider

### Productivity
- Drag and drop files to add them
- Drag and drop to reorder media
- Keyboard shortcuts for pan (hjkl, arrow keys) and zoom (u/i)
- Mouse wheel zoom in display window
- Multi-language support (English, Portuguese)

## Screenshots

<!-- TODO: Add updated screenshots -->
<img width="1409" alt="JW Play Screenshot" src="https://user-images.githubusercontent.com/226834/164533878-ba148626-8fa9-4ab9-879a-522c0d2d291e.png">

## Installation

Download the latest release for your platform from the [releases page](https://github.com/mjacobus/jw-play/releases/latest).

## Development

This project uses **yarn** (not npm).

```bash
# Install dependencies
yarn install

# Run in development mode (with hot reload)
yarn dev

# Run tests
yarn test

# Lint and format code
yarn lint

# Package for testing
yarn package

# Build for distribution
yarn pack-mac     # macOS
yarn pack-win     # Windows
yarn pack-linux   # Linux
```

Note: Install ffmpeg if you want video thumbnails to be generated.

## License

MIT
