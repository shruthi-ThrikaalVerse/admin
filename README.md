<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/188AiFTpM6Zsr_dG-CZ90srEiivY4YmdM

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Tailwind & Project Structure ✅

- Project has been reorganized to a standard React + TypeScript structure under `src/`.
- Tailwind CSS has been added with `tailwind.config.cjs` and `postcss.config.cjs`. Install new dev dependencies:

```bash
npm install -D tailwindcss postcss autoprefixer
```

- Entry point: `src/main.tsx`. Global styles: `src/styles/index.css` (includes Tailwind directives).
- After installing deps, run `npm run dev` for local development. If you prefer to build Tailwind output manually, you can run a Tailwind CLI command or rely on Vite/PostCSS during dev/build.
