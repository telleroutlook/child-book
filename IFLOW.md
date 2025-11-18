# AI Coloring Book Creator - Project Context

## Project Overview
This is a React-based web application that allows users to generate personalized, printable coloring books for children using AI. The application leverages the Google Gemini API to create custom coloring pages based on user-provided themes and names.

### Key Features
- AI-powered content generation for unique coloring pages
- Personalization with custom covers featuring the child's name
- Print-ready PDF generation combining all pages
- Thick, clean lines suitable for coloring
- Creative assistant chatbot to help brainstorm themes

### Architecture
- **Frontend**: React with TypeScript and Tailwind CSS
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API (`gemini-2.5-flash` for text, `imagen-4.0-generate-001` for images)
- **PDF Generation**: jsPDF (via global declaration)
- **State Management**: React hooks (useState, useCallback)

## Development Environment

### Prerequisites
- Node.js (v18 or later recommended)
- npm or yarn package manager
- Google Gemini API key

### Installation & Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Gemini API key: `API_KEY=your_actual_api_key_here`

### Running the Application
- **Development mode**: `npm run dev` (runs on port 3000)
- **Production build**: `npm run build`
- **Preview production build**: `npm run preview`

## Code Structure

### Main Components
- `App.tsx`: Main application component with state management for theme, name, generated images, and loading states
- `index.tsx`: React entry point that mounts the App component
- `vite.config.ts`: Vite configuration including environment variables and server settings

### UI Components (in `/components/`)
- `Header.tsx`: Application header
- `InputForm.tsx`: Form to collect theme and child's name
- `ImageGrid.tsx`: Grid display for generated coloring pages
- `LoadingSpinner.tsx`: Loading indicator with dynamic messages
- `Chatbot.tsx`: AI-powered creative assistant chat interface
- `icons.tsx`: SVG icon components

### Services (in `/services/`)
- `geminiService.ts`: AI integration for image generation and chatbot responses
- `pdfService.ts`: PDF generation and download functionality

### Types
- `types.ts`: TypeScript interfaces for `GeneratedImage` and `ChatMessage`

## Key Functionality

### Image Generation Process
1. User provides a theme and child's name
2. The app first generates 5 distinct subjects related to the theme using `gemini-2.5-flash`
3. Creates a cover prompt with the child's name and theme
4. Generates 6 total images (1 cover + 5 pages) using `imagen-4.0-generate-001`
5. Images are rendered in the UI and available for PDF download

### PDF Generation
- All images are converted to a multi-page PDF in A4 format
- Each image is centered on a portrait page with proper margins
- Filename includes the child's name

### Chatbot Integration
- Uses a persistent chat session with `gemini-2.5-flash`
- System instruction sets the context as a creative helper for children's coloring books
- Provides kid-friendly, short responses

## Development Conventions
- TypeScript is used throughout for type safety
- React functional components with hooks
- Tailwind CSS for styling with a rose/pink color scheme
- Asynchronous operations with proper loading states and error handling
- Environment variables for API keys (not committed to version control)

## API Key Configuration
The application requires a Google Gemini API key to function. The key is loaded via environment variables in `vite.config.ts` and used in `geminiService.ts`. The API key is exposed to the client-side application through Vite's define configuration.

## Security Considerations
- API keys are loaded through environment variables
- The current setup exposes the API key to the frontend, which is typical for client-side applications but should be considered in production environments
- Input validation is implemented in the form components

## File Structure
```
/home/dev/github/child-book/
├── components/           # React UI components
├── services/            # API and business logic
├── App.tsx             # Main application component
├── index.tsx           # React entry point
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite build configuration
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```