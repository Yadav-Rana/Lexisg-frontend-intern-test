# Lexi Legal Assistant - Frontend Interface

A modern, ChatGPT-like interface for a legal assistant that provides AI-generated answers with citations from legal documents.

## Features

- **Chat Interface**: Clean, modern chat interface similar to ChatGPT
- **Legal Q&A**: Ask legal questions and receive detailed answers
- **Citations**: View citations from legal documents with source references
- **PDF Integration**: Click citations to view PDF documents in modal popup
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**: Press Enter to send, Shift+Enter for new line
- **Auto-scroll**: Automatically scrolls to new messages (not working how it is intended to for now)
- **Loading States**: Visual feedback during message processing

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Modern JavaScript** - ES6+ features

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone 
cd Lexisg-frontend-intern-test
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in terminal)

## Usage

1. **Ask a Question**: Type your legal question in the text area at the bottom
2. **Send Message**: Press Enter or click the Send button
3. **View Answer**: The AI assistant will provide a detailed answer with legal reasoning
4. **Check Citations**: Click on citation buttons to view source documents
5. **Open PDFs**: Citations link to actual legal documents for verification

### Example Question

Try asking this sample question:
```
"In a motor accident claim where the deceased was self-employed and aged 54–55 years at the time of death, is the claimant entitled to an addition towards future prospects in computing compensation under Section 166 of the Motor Vehicles Act, 1988? If so, how much?"
```

## Citation Handling

The application handles citations in the following way:

1. **Citation Display**: Citations appear below each answer in dedicated cards
2. **Source Information**: Each citation shows the source document and paragraph reference
3. **Modal Popup**: Clicking a citation opens a modal with detailed information
4. **PDF Access**: Modal provides direct link to the source PDF document
5. **Paragraph Reference**: Citations include specific paragraph numbers for easy reference

## Project Structure

```
src/
├── App.jsx          # Main application component
├── App.css          # Custom styles
├── index.css        # Tailwind CSS imports
└── main.jsx         # Application entry point
```

## API Simulation

The application uses simulated API responses for demonstration purposes. In a production environment, this would connect to a real backend service that:

- Processes legal questions using AI/NLP
- Searches legal document databases
- Returns structured responses with citations
- Provides document links and paragraph references

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Deployment

The application can be deployed to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## Future Enhancements

- Real backend integration
- User authentication
- Chat history persistence
- Advanced search filters
- Document highlighting
- Multi-language support
- Voice input/output

## License

This project is for demonstration purposes as part of the Lexi frontend internship assignment.