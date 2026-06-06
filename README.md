# AI Production OS

A hackathon MVP that converts a natural language product idea into a production-ready project scaffold.

## Features

- React + Vite frontend with Tailwind UI
- Express backend with `/generate` API
- AI-powered product spec generation via OpenAI or fallback mock mode
- Project scaffold creation using Node filesystem
- ZIP download endpoint for generated projects

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm run dev
   ```

3. Open the frontend at `http://localhost:4173`

## OpenAI Support

If you want AI-generated scaffolds instead of mock scaffolding, create a `.env` file with the provider you want to use:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

For Gemini:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-lite
```

## Deploying To Render

This repository is configured as a single Render web service. Express serves both the API and the built React app from `dist/`.

Do not deploy this as a Render Static Site by itself. A Static Site can serve the React app, but it cannot run the Express `/generate` API, and the browser will show errors like `Unexpected token 'N', "Not Found" is not valid JSON`.

### Blueprint deploy

1. Push this project to GitHub.
2. In Render, choose **New +** > **Blueprint**.
3. Select the repository. Render will use `render.yaml`.
4. Add secret environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Add `OPENAI_API_KEY` too if you want OpenAI available.

### Manual web service settings

Use these settings if you create a Render Web Service manually:

```text
Runtime: Node
Build Command: npm ci && npm run build
Start Command: npm start
Health Check Path: /health
```

Set environment variables in Render:

```env
NODE_VERSION=20
NODE_ENV=production
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-lite
```

If you intentionally deploy the frontend and backend as two separate Render services, set this build-time environment variable on the frontend service:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com
```

For the single Web Service setup from `render.yaml`, leave `VITE_API_BASE_URL` empty.

## Notes

- The generator stores output in `generated/`
- Download generated scaffolds from the frontend after generation
- Render's filesystem is ephemeral, so generated ZIPs are temporary unless you add persistent storage.
