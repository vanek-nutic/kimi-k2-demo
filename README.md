# Kimi K2 Thinking Demo 🤖✨

An interactive demonstration of AI extended thinking capabilities powered by Moonshot AI's Kimi K2 model. Watch the AI think, use tools, and generate research reports in real-time with a beautiful, modern interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-19.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### Core Functionality
- 🧠 **Real-time AI Thinking Visualization** - Watch the AI's reasoning process unfold step-by-step
- 🔧 **Tool Call Tracking** - Monitor external tool invocations with status indicators
- 📊 **Live Performance Metrics** - Track thinking tokens, processing time, and token usage
- 📄 **PDF Export** - Generate professional research reports with one click
- 💾 **Chat History** - Persistent conversation history with search and export capabilities
- 🎨 **Beautiful Dark Theme UI** - Modern gradient design with smooth animations

### Enhanced UX/UI (Recent Improvements)
- ✅ **Toast Notifications** - Real-time feedback for all user actions
- ⌨️ **Keyboard Shortcuts** - Ctrl+Enter to submit queries
- 🔄 **Loading States** - Clear visual feedback during processing
- ⏱️ **Timeout Handling** - 60-second request timeout with helpful error messages
- 🕐 **Relative Timestamps** - Human-friendly time displays ("2 hours ago")
- 🎯 **Enhanced Button States** - Smooth hover/active animations
- 📝 **Input Validation** - Prevents empty submissions with clear error messages
- 🖱️ **Custom Scrollbars** - Styled purple scrollbars matching the theme

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- A Moonshot AI API key ([Get one here](https://platform.moonshot.cn/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd kimi-k2-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**

   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

   Open `.env` and add your Moonshot API key:
   ```env
   VITE_MOONSHOT_API_KEY=sk-your_moonshot_api_key_here
   VITE_TAVILY_API_KEY=tvly-your_tavily_api_key_here  # Optional
   ```

   ⚠️ **IMPORTANT**: The app will not work without a valid API key!

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` and start exploring!

## 📖 Usage Guide

### Submitting Queries

1. **Type your query** in the text area or click one of the example buttons
2. **Submit** by:
   - Clicking the "Submit Query" button
   - Pressing `Ctrl+Enter` (or `Cmd+Enter` on Mac)
3. **Watch the magic happen**:
   - Left panel: AI's thinking process
   - Center panel: Tool calls and executions
   - Right panel: Final results in formatted markdown

### Example Queries

The app includes three pre-configured examples:
- 📊 Research and compare productivity tools (Notion, Obsidian, Roam)
- 🤖 Analyze AI coding assistants with feature comparison
- ☁️ Compare cloud storage providers with pricing analysis

### Exporting Reports

- **PDF Export**: Click "Export PDF" to generate a professional report
- **History Export**: Access chat history and export all conversations as JSON

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` / `Cmd+Enter` | Submit query |
| `Esc` | Close history panel (when open) |

## 🛠️ Technical Stack

### Frontend
- **React 19.0.0** - Modern UI library with hooks
- **TypeScript 5.2.2** - Type-safe development
- **Vite 5.2.0** - Lightning-fast build tool
- **Tailwind CSS 3.4.1** - Utility-first styling

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Markdown** - Markdown rendering with GitHub Flavored Markdown

### API Integration
- **Moonshot AI Kimi K2** - Advanced AI model with extended thinking
- **Server-Sent Events (SSE)** - Real-time streaming responses

### PDF Generation
- **jsPDF** - Client-side PDF creation

## 🎨 Project Structure

```
kimi-k2-demo/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── App.tsx         # Main application
│   │   ├── MetricsPanel.tsx
│   │   ├── ThinkingPanel.tsx
│   │   ├── ToolCallsPanel.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── HistoryPanel.tsx
│   │   └── Toast.tsx       # Toast notifications
│   ├── lib/                # Utilities and APIs
│   │   ├── api.ts          # Moonshot API integration
│   │   ├── historyStorage.ts
│   │   ├── pdfExport.ts
│   │   └── utils.ts
│   ├── types/              # TypeScript definitions
│   └── index.css           # Global styles
├── .env                    # Environment variables
├── package.json
└── vite.config.ts
```

## 🐛 Bug Fixes & Improvements

This version includes comprehensive fixes for all reported issues:

### Critical Issues Fixed ✅
- ✅ **API Connection** - Added .env configuration with clear setup instructions
- ✅ **Input Validation** - Enhanced with visual feedback and error messages
- ✅ **Error Handling** - Comprehensive error states with user-friendly messages
- ✅ **Timeout Handling** - 60-second timeout with abort controller

### UX/UI Enhancements ✅
- ✅ **Toast Notifications** - Success/error/info messages for all actions
- ✅ **PDF Export Feedback** - Loading states and success notifications
- ✅ **Keyboard Shortcuts** - Ctrl+Enter submission
- ✅ **Loading Indicators** - Enhanced visual feedback during processing
- ✅ **Button States** - Smooth hover/active animations
- ✅ **Relative Timestamps** - "2 hours ago" style timestamps in history
- ✅ **Custom Scrollbars** - Themed purple scrollbars
- ✅ **Better Error Messages** - Specific guidance based on error type

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_MOONSHOT_API_KEY` | Your Moonshot AI API key | ✅ Yes |
| `VITE_TAVILY_API_KEY` | Tavily web search API key | ❌ Optional |

## 🚨 Troubleshooting

### "API key not configured" Error
- Ensure you've created a `.env` file in the project root
- Verify your API key starts with `sk-`
- Restart the development server after adding the key

### API Request Timeout
- Check your internet connection
- Verify the Moonshot API is accessible
- Try a simpler query first

### Empty Response
- Ensure your API key has proper permissions
- Check browser console for detailed error logs
- Verify the API endpoint is not rate-limited

## 📝 API Key Setup

1. Visit [Moonshot Platform](https://platform.moonshot.cn/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)
6. Add to your `.env` file

## 🎯 Feature Roadmap

- [ ] Search and filter in history panel
- [ ] Multiple theme options (light mode)
- [ ] Export history as Markdown
- [ ] Real-time collaboration
- [ ] Custom tool integrations
- [ ] Mobile-responsive design improvements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Moonshot AI** for the powerful Kimi K2 model
- **Tavily** for web search capabilities
- **Radix UI** for accessible components
- **Vercel** for Vite and development tools

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review browser console logs (F12)
3. Open an issue on GitHub

---

Made with ❤️ using Moonshot AI Kimi K2
