# CreamLine

**CreamLine** is an Electron-based screen sharing and streaming application utilizing WebRTC for real-time peer-to-peer communication. Version 1.0.5.

## Features

- **Screen Sharing**: Stream your screen to other connected clients.
- **WebRTC**: Low-latency peer-to-peer streaming.
- **Signaling Server**: Built-in WebSocket signaling server for connection coordination.
- **Auto-Updates**: Integrated with `electron-updater` for seamless updates.
- **Room-Based**: Automatically connects clients to a default room (`room-1`).

## Project Structure

- **`main.js`**: The main process entry point. Handles application lifecycle, window creation, auto-updates, and can start a local signaling server.
- **`server.js`**: A standalone WebSocket signaling server implementation. Handles peer discovery and message relaying (offer, answer, ice candidates).
- **`renderer.js`**: The renderer process script (UI logic). Handles the frontend interactions and WebRTC media streams.
- **`index.html`**: The main application window layout.
- **`signaling-server.js`**: Module for running the signaling server, used by the main process.
- **`config.js`**: Configuration file for signaling URLs and room settings.
- **`electron-builder.yml`**: Configuration for packaging and building the application installer.

## Installation

Ensure you have Node.js installed.

```bash
# Install dependencies
npm install
```

## Usage

### Development

To start the application in development mode:

```bash
npm start
```

This command runs `electron .`.

### Building

To build the application for Windows (creates an installer):

```bash
npm run dist
```

This uses `electron-builder` to package the app.

### Running Signaling Server

To run the signaling server independently:

```bash
npm run server
```

## Configuration

The application uses `config.js` (implied) and environment variables for configuration.
- **Signaling URL**: Configured to connect to a WebSocket server (defaulting to localhost or a specified remote IP).
- **Room Name**: Default is `room-1`.

## Dependencies

- **electron**: Framework for building desktop apps.
- **ws**: WebSocket library for the signaling server.
- **electron-updater**: For handling application updates.
- **electron-builder**: For packaging the application.
