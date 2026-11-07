# BuddyShaper (public share)

Chat coach demo with **Gymergee（俊美雞）**. Works out of the box with local demo logic. You can also **write API keys into an env file** to plug in an external AI provider and run a local deployment.

UI supports **English / 中文** (toggle in the top-right; preference saved in the browser).

## Run locally

1. Install [Node.js LTS](https://nodejs.org/)
2. Open **Terminal**, go into the project folder, then install and start:

```bash
cd ~/文件夾名folder name
npm install
npm run dev
```

Replace `文件夾名folder name` with your actual folder name (for example `BuddyShaper-public`).

3. Open the URL Vite prints (usually http://localhost:5173/).
To stop the server later, press `Ctrl + C` in that Terminal.

## Connect an external API key (local deploy)

To use OpenAI / Gemini / **Zhipu GLM** (or your own proxy) on your machine:

```bash
cp .env.example .env.local
```

1. Open `.env.local`
2. Set `VITE_AI_PROVIDER` to `openai`, `gemini`, or `glm`
3. Fill the matching key (for GLM: `VITE_GLM_API_KEY`)
4. For GLM, keep  
   `VITE_GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4`  
   (API endpoint for code — not `https://bigmodel.cn/apikey/platform`, which is only the key console)
5. Restart `npm run dev`

When `VITE_AI_PROVIDER=glm` and the key is set, **plate photos and free-form chat call GLM for real**. Otherwise the local demo matcher / replies are used.

If you see `GLM vision failed: Load failed`, the browser blocked a direct call to Zhipu (CORS). Use `npm run dev` so Vite can proxy `/api/glm` → `open.bigmodel.cn` (already configured in `vite.config.ts`).

Env helpers: `src/config/env.ts`. Vision: `src/engine/glmVision.ts`. Chat: `src/engine/glmChat.ts`.

Do **not** commit `.env.local` or share real keys. `VITE_*` values are embedded in the browser bundle — for a public production app, put secrets on a backend proxy instead.

## What is included

- Goal-matched recipes and macros
- Lift-form tips from a short clip upload
- Plate calorie estimates from a photo (local demo matcher until a vision API is wired)

Estimates are coaching aids, not medical advice.
