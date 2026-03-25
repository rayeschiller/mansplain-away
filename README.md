# 🚨 Mansplain Away

A big red button you press when a man is explaining something to you that you didn't ask for.

Press it. Get a petty, savage AI-generated comeback — read out loud.

**[Live Demo →](https://your-vercel-url.vercel.app)**

---

## What it does

- 🔴 Big satisfying button to slam when it's happening
- 🤖 Generates a fresh savage comeback every press (powered by Claude)
- 🔊 Reads the comeback out loud via Web Speech API
- 💥 Sparks, shake animation, and a buzzer sound for catharsis
- 🔢 Tracks how many times it's happened today

## Stack

- Vanilla HTML/CSS/JS — zero dependencies
- [Anthropic Claude API](https://anthropic.com) for comeback generation
- Web Speech API for text-to-speech
- Deployed on [Vercel](https://vercel.com)

## Run locally

```bash
git clone https://github.com/YOUR_USERNAME/well-actually
cd well-actually
open index.html
```

> The app calls the Anthropic API directly from the browser. For production use, consider proxying through a serverless function to keep your API key private.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Leave all settings default → Deploy

Auto-deploys on every push to `main`.

## License

MIT
