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

<img width="800" alt="JW Play - Image display with zoom controls" src="https://github.com/user-attachments/assets/a448b03f-4542-4565-bf10-d35d6836d143">

<img width="800" alt="JW Play - Video playback controls" src="https://github.com/user-attachments/assets/b38dbc0d-6849-4a3f-b621-341827976273">

<img width="800" alt="JW Play - PDF viewer with page navigation" src="https://github.com/user-attachments/assets/2271ed2f-e896-4bbf-8602-5324dde5b308">

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
