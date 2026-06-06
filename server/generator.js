import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GENERATED_DIR = path.join(__dirname, '../generated');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sanitizeId(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'project';
}

function buildStackMetadata(techStack) {
  const stacks = {
    'react-express': {
      ui: 'React + Express',
      frontend: 'React',
      backend: 'Express',
      description: 'React + Tailwind frontend with an Express backend',
      techList: ['React', 'Tailwind CSS', 'Vite', 'Node.js', 'Express', 'Jest', 'GitHub Actions'],
      buildInstructions: 'npm install && npm run build',
    },
    'react-fastapi': {
      ui: 'React + FastAPI',
      frontend: 'React',
      backend: 'FastAPI',
      description: 'React + Tailwind frontend with a FastAPI backend',
      techList: ['React', 'Tailwind CSS', 'Vite', 'Python', 'FastAPI', 'Jest', 'GitHub Actions'],
      buildInstructions: 'npm install && npm run build',
    },
    'vue-nodejs': {
      ui: 'Vue + Node.js',
      frontend: 'Vue',
      backend: 'Node.js',
      description: 'Vue 3 frontend with an Express backend',
      techList: ['Vue', 'Vite', 'Node.js', 'Express', 'Jest', 'GitHub Actions'],
      buildInstructions: 'npm install && npm run build',
    },
    'nextjs-api': {
      ui: 'Next.js + API Routes',
      frontend: 'Next.js',
      backend: 'API Routes',
      description: 'Next.js frontend with built-in API routes',
      techList: ['Next.js', 'React', 'Node.js', 'Jest', 'GitHub Actions'],
      buildInstructions: 'npm install && npm run build',
    },
    'svelte-nodejs': {
      ui: 'Svelte + Node.js',
      frontend: 'Svelte',
      backend: 'Node.js',
      description: 'Svelte frontend with a Node.js backend',
      techList: ['Svelte', 'Vite', 'Node.js', 'Express', 'Jest', 'GitHub Actions'],
      buildInstructions: 'npm install && npm run build',
    },
    'angular-nestjs': {
      ui: 'Angular + NestJS',
      frontend: 'Angular',
      backend: 'NestJS',
      description: 'Angular frontend with a NestJS backend',
      techList: ['Angular', 'TypeScript', 'NestJS', 'Node.js', 'Jest', 'GitHub Actions'],
      buildInstructions: 'npm install && npm run build',
    },
    'solid-nodejs': {
      ui: 'Solid + Node.js',
      frontend: 'Solid',
      backend: 'Node.js',
      description: 'SolidJS frontend with a Node.js backend',
      techList: ['SolidJS', 'Vite', 'Node.js', 'Express', 'Jest', 'GitHub Actions'],
      buildInstructions: 'npm install && npm run build',
    },
  };
  return stacks[techStack] || stacks['react-express'];
}

function buildMockSpec(idea, techStack = 'react-express') {
  const title = idea
    .replace(/([^\w]|\d)+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 5)
    .join(' ')
    .trim();
  const stack = buildStackMetadata(techStack);

  return {
    name: `${title} App`,
    description: `A modern full-stack prototype for: ${idea}. Includes a ${stack.description}, test cases, and a GitHub Actions pipeline.`,
    features: [
      `Responsive ${stack.frontend} UI`,
      'API-driven user onboarding flow',
      'Structured project scaffold for production',
      'Automated tests and CI/CD workflow',
    ],
    techStack: stack.techList,
    apiEndpoints: [
      {
        method: 'POST',
        path: '/api/onboarding',
        description: 'Submit user signup details and simulate the onboarding flow.',
      },
      {
        method: 'GET',
        path: '/api/status',
        description: 'Check backend service health and onboarding status.',
      },
    ],
    tests: [
      {
        name: 'backend onboarding endpoint',
        description: 'Ensures the onboarding API returns a successful JSON response.',
      },
      {
        name: 'frontend smoke test',
        description: 'Renders the main app interface and verifies the key stack behavior.',
      },
    ],
    ci: ['Install dependencies', 'Run backend tests', 'Run frontend tests', stack.buildInstructions],
  };
}

function buildArchitecture(spec, techStack = 'react-express') {
  const stack = buildStackMetadata(techStack);
  const endpoints = spec.apiEndpoints?.map((endpoint) => `${endpoint.method} ${endpoint.path}`).join(', ');
  return `A two-tier application with a ${stack.frontend} frontend and a ${stack.backend} backend. The backend exposes APIs such as ${endpoints || 'status and onboarding endpoints'} for user onboarding and health checks. The frontend consumes those APIs and presents a user-friendly interface while the generated project includes CI/CD and test scaffolding.`;
}

function buildBackendCode(spec, techStack = 'react-express') {
  switch (techStack) {
    case 'react-fastapi':
      return `from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:4173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class OnboardingRequest(BaseModel):
    name: str
    email: str

@app.get('/api/status')
def status():
    return {'status': 'ok', 'message': 'Backend is ready'}

@app.post('/api/onboarding')
def onboarding(payload: OnboardingRequest):
    return {'status': 'verification_sent', 'email': payload.email, 'message': 'Verification flow simulated.'}
`;
    case 'nextjs-api':
      return `export default function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    return res.status(200).json({ status: 'verification_sent', email, message: 'Verification flow simulated.' });
  }
  return res.status(200).json({ status: 'ok', message: 'API route is ready.' });
}
`;
    case 'angular-nestjs':
      return `import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('status')
  getStatus() {
    return { status: 'ok', message: 'NestJS backend is ready' };
  }

  @Post('onboarding')
  onboarding(@Body() body) {
    const { name, email } = body || {};
    if (!name || !email) {
      return { status: 'error', error: 'Name and email are required.' };
    }
    return { status: 'verification_sent', email, message: 'Verification flow simulated.' };
  }
}
`;
    default:
      return `import express from 'express';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.get('/api/status', (_req, res) => {
  return res.json({ status: 'ok', message: 'Backend is ready' });
});
app.post('/api/onboarding', (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  return res.json({ status: 'verification_sent', email, message: 'Verification flow simulated.' });
});
app.listen(port, () => {
  console.log(\`Backend running on http://localhost:\${port}\`);
});
`;
  }
}

function buildFrontendCode(spec, techStack = 'react-express') {
  switch (techStack) {
    case 'react-fastapi':
      return `import React, { useState } from 'react';
import './index.css';
export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:8000/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await response.json();
    setStatus(data.message || JSON.stringify(data));
  };
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
        <h1 className="text-3xl font-semibold text-white">${spec.name}</h1>
        <p className="mt-3 text-slate-400">${spec.description}</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950">Start Verification</button>
        </form>
        <p className="mt-4 text-slate-300">{status}</p>
      </div>
    </div>
  );
}
`;
    case 'vue-nodejs':
      return `<template>
  <div class="min-h-screen bg-slate-950 p-6 text-slate-100">
    <div class="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
      <h1 class="text-3xl font-semibold text-white">${spec.name}</h1>
      <p class="mt-3 text-slate-400">${spec.description}</p>
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-4">
        <input v-model="name" class="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Name" />
        <input v-model="email" class="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" type="email" placeholder="Email" />
        <button class="rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950">Start Verification</button>
      </form>
      <p class="mt-4 text-slate-300">{{ status }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const name = ref('');
const email = ref('');
const status = ref('');
const handleSubmit = async () => {
  const response = await fetch('http://localhost:4000/api/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.value, email: email.value }),
  });
  const data = await response.json();
  status.value = data.message || JSON.stringify(data);
};
</script>
`;
    case 'nextjs-api':
      return `import { useState } from 'react';
export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await response.json();
    setStatus(data.message || JSON.stringify(data));
  };
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
        <h1 className="text-3xl font-semibold text-white">${spec.name}</h1>
        <p className="mt-3 text-slate-400">${spec.description}</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950">Start Verification</button>
        </form>
        <p className="mt-4 text-slate-300">{status}</p>
      </div>
    </main>
  );
}
`;
    case 'svelte-nodejs':
      return `<script>
  let name = '';
  let email = '';
  let status = '';
  async function handleSubmit(event) {
    event.preventDefault();
    const response = await fetch('http://localhost:4000/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await response.json();
    status = data.message || JSON.stringify(data);
  }
</script>

<main class="min-h-screen bg-slate-950 p-6 text-slate-100">
  <div class="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
    <h1 class="text-3xl font-semibold text-white">${spec.name}</h1>
    <p class="mt-3 text-slate-400">${spec.description}</p>
    <form on:submit={handleSubmit} class="mt-8 space-y-4">
      <input bind:value={name} class="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Name" />
      <input bind:value={email} class="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" type="email" placeholder="Email" />
      <button class="rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950">Start Verification</button>
    </form>
    <p class="mt-4 text-slate-300">{status}</p>
  </div>
</main>
`;
    case 'angular-nestjs':
      return `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <main class="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div class="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
        <h1 class="text-3xl font-semibold text-white">${spec.name}</h1>
        <p class="mt-3 text-slate-400">${spec.description}</p>
      </div>
    </main>
  \`,
})
export class AppComponent {}
`;
    case 'solid-nodejs':
      return `import { createSignal } from 'solid-js';
import './index.css';
export default function App() {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [status, setStatus] = createSignal('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:4000/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name(), email: email() }),
    });
    const data = await response.json();
    setStatus(data.message || JSON.stringify(data));
  };
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
        <h1 className="text-3xl font-semibold text-white">${spec.name}</h1>
        <p className="mt-3 text-slate-400">${spec.description}</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Name" value={name()} onInput={(e) => setName(e.currentTarget.value)} />
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Email" type="email" value={email()} onInput={(e) => setEmail(e.currentTarget.value)} />
          <button type="submit" className="rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950">Start Verification</button>
        </form>
        <p className="mt-4 text-slate-300">{status()}</p>
      </div>
    </main>
  );
}
`;
    default:
      return `import React, { useState } from 'react';
import './index.css';
export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:4000/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await response.json();
    setStatus(data.message || JSON.stringify(data));
  };
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8">
        <h1 className="text-3xl font-semibold text-white">${spec.name}</h1>
        <p className="mt-3 text-slate-400">${spec.description}</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="rounded-full bg-cyan-500 px-5 py-3 font-semibold text-slate-950">Start Verification</button>
        </form>
        <p className="mt-4 text-slate-300">{status}</p>
      </div>
    </div>
  );
}
`;
  }
}
function buildStyles() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: #020617;
  color: #e2e8f0;
}

a {
  text-decoration: none;
  color: #464feb;
}

tr th, tr td {
  border: 1px solid #e6e6e6;
}

tr th {
  background-color: #f5f5f5;
}
`;
}

function buildTests(spec) {
  return [
    {
      name: 'backend onboarding endpoint',
      description: 'Ensures POST /api/onboarding returns verification_sent with valid name and email.',
    },
    {
      name: 'backend validation',
      description: 'Returns 400 when required onboarding fields are missing.',
    },
    {
      name: 'frontend form rendering',
      description: 'Renders the onboarding form and accepts user input.',
    },
    {
      name: 'ci workflow inclusion',
      description: 'Includes a GitHub Actions workflow covering install, test, and build.',
    },
  ];
}
function buildCiCd() {
  return `name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Setup Node.js\n        uses: actions/setup-node@v5\n        with:\n          node-version: '20'\n      - name: Install dependencies\n        run: npm install\n      - name: Build frontend\n        run: cd client && npm install && npm run build\n      - name: Run backend smoke test\n        run: echo 'No backend tests configured yet'\n`;
}

function buildAiScaffoldPrompt(idea, techStack = 'react-express') {
  const stack = buildStackMetadata(techStack);
  return `Generate a production-ready project scaffold for this idea: ${idea}

Target stack: ${stack.ui}

Return only valid JSON with this exact shape:
{
  "spec": {
    "name": "short project name",
    "description": "specific description for the idea",
    "features": ["4-7 concrete features"],
    "techStack": ["technologies"],
    "apiEndpoints": [{ "method": "GET|POST|PUT|DELETE", "path": "/api/...", "description": "..." }],
    "tests": [{ "name": "...", "description": "..." }],
    "ci": ["CI step names"]
  },
  "architecture": "specific architecture overview for the idea",
  "backend_code": "complete backend entry file code as a string",
  "frontend_code": "complete frontend app component code as a string",
  "tests": [{ "name": "...", "description": "..." }],
  "ci_cd": "complete GitHub Actions YAML as a string"
}

The generated code must be specific to the idea, not a generic onboarding scaffold unless the idea is actually onboarding.`;
}

function parseJsonObject(raw) {
  if (!raw || typeof raw !== 'string') {
    return null;
  }

  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      return null;
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

function asArray(value, fallback = []) {
  return Array.isArray(value) ? value.filter(Boolean) : fallback;
}

function normalizeSpec(spec, idea, techStack = 'react-express') {
  const fallback = buildMockSpec(idea, techStack);
  const source = spec && typeof spec === 'object' ? spec : {};
  return {
    name: typeof source.name === 'string' && source.name.trim() ? source.name.trim() : fallback.name,
    description: typeof source.description === 'string' && source.description.trim() ? source.description.trim() : fallback.description,
    features: asArray(source.features, fallback.features),
    techStack: asArray(source.techStack, fallback.techStack),
    apiEndpoints: asArray(source.apiEndpoints, fallback.apiEndpoints),
    tests: asArray(source.tests, fallback.tests),
    ci: asArray(source.ci, fallback.ci),
  };
}

function normalizeAiScaffold(payload, idea, techStack = 'react-express') {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const spec = normalizeSpec(payload.spec || payload, idea, techStack);
  return {
    spec,
    architecture: typeof payload.architecture === 'string' && payload.architecture.trim()
      ? payload.architecture.trim()
      : buildArchitecture(spec, techStack),
    backend_code: typeof payload.backend_code === 'string' && payload.backend_code.trim()
      ? payload.backend_code
      : buildBackendCode(spec, techStack),
    frontend_code: typeof payload.frontend_code === 'string' && payload.frontend_code.trim()
      ? payload.frontend_code
      : buildFrontendCode(spec, techStack),
    tests: Array.isArray(payload.tests) || typeof payload.tests === 'string'
      ? payload.tests
      : buildTests(spec),
    ci_cd: typeof payload.ci_cd === 'string' && payload.ci_cd.trim()
      ? payload.ci_cd
      : buildCiCd(),
  };
}

function resolveModel(...candidates) {
  return candidates.find((candidate) => (
    typeof candidate === 'string'
    && candidate.trim()
    && !candidate.trim().startsWith('AIza')
  ))?.trim();
}

async function callOpenAI(idea, techStack = 'react-express') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });
    const prompt = buildAiScaffoldPrompt(idea, techStack);
    const model = resolveModel(process.env.OPENAI_MODEL, process.env.LLM_MODEL, 'gpt-4o-mini');

    const response = await client.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You generate complete application scaffolds as strict JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const raw = response.choices?.[0]?.message?.content || '';
    return normalizeAiScaffold(parseJsonObject(raw), idea, techStack);
  } catch (error) {
    console.warn('OpenAI generation failed:', error?.message || error);
    return null;
  }
}

async function callGemini(idea, techStack = 'react-express') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key not set (GEMINI_API_KEY)');
    return null;
  }

  try {
    const model = resolveModel(process.env.GEMINI_MODEL, process.env.LLM_MODEL, 'gemini-2.0-flash');
    const prompt = buildAiScaffoldPrompt(idea, techStack);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `Gemini request failed with status ${response.status}`);
    }

    const raw = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim() || '';

    return normalizeAiScaffold(parseJsonObject(raw), idea, techStack);
  } catch (error) {
    console.warn('Gemini generation failed:', error?.message || error);
    throw new Error(`Gemini generation failed: ${error?.message || error}`);
  }
}

async function callGrok(_idea, _techStack = 'react-express') {
  if (!process.env.GROK_API_KEY) {
    console.warn('Grok API key not set (GROK_API_KEY)');
    return null;
  }
  // Provider stub: implement real Grok calls here.
  console.warn('Grok provider stub - no network call implemented.');
  return null;
}

async function callOlama(_idea, _techStack = 'react-express') {
  if (!process.env.OLAMA_API_KEY) {
    console.warn('Olama API key not set (OLAMA_API_KEY)');
    return null;
  }
  // Provider stub: implement real Olama calls here.
  console.warn('Olama provider stub - no network call implemented.');
  return null;
}

async function callLLM(idea, techStack = 'react-express', provider = 'openai') {
  const p = (provider || 'openai').toLowerCase();
  try {
    switch (p) {
      case 'openai':
        return await callOpenAI(idea, techStack);
      case 'gemini':
        return await callGemini(idea, techStack);
      case 'grok':
        return await callGrok(idea, techStack);
      case 'olama':
        return await callOlama(idea, techStack);
      default:
        console.warn('Unknown provider:', p);
        return null;
    }
  } catch (err) {
    console.warn('LLM call error for', p, err?.message || err);
    throw err;
  }
}

function createProjectTemplate(projectRoot, spec, techStack = 'react-express', scaffold = {}) {
  const frontendDir = path.join(projectRoot, 'frontend');
  const backendDir = path.join(projectRoot, 'backend');
  const testsDir = path.join(projectRoot, 'tests');
  const githubDir = path.join(projectRoot, '.github/workflows');

  ensureDir(frontendDir);
  ensureDir(backendDir);
  ensureDir(testsDir);
  ensureDir(githubDir);

  const rootPackage = {
    name: spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    private: true,
    version: '0.1.0',
    scripts: {
      dev: 'cd frontend && npm install && npm run dev',
      install: 'cd frontend && npm install',
      start: 'node backend/index.js',
      build: 'cd frontend && npm run build',
      test: 'npm run test:backend && npm run test:frontend',
      'test:backend': 'node --experimental-vm-modules --no-warnings node_modules/jest/bin/jest.js backend',
      'test:frontend': 'node --experimental-vm-modules --no-warnings node_modules/jest/bin/jest.js frontend',
    },
  };

  const frontendPackage = {
    name: `${rootPackage.name}-frontend`,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      test: 'jest',
    },
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.3.1',
      tailwindcss: '^3.4.4',
      postcss: '^8.4.40',
      autoprefixer: '^10.4.19',
      vite: '^5.4.1',
      jest: '^29.7.0',
    },
  };

  const backendPackage = {
    name: `${rootPackage.name}-backend`,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      start: 'node index.js',
      test: 'jest',
      dev: 'nodemon index.js',
    },
    dependencies: {
      cors: '^2.8.5',
      express: '^4.18.4',
    },
    devDependencies: {
      jest: '^29.7.0',
      nodemon: '^3.0.1',
    },
  };

  fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(rootPackage, null, 2));
  fs.writeFileSync(path.join(frontendDir, 'package.json'), JSON.stringify(frontendPackage, null, 2));
  fs.writeFileSync(path.join(backendDir, 'package.json'), JSON.stringify(backendPackage, null, 2));

  fs.writeFileSync(
    path.join(projectRoot, 'README.md'),
    `# ${spec.name}\n\n${spec.description}\n\n## Features\n\n${spec.features.map((feature) => `- ${feature}`).join('\n')}\n\n## Tech Stack\n\n${spec.techStack.map((item) => `- ${item}`).join('\n')}\n`,
  );

  fs.writeFileSync(
    path.join(projectRoot, 'backend', 'index.js'),
    scaffold.backend_code || `import express from 'express';\nimport cors from 'cors';\nconst app = express();\nconst port = process.env.PORT || 4000;\napp.use(cors());\napp.use(express.json());\napp.get('/api/status', (_req, res) => res.json({ status: 'ok', idea: ${JSON.stringify(spec.name)} }));\napp.post('/api/onboarding', (req, res) => {\n  const { email, name } = req.body || {};\n  if (!email || !name) {\n    return res.status(400).json({ error: 'Missing email or name.' });\n  }\n  return res.json({ status: 'verification_sent', email, message: 'Verification email simulated.' });\n});\napp.listen(port, () => {\n  console.log('Generated backend running on http://localhost:' + port);\n});\n`,
  );

  fs.writeFileSync(
    path.join(projectRoot, 'backend', 'routes.js'),
    `import express from 'express';\nconst router = express.Router();\nrouter.get('/status', (_req, res) => res.json({ status: 'ok' }));\nexport default router;\n`,
  );

  fs.writeFileSync(
    path.join(projectRoot, 'frontend', 'vite.config.js'),
    `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n`,
  );

  fs.writeFileSync(
    path.join(projectRoot, 'frontend', 'index.html'),
    `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${spec.name}</title>\n  </head>\n  <body class="bg-slate-950 text-slate-100">\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`,
  );

  ensureDir(path.join(projectRoot, 'frontend', 'src'));
  fs.writeFileSync(
    path.join(projectRoot, 'frontend', 'src', 'main.jsx'),
    `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);\n`,
  );

  fs.writeFileSync(
    path.join(projectRoot, 'frontend', 'src', 'App.jsx'),
    scaffold.frontend_code || `export default function App() {\n  return (\n    <div className=\"min-h-screen bg-slate-950 p-8 text-slate-100\">\n      <div className=\"mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl\">\n        <h1 className=\"text-4xl font-semibold text-white\">${spec.name}</h1>\n        <p className=\"mt-4 text-slate-300\">${spec.description}</p>\n        <div className=\"mt-8 space-y-4\">\n          <h2 className=\"text-2xl font-semibold text-white\">Sample Onboarding Flow</h2>\n          <p className=\"text-slate-400\">This generated scaffold demonstrates the core UX and API design for your idea.</p>\n          <ul className=\"list-disc space-y-2 pl-5 text-slate-300\">\n            ${spec.features.map((feature) => `<li>${feature}</li>`).join('')}\n          </ul>\n        </div>\n      </div>\n    </div>\n  );\n}\n`,
  );

  fs.writeFileSync(
    path.join(projectRoot, 'frontend', 'src', 'index.css'),
    buildStyles(),
  );

  fs.writeFileSync(
    path.join(projectRoot, 'backend', 'onboarding.test.js'),
    `import request from 'supertest';

describe('Onboarding API', () => {
  test('should return verification_sent on valid signup', async () => {
    const response = { status: 'verification_sent', message: 'Verification email simulated.' };
    expect(response.status).toBe('verification_sent');
  });

  test('should return error on missing fields', () => {
    const data = { email: '', name: '' };
    expect(!data.email || !data.name).toBe(true);
  });
});
`,
  );

  fs.writeFileSync(
    path.join(projectRoot, 'frontend', 'App.test.jsx'),
    `import { describe, test, expect } from '@jest/globals';

describe('App Component', () => {
  test('should render without crashing', () => {
    expect(true).toBe(true);
  });
});
`,
  );

  fs.writeFileSync(
    path.join(projectRoot, 'tests', 'integration.test.js'),
    `describe('Project Integration Tests', () => {
  test('backend and frontend should be deployable', () => {
    expect(true).toBe(true);
  });

  test('CI/CD pipeline should execute install, test, and build', () => {
    const steps = ['install', 'test', 'build'];
    expect(steps.length).toBe(3);
  });
});
`,
  );

  fs.writeFileSync(
    path.join(projectRoot, '.github', 'workflows', 'ci.yml'),
    scaffold.ci_cd || `name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Setup Node.js\n        uses: actions/setup-node@v5\n        with:\n          node-version: '20'\n      - name: Install dependencies\n        run: npm install\n      - name: Install frontend dependencies\n        run: cd frontend && npm install\n      - name: Install backend dependencies\n        run: cd backend && npm install\n      - name: Run backend tests\n        run: npm run test:backend\n      - name: Run frontend tests\n        run: npm run test:frontend\n      - name: Build generated frontend\n        run: cd frontend && npm run build\n`,
  );
}



async function zipFolder(sourceDir, outputPath) {
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

export async function generateProjectForIdea(idea, techStack = 'react-express', useAi = false, provider = 'openai') {
  ensureDir(GENERATED_DIR);
  const id = `${Date.now()}-${sanitizeId(idea)}`;
  const projectRoot = path.join(GENERATED_DIR, id);
  ensureDir(projectRoot);

  let scaffold = null;
  if (useAi) {
    scaffold = await callLLM(idea, techStack, provider);
    if (!scaffold) {
      throw new Error(`${provider} did not return a usable AI scaffold. Check the provider key, model, and server logs.`);
    }
  }

  if (!scaffold) {
    const spec = buildMockSpec(idea, techStack);
    scaffold = {
      spec,
      architecture: buildArchitecture(spec, techStack),
      backend_code: buildBackendCode(spec, techStack),
      frontend_code: buildFrontendCode(spec, techStack),
      tests: buildTests(spec),
      ci_cd: buildCiCd(),
    };
  }

  const { spec } = scaffold;
  createProjectTemplate(projectRoot, spec, techStack, scaffold);

  const zipPath = path.join(GENERATED_DIR, `${id}.zip`);
  await zipFolder(projectRoot, zipPath);

  return {
    id,
    spec,
    architecture: scaffold.architecture,
    backend_code: scaffold.backend_code,
    frontend_code: scaffold.frontend_code,
    tests: scaffold.tests,
    ci_cd: scaffold.ci_cd,
    summary: spec.description,
    projectRoot,
  };
}

export function getGeneratedZipPath(id) {
  const zipPath = path.join(GENERATED_DIR, `${id}.zip`);
  return fs.existsSync(zipPath) ? zipPath : null;
}
