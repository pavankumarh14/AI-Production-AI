import { useState, useRef, useEffect } from 'react';

function App() {
  const [idea, setIdea] = useState('Build a user onboarding flow with email verification');
  const [techStack, setTechStack] = useState('react-express');
  const [provider, setProvider] = useState('openai');
  const [useAiMode, setUseAiMode] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const providerRef = useRef(null);

  useEffect(() => {
    if (aiModalOpen && providerRef.current) {
      providerRef.current.focus();
    }
  }, [aiModalOpen]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('Spec');
  const [error, setError] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [validating, setValidating] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);

  function validateProject() {
    if (!result) {
      setValidationMessage('❌ No project generated yet.');
      return;
    }

    setValidating(true);
    setValidationMessage('');

    setTimeout(() => {
      const checks = [];

      // Check code strings are non-empty
      if (!result.backend_code || result.backend_code.trim().length === 0) {
        checks.push('❌ Backend code is empty');
      }
      if (!result.frontend_code || result.frontend_code.trim().length === 0) {
        checks.push('❌ Frontend code is empty');
      }
      if (!result.ci_cd || result.ci_cd.trim().length === 0) {
        checks.push('❌ CI/CD config is empty');
      }

      // Check required files/data exist
      if (!result.spec || Object.keys(result.spec).length === 0) {
        checks.push('❌ Project specification is missing');
      }
      if (!Array.isArray(result.tests) || result.tests.length === 0) {
        checks.push('❌ Test cases are missing');
      }
      if (!result.architecture || result.architecture.trim().length === 0) {
        checks.push('❌ Architecture definition is missing');
      }

      if (checks.length === 0) {
        setValidationMessage('✅ Build passed. Ready to deploy.');
      } else {
        setValidationMessage(checks.join('\n'));
      }

      setValidating(false);
    }, 500);
  }

  async function handleGenerate() {
    // Ensure AI mode is off for non-AI generation
    setUseAiMode(false);
    if (!idea.trim()) {
      setError('Please describe your product idea.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setAgentLogs([]);

    const logs = ['🚀 Starting project generation...', '📋 PM generating spec...'];
    setAgentLogs(logs);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      logs.push('💻 Dev writing backend code...');
      setAgentLogs([...logs]);

      await new Promise(resolve => setTimeout(resolve, 600));
      logs.push('🎨 Dev writing frontend code...');
      setAgentLogs([...logs]);

      await new Promise(resolve => setTimeout(resolve, 600));
      logs.push('🧪 QA generating tests...');
      setAgentLogs([...logs]);

      await new Promise(resolve => setTimeout(resolve, 600));
      logs.push('⚙️ Engineer creating CI/CD config...');
      setAgentLogs([...logs]);

      await new Promise(resolve => setTimeout(resolve, 400));

      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, techStack, provider }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate project');
      }
      logs.push('✅ Project generated successfully!');
      setAgentLogs([...logs]);
      setResult(data);
      setActiveTab('Spec');
    } catch (err) {
      setError(err.message);
      logs.push(`❌ Error: ${err.message}`);
      setAgentLogs([...logs]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">AI Production OS</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Generate a production-ready project scaffold from idea text.</h1>
          <p className="mt-4 max-w-3xl text-slate-400">Describe a product or feature idea and the system generates a product spec, backend + frontend scaffold, tests, CI/CD config, and a downloadable zip.</p>
        </header>

        <section className="space-y-4">
          <label className="block text-sm font-medium text-slate-300" htmlFor="idea">Product / Feature idea</label>
          <textarea
            id="idea"
            rows="6"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-slate-100 shadow-inner outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="tech-stack">Tech Stack</label>
              <select
                id="tech-stack"
                value={techStack}
                onChange={(event) => setTechStack(event.target.value)}
                disabled={loading}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
              >
                <option value="react-express">React + Express</option>
                <option value="react-fastapi">React + FastAPI</option>
                <option value="vue-nodejs">Vue + Node.js</option>
                <option value="nextjs-api">Next.js + API Routes</option>
                <option value="svelte-nodejs">Svelte + Node.js</option>
                <option value="angular-nestjs">Angular + NestJS</option>
                <option value="solid-nodejs">Solid + Node.js</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">AI Mode</label>
                <button
                  type="button"
                  onClick={() => setUseAiMode((v) => !v)}
                  className={`ml-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition ${useAiMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {useAiMode ? 'On' : 'Off'}
                </button>
              </div>
              {useAiMode && (
                <select
                  id="provider"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value)}
                  disabled={loading}
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-60"
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                  <option value="grok">Grok</option>
                  <option value="olama">Olama</option>
                </select>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '⏳ Generating...' : 'Generate Project'}
          </button>
          <button
            onClick={() => {
              // Open modal to choose provider and confirm AI generation.
              setAiModalOpen(true);
              // remove focus from Generate Project so it doesn't appear selected
              try { document.activeElement && document.activeElement.blur(); } catch (e) {}
              setAgentLogs(['🤖 Select an LLM provider in the modal']);
            }}
            disabled={loading || aiLoading}
            className={`ml-3 inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${useAiMode || aiLoading ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500' : 'bg-transparent text-cyan-300 hover:bg-slate-800'}`}
          >
            {aiLoading ? '⏳ AI Generating...' : 'AI generated Project'}
          </button>

          {aiModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6">
                <h3 className="text-lg font-semibold text-white">AI Generation</h3>
                <p className="mt-2 text-sm text-slate-400">Choose an LLM provider and confirm to generate the project using AI.</p>
                <div className="mt-4">
                  <label className="block text-sm text-slate-300">LLM Provider</label>
                  <select
                    ref={providerRef}
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Gemini</option>
                    <option value="grok">Grok</option>
                    <option value="olama">Olama</option>
                  </select>
                </div>
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setAiModalOpen(false)}
                    className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      // Close modal and run AI generation
                      setAiModalOpen(false);
                      if (!idea.trim()) { setError('Please describe your product idea.'); return; }
                      setError('');
                      setAiLoading(true);
                      setResult(null);
                      setAgentLogs(['🤖 Asking AI to generate project via LLM...']);
                      try {
                        const response = await fetch('/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ idea, techStack, useAI: true, provider }),
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error || 'AI generation failed');
                        setAgentLogs((l) => [...l, '✅ AI returned project scaffold']);
                        setResult(data);
                        setActiveTab('Spec');
                      } catch (err) {
                        setError(err.message);
                        setAgentLogs((l) => [...l, `❌ Error: ${err.message}`]);
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    Generate with AI
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && agentLogs.length > 0 && (
            <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-950/80 p-6">
              <h3 className="text-sm font-semibold text-cyan-300">Agent Progress</h3>
              <div className="mt-4 space-y-2">
                {agentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyan-400 animate-spin"></div>
                <span className="text-xs text-slate-400">Building your project...</span>
              </div>
            </div>
          )}
        </section>

        {result && (
          <section className="mt-10">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <div className="flex flex-wrap gap-2">
                {['Spec', 'Architecture', 'Code', 'Tests', 'CI/CD'].map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-3xl bg-slate-900 p-6 text-slate-100">
                {activeTab === 'Spec' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white">Product Specification</h3>
                    <pre className="mt-4 overflow-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-100">
                      {JSON.stringify(result.spec, null, 2)}
                    </pre>
                  </div>
                )}

                {activeTab === 'Architecture' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white">Architecture Overview</h3>
                    <p className="mt-4 whitespace-pre-line text-slate-300">{result.architecture}</p>
                  </div>
                )}

                {activeTab === 'Code' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Backend Code</h3>
                      <pre className="mt-4 overflow-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-100">
                        <code>{result.backend_code}</code>
                      </pre>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Frontend Code</h3>
                      <pre className="mt-4 overflow-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-100">
                        <code>{result.frontend_code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'Tests' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white">Generated Tests</h3>
                    <div className="mt-4 space-y-3 text-slate-300">
                      {Array.isArray(result.tests)
                        ? result.tests.map((test, index) => (
                            <div key={index}>
                              <strong className="text-white">{test.name}:</strong> {test.description}
                            </div>
                          ))
                        : <pre className="overflow-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-100"><code>{result.tests}</code></pre>}
                    </div>
                  </div>
                )}

                {activeTab === 'CI/CD' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white">CI/CD Pipeline</h3>
                    <pre className="mt-4 overflow-auto rounded-3xl bg-slate-950 p-4 text-sm text-slate-100">
                      <code>{result.ci_cd}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border-2 border-slate-700 bg-slate-950/80 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Quality Check</h3>
                  <p className="mt-2 text-slate-400">Validate that all project files and code are properly generated.</p>
                </div>
                <button
                  onClick={validateProject}
                  disabled={validating || !result}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-amber-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {validating ? '⏳ Validating...' : '✓ Validate'}
                </button>
              </div>
              {validationMessage && (
                <div className={`mt-4 rounded-3xl p-4 ${
                  validationMessage.startsWith('✅')
                    ? 'border border-green-500/50 bg-green-500/10 text-green-300'
                    : 'border border-red-500/50 bg-red-500/10 text-red-300'
                }`}>
                  <pre className="whitespace-pre-wrap text-sm font-semibold">{validationMessage}</pre>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 to-cyan-400/5 p-8 shadow-lg shadow-cyan-500/20">
              <div className="flex flex-col items-center justify-center text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <h3 className="text-2xl font-bold text-cyan-300">🎉 Ready to Use!</h3>
                  <p className="mt-2 text-slate-300">Download your complete project scaffold with all frontend, backend, tests, and CI/CD configuration.</p>
                </div>
                <a
                  href={result.downloadUrl}
                  download
                  className="mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-cyan-500 px-8 py-4 text-lg font-bold text-slate-950 transition hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50 sm:mt-0"
                >
                  👉 Download Project
                </a>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
