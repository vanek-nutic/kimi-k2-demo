# 🚀 Getting Started with Kimi K2 Thinking Demo

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd C:\kimi-k2-demo
npm install --legacy-peer-deps
```

### 2. Configure API Keys
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Edit `.env` and add your API keys:
```
VITE_MOONSHOT_API_KEY=sk-your_actual_key_here
VITE_TAVILY_API_KEY=tvly-your_actual_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:5173

## 📚 What to Read Next

- **First Time?** → Read `QUICK_REFERENCE.md`
- **Setup Help?** → Read `SETUP_GUIDE.md`  
- **All Features?** → Read `README.md`
- **Technical Details?** → Read `DEVELOPMENT_SUMMARY.md`

## 🎯 Try This First

1. Click "Example 1" to load a sample query
2. Click "Submit Query"
3. Watch the AI think in real-time!
4. Check the "History" button to see saved conversations

## ❓ Having Issues?

### "API request failed: 401"
✅ Check your Moonshot API key in `.env`
✅ Make sure it starts with `sk-`
✅ Restart the dev server after adding keys

### "Module not found"
✅ Run: `npm install --legacy-peer-deps`
✅ Delete `node_modules` folder and reinstall

### Build fails
✅ Make sure you're using Node.js 18+
✅ Try: `npm cache clean --force`

## 🌟 Key Features

- ✅ Real PDF generation
- ✅ Chat history persistence  
- ✅ Professional markdown rendering
- ✅ Multiple export formats
- ✅ Real-time thinking visualization

## 📞 Need Help?

Check the documentation:
- README.md - Complete guide
- QUICK_REFERENCE.md - Quick tips
- SETUP_GUIDE.md - Installation details

---

**Ready to start?** Run `npm run dev` and open http://localhost:5173 🎉
