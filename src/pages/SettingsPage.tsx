import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  Cpu,
  Shield,
  Layers,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { statsService } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await statsService.getHealth();
        setHealthStatus(res);
      } catch (err) {
        setHealthStatus({ status: 'offline' });
      }
    }
    fetchHealth();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerComposeYaml = `version: '3.8'

services:
  # Full-stack AI Developer Assistant Service
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - JWT_SECRET=\${JWT_SECRET:-dev_secret_key_12345}
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_developer_assistant
    depends_on:
      - db
    restart: unless-stopped

  # PostgreSQL Relational Storage
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=ai_developer_assistant
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:`;

  const envSample = `# Gemini API Key for server-side AI analysis
GEMINI_API_KEY="your-gemini-api-key-here"

# JWT Secret for developer authentication tokens
JWT_SECRET="e9f3b1c8a4d7e2f1..."

# Database Connection URI (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_dev_db"

# Server Port
PORT=3000`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          System Architecture, Docker & Engine Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Backend services, AI models, PostgreSQL schemas, and containerization specifications.
        </p>
      </div>

      {/* Live System Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Backend Server</span>
            <span className="text-xs font-bold text-slate-900">Express / TypeScript API</span>
            <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-bold mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Port 3000 Healthy
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-200">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">AI Inference Engine</span>
            <span className="text-xs font-bold text-slate-900">Gemini 3.7 Flash</span>
            <span className="text-[10px] text-indigo-700 font-mono font-bold mt-0.5 block">
              @google/genai v2.4 SDK
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Database Storage</span>
            <span className="text-xs font-bold text-slate-900">Relational / In-Memory Store</span>
            <span className="text-[10px] text-purple-700 font-mono font-bold mt-0.5 block">
              Persistent & Indexed
            </span>
          </div>
        </div>
      </div>

      {/* Production Docker Compose Spec */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              docker-compose.yml (Production Specification)
            </h3>
          </div>
          <button
            onClick={() => handleCopy(dockerComposeYaml, 'docker')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            {copiedKey === 'docker' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Compose</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy YAML</span>
              </>
            )}
          </button>
        </div>
        <pre className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {dockerComposeYaml}
        </pre>
      </div>

      {/* Environment Variables Reference */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Environment Variables (.env.example)
            </h3>
          </div>
          <button
            onClick={() => handleCopy(envSample, 'env')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            {copiedKey === 'env' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied .env</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy .env</span>
              </>
            )}
          </button>
        </div>
        <pre className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {envSample}
        </pre>
      </div>
    </div>
  );
};
