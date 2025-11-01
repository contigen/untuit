# Untuit - AI-Powered Presentation Application

An AI-powered web application for creating, designing, and practising presentations with automated slide generation, intelligent theming, and delivery practice features.

## Features

- **AI Slide Generation**: Automatically generate structured slides from text input using the Language Model API
- **Theme Generation**: AI-powered theme generation with custom colour palettes and fonts
- **Practice Mode**: Speech recognition and synthesis for delivery practice with real-time feedback
- **Presenter View**: Dual-screen presentation mode with external display projection via Presentation API
- **PDF Export**: Export presentations with custom theme styling

Install dependencies:

```bash
npm install
# or
bun install
# or
pnpm install
```

Start the development server:

```bash
npm run dev
# or
bun dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

## Testing Instructions

1. **Start the application** using `npm run dev` (or your preferred package manager)

2. **Generate Slides**:
   - Navigate to the "Input" tab
   - Enter or paste text content (e.g., a brief essay or article excerpt)
   - Click "Generate Slides"
   - Wait for AI processing (may take 10-30 seconds)
   - Slides should appear in the "Slides" tab

3. **Review Slides**:
   - Navigate to the "Slides" tab
   - Browse through generated slides using navigation controls
   - Verify speaker notes are displayed for each slide

4. **Generate Themes**:
   - Navigate to the "Preview" tab
   - Click "Generate Themes" button
   - Wait for three theme options to appear
   - Select a theme to preview it on your slides
   - Verify theme styling (colours, fonts) is applied

5. **Practice Mode**:
   - Navigate to the "Practice" tab
   - Click "Start Practice"
   - Allow microphone permissions when prompted
   - Verify speech recognition is active (indicator shows "Listening...")
   - Click "Read" button on speaker notes to test text-to-speech
   - Verify practice metrics are tracked (time, pace, etc.)

6. **Presenter View**:
   - Navigate to the "Presenter" tab
   - Click "Share Display" button
   - If using Chrome/Edge, the browser's cast menu should appear
   - Select an external display or cast device
   - Verify slides appear on external display
   - Navigate between slides and verify synchronisation

7. **Export PDF**:
   - Navigate to the "Export" tab
   - Click "Download PDF"
   - Verify PDF downloads with theme styling applied

### Advanced Features Test

1. **State Persistence**:
   - Generate slides and themes
   - Close and reopen the browser tab
   - Verify slides and selected theme persist

2. **Speech Features**:
   - In Practice mode, speak into microphone
   - Verify transcript appears in real-time
   - Test pause/resume functionality

3. **Presentation API**:
   - Use two browser windows/devices
   - Open `/presentation` route in one window (receiver)
   - Start presentation from main application (controller)
   - Verify first slide appears immediately on receiver
   - Test slide navigation synchronisation

## Browser Compatibility

- **Chrome 133+**: Full support (Language Model API, Presentation API, Speech APIs)

## Project Structure

```
src/
├── components/ # React components
│ ├── input-tab.tsx # Input and slide generation
│ ├── slides-tab.tsx # Slide preview and navigation
│ ├── practice-tab.tsx # Practice mode with speech
│ ├── preview-tab.tsx # Theme generation and preview
│ ├── presenter-tab.tsx # Presenter view
│ └── export-tab.tsx # PDF export
├── atom.ts # Jotai state management
├── schema.ts # Zod schemas for validation
├── built-in-ai.ts # AI prompt configuration
├── lib/ # Utility functions
│ └── pdf-export.ts # PDF generation
└── presentation.tsx # Receiver page for Presentation API
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
