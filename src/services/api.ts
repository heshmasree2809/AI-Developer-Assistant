import axios from 'axios';
import {
  AnalysisRecord,
  AnalysisType,
  DashboardStats,
  Language,
  Project,
  ProjectFile,
  User,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ai_dev_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function normalizeRecord(raw: any): AnalysisRecord {
  const code = raw.code || raw.sourceCode || '';
  const result = raw.result || raw.aiResponse || {};
  return {
    ...raw,
    code,
    sourceCode: code,
    result,
    aiResponse: result,
    score: raw.score !== undefined ? raw.score : result.score,
  };
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  async getMe(): Promise<{ user: User }> {
    const res = await api.get('/users/me');
    return res.data;
  },
};

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const res = await api.get('/projects');
    return res.data.projects || [];
  },
  async getProject(id: string): Promise<{ project: Project; files: ProjectFile[] }> {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  async createProject(
    nameOrObj: string | { name: string; description: string; tags?: string[] },
    description?: string,
    tags: string[] = []
  ): Promise<Project> {
    const payload = typeof nameOrObj === 'object' ? nameOrObj : { name: nameOrObj, description, tags };
    const res = await api.post('/projects', payload);
    return res.data.project;
  },
  async updateProject(
    id: string,
    nameOrObj: string | { name: string; description: string; tags?: string[] },
    description?: string,
    tags: string[] = []
  ): Promise<Project> {
    const payload = typeof nameOrObj === 'object' ? nameOrObj : { name: nameOrObj, description, tags };
    const res = await api.put(`/projects/${id}`, payload);
    return res.data.project;
  },
  async deleteProject(id: string): Promise<boolean> {
    const res = await api.delete(`/projects/${id}`);
    return res.data.success;
  },
  async addFile(
    projectId: string,
    nameOrObj: string | { name: string; language: Language; content: string },
    language?: Language,
    content?: string
  ): Promise<ProjectFile> {
    const payload = typeof nameOrObj === 'object' ? nameOrObj : { name: nameOrObj, language, content };
    const res = await api.post(`/projects/${projectId}/files`, payload);
    return res.data.file;
  },
  async deleteFile(projectId: string, fileId: string): Promise<boolean> {
    const res = await api.delete(`/projects/${projectId}/files/${fileId}`);
    return res.data.success;
  },
};

export const analysisService = {
  async analyzeCode(params: {
    code: string;
    language: Language;
    analysisType: AnalysisType;
    projectId?: string;
    options?: { focusArea?: string; framework?: string; goals?: string };
  }): Promise<AnalysisRecord> {
    const { code, language, analysisType, projectId, options } = params;
    let endpoint = `/analysis/${analysisType}`;
    let body: any = { code, language, projectId };

    if (analysisType === 'review') {
      body.focus = options?.focusArea;
    } else if (analysisType === 'tests') {
      body.framework = options?.framework || 'pytest';
    } else if (analysisType === 'refactor') {
      body.goals = options?.focusArea;
    }

    const res = await api.post(endpoint, body);
    return normalizeRecord(res.data);
  },

  async runReview(code: string, language: Language, projectId?: string, focus?: string) {
    const res = await api.post('/analysis/review', { code, language, projectId, focus });
    return normalizeRecord(res.data);
  },
  async runBugDetection(code: string, language: Language, projectId?: string) {
    const res = await api.post('/analysis/bugs', { code, language, projectId });
    return normalizeRecord(res.data);
  },
  async runRefactoring(code: string, language: Language, projectId?: string, goals?: string) {
    const res = await api.post('/analysis/refactor', { code, language, projectId, goals });
    return normalizeRecord(res.data);
  },
  async runTestGeneration(code: string, language: Language, framework?: string, projectId?: string) {
    const res = await api.post('/analysis/tests', { code, language, framework, projectId });
    return normalizeRecord(res.data);
  },
  async runDocumentation(code: string, language: Language, projectId?: string) {
    const res = await api.post('/analysis/documentation', { code, language, projectId });
    return normalizeRecord(res.data);
  },
  async runExplain(code: string, language: Language, projectId?: string) {
    const res = await api.post('/analysis/explain', { code, language, projectId });
    return normalizeRecord(res.data);
  },
  async getHistory(filters?: { projectId?: string; language?: string; analysisType?: string; search?: string }): Promise<AnalysisRecord[]> {
    const res = await api.get('/analysis/history', { params: filters });
    return (res.data.history || []).map(normalizeRecord);
  },
  async getAnalysisById(id: string): Promise<AnalysisRecord> {
    const res = await api.get(`/analysis/${id}`);
    return normalizeRecord(res.data.analysis);
  },
  async deleteAnalysis(id: string): Promise<boolean> {
    const res = await api.delete(`/analysis/${id}`);
    return res.data.success;
  },
  async deleteHistoryItem(id: string): Promise<boolean> {
    return this.deleteAnalysis(id);
  },
};

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get('/stats');
    return res.data;
  },
  async getSystemConfig() {
    const res = await api.get('/config');
    return res.data;
  },
  async getHealth() {
    const res = await api.get('/health');
    return res.data;
  }
};
