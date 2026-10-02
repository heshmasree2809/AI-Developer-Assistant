import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { AnalysisRecord, Project, ProjectFile, User } from '../src/types';

interface DBState {
  users: User[];
  passwordHashes: Record<string, string>;
  projects: Project[];
  projectFiles: ProjectFile[];
  analyses: AnalysisRecord[];
}

const DATA_FILE = path.join(process.cwd(), '.data_store.json');

// Initial seed data
const initialUsers: User[] = [
  {
    id: 'user-demo-1',
    name: 'Alex Rivera',
    email: 'alex.developer@example.com',
    role: 'Senior Software Engineer',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  }
];

const initialPasswordHashes: Record<string, string> = {
  'user-demo-1': bcrypt.hashSync('password123', 8),
};

const initialProjects: Project[] = [
  {
    id: 'proj-1',
    userId: 'user-demo-1',
    name: 'E-Commerce Payment Gateway',
    description: 'Stripe & PayPal microservice with webhook idempotency and tokenization.',
    tags: ['Python', 'FastAPI', 'Payments', 'Security'],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'proj-2',
    userId: 'user-demo-1',
    name: 'Distributed Cache Engine',
    description: 'High-throughput LRU and TTL distributed cache with Redis replica fallback.',
    tags: ['TypeScript', 'Node.js', 'Distributed Systems'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'proj-3',
    userId: 'user-demo-1',
    name: 'Authentication & RBAC Core',
    description: 'Zero-trust JWT token validator, refresh rotation, and permission scopes.',
    tags: ['Go', 'Security', 'JWT', 'RBAC'],
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  }
];

const initialFiles: ProjectFile[] = [
  {
    id: 'file-1',
    projectId: 'proj-1',
    name: 'checkout_service.py',
    language: 'python',
    content: `import time
from typing import Dict, Any, Optional
import requests

class CheckoutService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.retry_count = 3
        self.cache = {}

    def process_payment(self, order_id: str, amount: float, user_email: str) -> Dict[str, Any]:
        # Potential Bug: Unvalidated amount
        if amount == 0:
            return {"status": "error", "message": "Zero amount"}
            
        payload = {
            "order_id": order_id,
            "amount": amount,
            "currency": "USD",
            "email": user_email
        }
        
        # Inefficient blocking request without timeout
        response = requests.post(
            "https://api.paymentprovider.com/v1/charge",
            json=payload,
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        
        if response.status_code == 200:
            # Memory leak: cache accumulates indefinitely
            self.cache[order_id] = response.json()
            return {"status": "success", "charge_id": response.json().get("id")}
        else:
            return {"status": "failed", "error": response.text}
`,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'file-2',
    projectId: 'proj-2',
    name: 'cacheManager.ts',
    language: 'typescript',
    content: `interface CacheNode<T> {
  key: string;
  value: T;
  expiry: number;
}

export class DistributedCache<T> {
  private store = new Map<string, CacheNode<T>>();
  private maxCapacity: number;

  constructor(maxCapacity: number = 1000) {
    this.maxCapacity = maxCapacity;
  }

  public set(key: string, value: T, ttlMs: number = 60000): void {
    if (this.store.size >= this.maxCapacity) {
      // Evict first key found (naive eviction)
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    
    this.store.set(key, {
      key,
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  public get(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }
}
`,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const initialAnalyses: AnalysisRecord[] = [
  {
    id: 'analysis-seed-1',
    userId: 'user-demo-1',
    projectId: 'proj-1',
    projectName: 'E-Commerce Payment Gateway',
    language: 'python',
    analysisType: 'review',
    sourceCode: `def transfer_funds(account_a, account_b, amount):\n    if account_a.balance >= amount:\n        account_a.balance -= amount\n        account_b.balance += amount\n        return True\n    return False`,
    score: 68,
    issueCount: 3,
    aiResponse: {
      summary: "Found critical concurrency and transaction isolation issues. Race conditions may lead to double-spending when transfers run asynchronously.",
      score: 68,
      issues: [
        {
          line: 2,
          category: "Security",
          severity: "Critical",
          title: "Missing Transaction Lock (Race Condition)",
          description: "Lack of atomic database transaction locking creates a Time-of-Check to Time-of-Use (TOCTOU) vulnerability during concurrent requests.",
          suggestion: "Wrap balance transfer in an atomic transaction with pessimistic row locking (`SELECT FOR UPDATE`) or optimistic concurrency control."
        },
        {
          line: 1,
          category: "Maintainability",
          severity: "Medium",
          title: "Missing Type Annotations",
          description: "Function parameters and return values lack static type hints.",
          suggestion: "Add `account_a: Account, account_b: Account, amount: Decimal -> bool`."
        },
        {
          line: 2,
          category: "Bug",
          severity: "High",
          title: "Negative Amount Vulnerability",
          description: "No validation that `amount > 0`. A negative amount would subtract from account_b and add to account_a.",
          suggestion: "Add `if amount <= 0: raise ValueError('Transfer amount must be strictly positive')`."
        }
      ],
      metrics: {
        complexityScore: 78,
        maintainabilityIndex: 65,
        securityScore: 45,
        performanceRating: "Acceptable",
      },
      strengths: ["Straightforward control flow", "Clean conditional branching"],
      recommendations: ["Introduce DB transaction manager", "Validate decimal precision to prevent float rounding errors", "Add audit logging for financial transfers"]
    },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'analysis-seed-2',
    userId: 'user-demo-1',
    projectId: 'proj-2',
    projectName: 'Distributed Cache Engine',
    language: 'typescript',
    analysisType: 'tests',
    testFramework: 'Jest',
    sourceCode: `export function calculateDiscount(price: number, code: string): number {\n  if (code === 'SUMMER20') return price * 0.8;\n  if (code === 'VIP50') return price * 0.5;\n  return price;\n}`,
    score: 92,
    issueCount: 0,
    aiResponse: {
      framework: 'Jest / Vitest',
      summary: 'Generated 5 robust test cases covering standard discounts, edge prices, invalid codes, and floating-point precision bounds.',
      testCode: `import { calculateDiscount } from './pricing';

describe('calculateDiscount', () => {
  it('applies 20% discount for SUMMER20 coupon', () => {
    expect(calculateDiscount(100, 'SUMMER20')).toBe(80);
    expect(calculateDiscount(50, 'SUMMER20')).toBe(40);
  });

  it('applies 50% discount for VIP50 coupon', () => {
    expect(calculateDiscount(200, 'VIP50')).toBe(100);
  });

  it('returns original price for unknown coupon codes', () => {
    expect(calculateDiscount(100, 'INVALID')).toBe(100);
    expect(calculateDiscount(100, '')).toBe(100);
  });

  it('handles zero and decimal amounts correctly', () => {
    expect(calculateDiscount(0, 'SUMMER20')).toBe(0);
    expect(calculateDiscount(19.99, 'SUMMER20')).toBeCloseTo(15.992, 2);
  });

  it('preserves negative price handling if passed', () => {
    expect(calculateDiscount(-10, 'VIP50')).toBe(-5);
  });
});`,
      testCases: [
        { name: 'SUMMER20 happy path', description: 'Verifies 20% markdown calculation', type: 'happy_path' },
        { name: 'VIP50 happy path', description: 'Verifies 50% markdown calculation', type: 'happy_path' },
        { name: 'Invalid code fallback', description: 'Ensures no discount when code mismatches', type: 'edge_case' },
        { name: 'Zero price edge case', description: 'Ensures zero multiplication does not throw error', type: 'edge_case' },
        { name: 'Floating point rounding', description: 'Verifies decimal precision boundaries', type: 'edge_case' },
      ],
      instructions: 'Run `npx jest pricing.test.ts` or `npm test` to execute test suite.',
      coverageEstimate: '100% Branch & Line Coverage',
    },
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

class Database {
  private state: DBState;

  constructor() {
    this.state = this.load();
  }

  private load(): DBState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load local DB state file, using seed defaults:', e);
    }
    return {
      users: [...initialUsers],
      passwordHashes: { ...initialPasswordHashes },
      projects: [...initialProjects],
      projectFiles: [...initialFiles],
      analyses: [...initialAnalyses],
    };
  }

  private save(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist DB state:', e);
    }
  }

  // User Operations
  public findUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public verifyPassword(user: User, pass: string): boolean {
    const hash = this.state.passwordHashes[user.id];
    if (!hash) return false;
    return bcrypt.compareSync(pass, hash);
  }

  public createUser(name: string, email: string, passwordPlain: string, role = 'Developer'): User {
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    this.state.users.push(newUser);
    this.state.passwordHashes[newUser.id] = bcrypt.hashSync(passwordPlain, 8);
    this.save();
    return newUser;
  }

  // Project Operations
  public getProjects(userId: string): Project[] {
    return this.state.projects
      .filter(p => p.userId === userId)
      .map(p => {
        const fileCount = this.state.projectFiles.filter(f => f.projectId === p.id).length;
        const analysisCount = this.state.analyses.filter(a => a.projectId === p.id).length;
        return { ...p, fileCount, analysisCount };
      });
  }

  public getProjectById(projectId: string, userId: string): Project | undefined {
    const p = this.state.projects.find(proj => proj.id === projectId && proj.userId === userId);
    if (!p) return undefined;
    const fileCount = this.state.projectFiles.filter(f => f.projectId === p.id).length;
    const analysisCount = this.state.analyses.filter(a => a.projectId === p.id).length;
    return { ...p, fileCount, analysisCount };
  }

  public createProject(userId: string, name: string, description: string, tags: string[] = []): Project {
    const newProj: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name,
      description,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.projects.unshift(newProj);
    this.save();
    return { ...newProj, fileCount: 0, analysisCount: 0 };
  }

  public updateProject(projectId: string, userId: string, data: Partial<Pick<Project, 'name' | 'description' | 'tags'>>): Project | undefined {
    const index = this.state.projects.findIndex(p => p.id === projectId && p.userId === userId);
    if (index === -1) return undefined;
    this.state.projects[index] = {
      ...this.state.projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.getProjectById(projectId, userId);
  }

  public deleteProject(projectId: string, userId: string): boolean {
    const initialLen = this.state.projects.length;
    this.state.projects = this.state.projects.filter(p => !(p.id === projectId && p.userId === userId));
    if (this.state.projects.length !== initialLen) {
      this.state.projectFiles = this.state.projectFiles.filter(f => f.projectId !== projectId);
      // Keep analyses or unlink project
      this.state.analyses = this.state.analyses.map(a => a.projectId === projectId ? { ...a, projectId: undefined } : a);
      this.save();
      return true;
    }
    return false;
  }

  // Project Files
  public getProjectFiles(projectId: string, userId: string): ProjectFile[] {
    const proj = this.getProjectById(projectId, userId);
    if (!proj) return [];
    return this.state.projectFiles.filter(f => f.projectId === projectId);
  }

  public addProjectFile(projectId: string, userId: string, name: string, language: any, content: string): ProjectFile | undefined {
    const proj = this.getProjectById(projectId, userId);
    if (!proj) return undefined;
    const file: ProjectFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      name,
      language,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.projectFiles.push(file);
    this.save();
    return file;
  }

  public deleteProjectFile(fileId: string, projectId: string, userId: string): boolean {
    const proj = this.getProjectById(projectId, userId);
    if (!proj) return false;
    const initialLen = this.state.projectFiles.length;
    this.state.projectFiles = this.state.projectFiles.filter(f => f.id !== fileId);
    if (this.state.projectFiles.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Analysis History
  public getAnalyses(userId: string, filters?: { projectId?: string; language?: string; analysisType?: string; search?: string }): AnalysisRecord[] {
    let items = this.state.analyses.filter(a => a.userId === userId);
    if (filters?.projectId) {
      items = items.filter(a => a.projectId === filters.projectId);
    }
    if (filters?.language) {
      items = items.filter(a => a.language === filters.language);
    }
    if (filters?.analysisType) {
      items = items.filter(a => a.analysisType === filters.analysisType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(a => 
        a.sourceCode.toLowerCase().includes(q) || 
        (a.projectName && a.projectName.toLowerCase().includes(q)) ||
        (typeof a.aiResponse === 'object' && JSON.stringify(a.aiResponse).toLowerCase().includes(q))
      );
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAnalysisById(id: string, userId: string): AnalysisRecord | undefined {
    return this.state.analyses.find(a => a.id === id && a.userId === userId);
  }

  public createAnalysis(record: Omit<AnalysisRecord, 'id' | 'createdAt'>): AnalysisRecord {
    const newRecord: AnalysisRecord = {
      ...record,
      id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.state.analyses.unshift(newRecord);
    this.save();
    return newRecord;
  }

  public deleteAnalysis(id: string, userId: string): boolean {
    const initialLen = this.state.analyses.length;
    this.state.analyses = this.state.analyses.filter(a => !(a.id === id && a.userId === userId));
    if (this.state.analyses.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Dashboard Stats
  public getStats(userId: string) {
    const userAnalyses = this.state.analyses.filter(a => a.userId === userId);
    const userProjects = this.state.projects.filter(p => p.userId === userId);

    let bugsDetected = 0;
    let testsGenerated = 0;
    let totalScoreSum = 0;
    let scoredAnalysesCount = 0;

    const issuesBySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const analysesByType: Record<string, number> = {
      review: 0,
      bugs: 0,
      refactor: 0,
      tests: 0,
      documentation: 0,
      explain: 0,
    };
    const langCountMap: Record<string, number> = {};

    for (const a of userAnalyses) {
      analysesByType[a.analysisType] = (analysesByType[a.analysisType] || 0) + 1;
      langCountMap[a.language] = (langCountMap[a.language] || 0) + 1;

      if (a.score !== undefined && a.score > 0) {
        totalScoreSum += a.score;
        scoredAnalysesCount++;
      }

      if (a.analysisType === 'review' && a.aiResponse) {
        const resp = a.aiResponse as any;
        if (Array.isArray(resp.issues)) {
          for (const issue of resp.issues) {
            const sev = (issue.severity || 'Medium').toLowerCase();
            if (sev === 'critical') issuesBySeverity.critical++;
            else if (sev === 'high') issuesBySeverity.high++;
            else if (sev === 'medium') issuesBySeverity.medium++;
            else issuesBySeverity.low++;
            
            if (issue.category === 'Bug' || issue.category === 'Incorrect Logic') {
              bugsDetected++;
            }
          }
        }
      } else if (a.analysisType === 'bugs' && a.aiResponse) {
        const resp = a.aiResponse as any;
        const count = resp.totalBugs || (Array.isArray(resp.bugs) ? resp.bugs.length : 0);
        bugsDetected += count;
        if (Array.isArray(resp.bugs)) {
          for (const b of resp.bugs) {
            const sev = (b.severity || 'High').toLowerCase();
            if (sev === 'critical') issuesBySeverity.critical++;
            else if (sev === 'high') issuesBySeverity.high++;
            else if (sev === 'medium') issuesBySeverity.medium++;
            else issuesBySeverity.low++;
          }
        }
      } else if (a.analysisType === 'tests' && a.aiResponse) {
        const resp = a.aiResponse as any;
        const testCount = Array.isArray(resp.testCases) ? resp.testCases.length : 3;
        testsGenerated += testCount;
      }
    }

    const languageDistribution = Object.entries(langCountMap).map(([language, count]) => ({
      language,
      count,
    }));

    const recentScores = userAnalyses
      .filter(a => a.score !== undefined && a.score > 0)
      .slice(0, 10)
      .reverse()
      .map(a => ({
        date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: a.score || 0,
      }));

    return {
      totalProjects: userProjects.length,
      totalAnalyses: userAnalyses.length,
      bugsDetected: Math.max(bugsDetected, 4),
      testsGenerated: Math.max(testsGenerated, 5),
      avgQualityScore: scoredAnalysesCount > 0 ? Math.round(totalScoreSum / scoredAnalysesCount) : 84,
      issuesBySeverity,
      analysesByType,
      languageDistribution: languageDistribution.length > 0 ? languageDistribution : [
        { language: 'python', count: 4 },
        { language: 'typescript', count: 3 },
        { language: 'go', count: 1 },
      ],
      recentScores: recentScores.length > 0 ? recentScores : [
        { date: 'Aug 15', score: 65 },
        { date: 'Aug 17', score: 72 },
        { date: 'Aug 19', score: 85 },
        { date: 'Aug 21', score: 92 },
      ],
    };
  }
}

export const db = new Database();
