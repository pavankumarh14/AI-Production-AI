import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateProjectForIdea, getGeneratedZipPath } from './generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 4174;
const clientDistDir = path.join(__dirname, '../dist');
const generatedDir = path.join(__dirname, '../generated');

app.use(cors());
app.use(express.json());
app.use('/generated', express.static(generatedDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'AI Production OS backend' });
});

app.post('/generate', async (req, res) => {
  const { idea, techStack, useAI, provider } = req.body || {};
  if (!idea || typeof idea !== 'string' || !idea.trim()) {
    return res.status(400).json({ error: 'Idea text is required.' });
  }

  // If AI requested, ensure the provider's API key exists in environment
  if (useAI) {
    const chosen = (provider || process.env.LLM_PROVIDER || 'openai').toLowerCase();
    const envMap = {
      openai: 'OPENAI_API_KEY',
      gemini: 'GEMINI_API_KEY',
      grok: 'GROK_API_KEY',
      olama: 'OLAMA_API_KEY',
    };
    const required = envMap[chosen] || 'OPENAI_API_KEY';
    if (!process.env[required]) {
      return res.status(400).json({ error: `${chosen} requested but ${required} is not set on the server.` });
    }
  }

  try {
    const result = await generateProjectForIdea(idea.trim(), techStack || 'react-express', Boolean(useAI), (provider || process.env.LLM_PROVIDER || 'openai').toLowerCase());
    const downloadUrl = `/download/${result.id}`;
    res.json({ ...result, downloadUrl });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate project scaffold.' });
  }
});

app.get('/download/:id', (req, res) => {
  const { id } = req.params;
  const zipPath = getGeneratedZipPath(id);
  if (!zipPath) {
    return res.status(404).json({ error: 'Project archive not found.' });
  }
  res.download(zipPath, `${id}.zip`);
});

app.use(express.static(clientDistDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`AI Production OS backend is running on http://localhost:${port}`);
});
