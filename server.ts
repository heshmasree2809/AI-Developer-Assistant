import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db';
import {
  performReview,
  detectBugs,
  suggestRefactoring,
  generateTests,
  generateDocumentation,
  explainCode,
} from './server/aiService';
import { AnalysisType, Language } from './src/types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'ai-dev-assistant-secret-jwt-key-2025';
const PORT = 3000;

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

function generateToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed authorization token' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

// Optional auth middleware for guest / trial analyses
function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      req.user = decoded;
    } catch {
      // Ignore invalid optional token
    }
  }
  next();
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      llmProvider: process.env.LLM_PROVIDER || 'gemini',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // System Configuration Info
  app.get('/api/config', (req, res) => {
    const rawModel = process.env.LLM_MODEL?.trim();
    const isDeprecated = rawModel && [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-2.0-flash',
      'gemini-2.0-pro',
      'gemini-2.0-flash-thinking',
    ].includes(rawModel);

    res.json({
      appName: 'AI Developer Assistant',
      version: '2.4.0',
      defaultModel: !isDeprecated && rawModel ? rawModel : 'gemini-3.7-flash',
      supportedLanguages: [
        'python', 'typescript', 'javascript', 'java', 'csharp', 'go', 'rust', 'cpp', 'php', 'sql', 'ruby'
      ],
      features: [
        'Code Review', 'Bug Detection', 'Refactoring', 'Unit Tests', 'Documentation', 'Code Explanation'
      ]
    });
  });

  // ----------------------------------------------------
  // AUTHENTICATION ROUTES
  // ----------------------------------------------------
  app.post(['/api/auth/register', '/auth/register'], (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      const existing = db.findUserByEmail(email);
      if (existing) {
        res.status(400).json({ error: 'An account with this email address already exists' });
        return;
      }

      const user = db.createUser(name, email, password);
      const token = generateToken(user.id, user.email);

      res.status(201).json({
        message: 'Account registered successfully',
        token,
        user,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  app.post(['/api/auth/login', '/auth/login'], (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = db.findUserByEmail(email);
      if (!user || !db.verifyPassword(user, password)) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = generateToken(user.id, user.email);
      res.json({
        message: 'Login successful',
        token,
        user,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  app.get(['/api/users/me', '/users/me'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const user = db.findUserById(userId);
    if (!user) {
      res.json({ user: null });
      return;
    }
    res.json({ user });
  });

  // ----------------------------------------------------
  // PROJECT MANAGEMENT ROUTES
  // ----------------------------------------------------
  app.get(['/api/projects', '/projects'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const projects = db.getProjects(userId);
    res.json({ projects });
  });

  app.post(['/api/projects', '/projects'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id || 'user-demo-1';
      const { name, description, tags } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Project name is required' });
        return;
      }
      const project = db.createProject(userId, name, description || '', tags || []);
      res.status(201).json({ project });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create project' });
    }
  });

  app.get(['/api/projects/:id', '/projects/:id'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const project = db.getProjectById(req.params.id, userId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const files = db.getProjectFiles(req.params.id, userId);
    res.json({ project, files });
  });

  app.put(['/api/projects/:id', '/projects/:id'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const { name, description, tags } = req.body;
    const updated = db.updateProject(req.params.id, userId, { name, description, tags });
    if (!updated) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ project: updated });
  });

  app.delete(['/api/projects/:id', '/projects/:id'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const success = db.deleteProject(req.params.id, userId);
    if (!success) {
      res.status(404).json({ error: 'Project not found or could not be deleted' });
      return;
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  });

  // Project Files
  app.get(['/api/projects/:id/files', '/projects/:id/files'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const files = db.getProjectFiles(req.params.id, userId);
    res.json({ files });
  });

  app.post(['/api/projects/:id/files', '/projects/:id/files'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const { name, language, content } = req.body;
    if (!name || !content) {
      res.status(400).json({ error: 'File name and code content are required' });
      return;
    }
    const file = db.addProjectFile(req.params.id, userId, name, language || 'python', content);
    if (!file) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.status(201).json({ file });
  });

  app.delete(['/api/projects/:id/files/:fileId', '/projects/:id/files/:fileId'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const success = db.deleteProjectFile(req.params.fileId, req.params.id, userId);
    if (!success) {
      res.status(404).json({ error: 'File not found' });
      return;
    }
    res.json({ success: true, message: 'File deleted successfully' });
  });

  // ----------------------------------------------------
  // AI CODE ANALYSIS ROUTES
  // ----------------------------------------------------
  app.post(['/api/analysis/review', '/analysis/review'], optionalAuthMiddleware, async (req: AuthRequest, res) => {
    try {
      const { code, language = 'python', projectId, focus = 'General Quality' } = req.body;
      if (!code || typeof code !== 'string' || !code.trim()) {
        res.status(400).json({ error: 'Source code cannot be empty' });
        return;
      }

      const result = await performReview(code, language, focus);
      const userId = req.user?.id || 'user-demo-1';
      let projectName: string | undefined;

      if (projectId) {
        const p = db.getProjectById(projectId, userId);
        projectName = p?.name;
      }

      const record = db.createAnalysis({
        userId,
        projectId,
        projectName,
        language: language as Language,
        analysisType: 'review',
        sourceCode: code,
        aiResponse: result,
        score: result.score,
        issueCount: result.issues?.length || 0,
      });

      res.json({
        id: record.id,
        analysisType: 'review',
        language,
        result,
        record,
      });
    } catch (err: any) {
      console.error('Review endpoint error:', err);
      res.status(500).json({ error: err.message || 'Code review failed' });
    }
  });

  app.post(['/api/analysis/bugs', '/analysis/bugs'], optionalAuthMiddleware, async (req: AuthRequest, res) => {
    try {
      const { code, language = 'python', projectId } = req.body;
      if (!code || typeof code !== 'string' || !code.trim()) {
        res.status(400).json({ error: 'Source code cannot be empty' });
        return;
      }

      const result = await detectBugs(code, language);
      const userId = req.user?.id || 'user-demo-1';
      let projectName: string | undefined;

      if (projectId) {
        const p = db.getProjectById(projectId, userId);
        projectName = p?.name;
      }

      const record = db.createAnalysis({
        userId,
        projectId,
        projectName,
        language: language as Language,
        analysisType: 'bugs',
        sourceCode: code,
        aiResponse: result,
        score: result.totalBugs === 0 ? 100 : Math.max(30, 100 - result.totalBugs * 20),
        issueCount: result.totalBugs,
      });

      res.json({
        id: record.id,
        analysisType: 'bugs',
        language,
        result,
        record,
      });
    } catch (err: any) {
      console.error('Bug detection error:', err);
      res.status(500).json({ error: err.message || 'Bug detection analysis failed' });
    }
  });

  app.post(['/api/analysis/refactor', '/analysis/refactor'], optionalAuthMiddleware, async (req: AuthRequest, res) => {
    try {
      const { code, language = 'python', projectId, goals } = req.body;
      if (!code || typeof code !== 'string' || !code.trim()) {
        res.status(400).json({ error: 'Source code cannot be empty' });
        return;
      }

      const result = await suggestRefactoring(code, language, goals);
      const userId = req.user?.id || 'user-demo-1';
      let projectName: string | undefined;

      if (projectId) {
        const p = db.getProjectById(projectId, userId);
        projectName = p?.name;
      }

      const record = db.createAnalysis({
        userId,
        projectId,
        projectName,
        language: language as Language,
        analysisType: 'refactor',
        sourceCode: code,
        aiResponse: result,
        score: 90,
        issueCount: result.changes?.length || 0,
      });

      res.json({
        id: record.id,
        analysisType: 'refactor',
        language,
        result,
        record,
      });
    } catch (err: any) {
      console.error('Refactor analysis error:', err);
      res.status(500).json({ error: err.message || 'Refactoring analysis failed' });
    }
  });

  app.post(['/api/analysis/tests', '/analysis/tests'], optionalAuthMiddleware, async (req: AuthRequest, res) => {
    try {
      const { code, language = 'python', framework, projectId } = req.body;
      if (!code || typeof code !== 'string' || !code.trim()) {
        res.status(400).json({ error: 'Source code cannot be empty' });
        return;
      }

      const result = await generateTests(code, language, framework);
      const userId = req.user?.id || 'user-demo-1';
      let projectName: string | undefined;

      if (projectId) {
        const p = db.getProjectById(projectId, userId);
        projectName = p?.name;
      }

      const record = db.createAnalysis({
        userId,
        projectId,
        projectName,
        language: language as Language,
        analysisType: 'tests',
        testFramework: result.framework,
        sourceCode: code,
        aiResponse: result,
        score: 95,
        issueCount: result.testCases?.length || 0,
      });

      res.json({
        id: record.id,
        analysisType: 'tests',
        language,
        result,
        record,
      });
    } catch (err: any) {
      console.error('Test generation error:', err);
      res.status(500).json({ error: err.message || 'Test generation failed' });
    }
  });

  app.post(['/api/analysis/documentation', '/analysis/documentation'], optionalAuthMiddleware, async (req: AuthRequest, res) => {
    try {
      const { code, language = 'python', projectId } = req.body;
      if (!code || typeof code !== 'string' || !code.trim()) {
        res.status(400).json({ error: 'Source code cannot be empty' });
        return;
      }

      const result = await generateDocumentation(code, language);
      const userId = req.user?.id || 'user-demo-1';
      let projectName: string | undefined;

      if (projectId) {
        const p = db.getProjectById(projectId, userId);
        projectName = p?.name;
      }

      const record = db.createAnalysis({
        userId,
        projectId,
        projectName,
        language: language as Language,
        analysisType: 'documentation',
        sourceCode: code,
        aiResponse: result,
        score: 94,
        issueCount: result.functions?.length || 0,
      });

      res.json({
        id: record.id,
        analysisType: 'documentation',
        language,
        result,
        record,
      });
    } catch (err: any) {
      console.error('Documentation generation error:', err);
      res.status(500).json({ error: err.message || 'Documentation generation failed' });
    }
  });

  app.post(['/api/analysis/explain', '/analysis/explain'], optionalAuthMiddleware, async (req: AuthRequest, res) => {
    try {
      const { code, language = 'python', projectId } = req.body;
      if (!code || typeof code !== 'string' || !code.trim()) {
        res.status(400).json({ error: 'Source code cannot be empty' });
        return;
      }

      const result = await explainCode(code, language);
      const userId = req.user?.id || 'user-demo-1';
      let projectName: string | undefined;

      if (projectId) {
        const p = db.getProjectById(projectId, userId);
        projectName = p?.name;
      }

      const record = db.createAnalysis({
        userId,
        projectId,
        projectName,
        language: language as Language,
        analysisType: 'explain',
        sourceCode: code,
        aiResponse: result,
        score: 88,
        issueCount: result.stepByStep?.length || 0,
      });

      res.json({
        id: record.id,
        analysisType: 'explain',
        language,
        result,
        record,
      });
    } catch (err: any) {
      console.error('Explanation generation error:', err);
      res.status(500).json({ error: err.message || 'Code explanation failed' });
    }
  });

  // ----------------------------------------------------
  // ANALYSIS HISTORY ROUTES
  // ----------------------------------------------------
  app.get(['/api/analysis/history', '/analysis/history'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const { projectId, language, analysisType, search } = req.query;

    const history = db.getAnalyses(userId, {
      projectId: projectId as string | undefined,
      language: language as string | undefined,
      analysisType: analysisType as string | undefined,
      search: search as string | undefined,
    });

    res.json({ history, count: history.length });
  });

  app.get(['/api/analysis/:id', '/analysis/:id'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const record = db.getAnalysisById(req.params.id, userId);
    if (!record) {
      res.status(404).json({ error: 'Analysis record not found' });
      return;
    }
    res.json({ analysis: record });
  });

  app.delete(['/api/analysis/:id', '/analysis/:id'], optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const success = db.deleteAnalysis(req.params.id, userId);
    if (!success) {
      res.status(404).json({ error: 'Analysis record not found' });
      return;
    }
    res.json({ success: true, message: 'Analysis deleted from history' });
  });

  // ----------------------------------------------------
  // DASHBOARD STATS
  // ----------------------------------------------------
  app.get('/api/stats', optionalAuthMiddleware, (req: AuthRequest, res) => {
    const userId = req.user?.id || 'user-demo-1';
    const stats = db.getStats(userId);
    res.json(stats);
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE (Development vs Production)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Developer Assistant Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
