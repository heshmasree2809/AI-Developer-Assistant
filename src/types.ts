export type Language = 
  | 'python' 
  | 'typescript' 
  | 'javascript' 
  | 'java' 
  | 'csharp' 
  | 'go' 
  | 'rust' 
  | 'cpp' 
  | 'php' 
  | 'sql' 
  | 'ruby';

export type AnalysisType = 
  | 'review' 
  | 'bugs' 
  | 'refactor' 
  | 'tests' 
  | 'documentation' 
  | 'explain';

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface CodeIssue {
  line?: number;
  category: 'Bug' | 'Security' | 'Performance' | 'Code Smell' | 'Maintainability' | 'Incorrect Logic' | 'Poor Naming' | 'Complexity' | 'Best Practice';
  severity: Severity;
  title: string;
  description: string;
  suggestion: string;
  snippet?: string;
}

export interface ReviewResponse {
  summary: string;
  score: number;
  issues: CodeIssue[];
  metrics?: {
    complexityScore: number;
    maintainabilityIndex: number;
    securityScore: number;
    performanceRating: string;
  };
  strengths?: string[];
  recommendations?: string[];
}

export interface BugDetectionResponse {
  summary: string;
  totalBugs: number;
  criticalCount: number;
  bugs: Array<{
    title: string;
    severity: Severity;
    line?: number;
    whatIsWrong: string;
    whyItHappens: string;
    whereItOccurs: string;
    howToFix: string;
    codeFix?: string;
  }>;
  fixedCode?: string;
}

export interface RefactorResponse {
  summary: string;
  improvedCode: string;
  explanation: string;
  changes: Array<{
    type: 'performance' | 'readability' | 'architecture' | 'safety' | 'cleanup';
    description: string;
    before?: string;
    after?: string;
  }>;
  performanceImprovements: string[];
  readabilityImprovements: string[];
  bestPractices: string[];
}

export interface TestGenerationResponse {
  framework: string;
  summary: string;
  testCode: string;
  testCases: Array<{
    name: string;
    description: string;
    type: 'happy_path' | 'edge_case' | 'error_case' | 'mock_fixture';
  }>;
  instructions: string;
  coverageEstimate?: string;
}

export interface DocumentationResponse {
  title: string;
  overview: string;
  markdownDoc: string;
  functions: Array<{
    name: string;
    description: string;
    params: Array<{ name: string; type: string; description: string }>;
    returns: { type: string; description: string };
    exampleUsage?: string;
  }>;
  edgeCases: string[];
  apiEndpoints?: Array<{
    method: string;
    path: string;
    description: string;
  }>;
}

export interface ExplainResponse {
  summary: string;
  stepByStep: Array<{
    step: number;
    title: string;
    explanation: string;
    relevantLines?: string;
  }>;
  timeComplexity: string;
  spaceComplexity: string;
  keyConcepts: string[];
  architecturePatterns: string[];
  potentialBottlenecks: string[];
}

export type AnalysisResult = 
  | { type: 'review'; data: ReviewResponse }
  | { type: 'bugs'; data: BugDetectionResponse }
  | { type: 'refactor'; data: RefactorResponse }
  | { type: 'tests'; data: TestGenerationResponse }
  | { type: 'documentation'; data: DocumentationResponse }
  | { type: 'explain'; data: ExplainResponse };

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  tags?: string[];
  fileCount?: number;
  analysisCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  language: Language;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  projectId?: string | null;
  projectName?: string;
  language: Language;
  analysisType: AnalysisType;
  sourceCode: string;
  code?: string;
  aiResponse: ReviewResponse | BugDetectionResponse | RefactorResponse | TestGenerationResponse | DocumentationResponse | ExplainResponse;
  result?: any;
  score?: number;
  issueCount?: number;
  testFramework?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalAnalyses: number;
  bugsDetected: number;
  testsGenerated: number;
  avgQualityScore: number;
  issuesBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  analysesByType: Record<AnalysisType, number>;
  languageDistribution: Array<{ language: string; count: number }>;
  recentScores: Array<{ date: string; score: number }>;
}
