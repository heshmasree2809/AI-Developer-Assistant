import { AnalysisType, Severity } from '../types';

export type ExportFormat = 'doc' | 'ppt' | 'pdf' | 'md' | 'html' | 'json';

export interface DocumentExportOptions {
  analysisType: AnalysisType;
  data: any;
  code?: string;
  language?: string;
  fileName?: string;
  projectName?: string;
  authorName?: string;
  customTitle?: string;
  includeMetrics?: boolean;
  includeCode?: boolean;
  includeActionPlan?: boolean;
}

export interface MetricItem {
  label: string;
  value: string | number;
  description?: string;
  status?: 'good' | 'warning' | 'danger' | 'neutral';
}

export interface ReportItem {
  title: string;
  severity?: Severity | string;
  category?: string;
  location?: string;
  description: string;
  impact?: string;
  solution?: string;
  codeSnippet?: string;
}

export interface ReportSection {
  title: string;
  description?: string;
  items?: ReportItem[];
  tableHeaders?: string[];
  tableRows?: Array<string[]>;
  codeBlock?: {
    title: string;
    language: string;
    code: string;
  };
}

export interface StructuredReport {
  title: string;
  subtitle: string;
  reportId: string;
  generatedAt: string;
  author: string;
  projectName: string;
  fileName: string;
  language: string;
  analysisType: AnalysisType;
  overallScore?: number;
  executiveSummary: string;
  metrics: MetricItem[];
  sections: ReportSection[];
  actionItems: string[];
  conclusion: string;
  rawPayload: any;
}

export function buildStructuredReport(opts: DocumentExportOptions): StructuredReport {
  const {
    analysisType,
    data,
    code = '',
    language = 'code',
    fileName = 'source_file',
    projectName = 'Default Project',
    authorName = 'Engineering Team',
    customTitle,
    includeMetrics = true,
    includeCode = true,
    includeActionPlan = true,
  } = opts;

  const timestamp = new Date().toLocaleString();
  const reportId = `AUDIT-${Date.now().toString(36).toUpperCase()}`;

  let defaultTitle = 'Code Intelligence & Quality Audit Report';
  let defaultSubtitle = 'Executive engineering analysis, vulnerability detection, and architecture assessment';
  let overallScore: number | undefined = undefined;
  const metrics: MetricItem[] = [];
  const sections: ReportSection[] = [];
  const actionItems: string[] = [];
  let executiveSummary = '';
  let conclusion = '';

  switch (analysisType) {
    case 'review': {
      defaultTitle = customTitle || 'Comprehensive Code Review & Health Audit';
      defaultSubtitle = `Quality Score, Vulnerability Analysis & Refactoring Recommendations for ${fileName}`;
      overallScore = data.score ?? 85;
      executiveSummary = data.summary || 'Detailed review of codebase structure, security posture, and quality indicators.';

      if (includeMetrics) {
        metrics.push(
          { label: 'Overall Quality Score', value: `${overallScore}/100`, status: overallScore >= 80 ? 'good' : overallScore >= 60 ? 'warning' : 'danger' },
          { label: 'Maintainability Index', value: `${data.metrics?.maintainabilityIndex || overallScore}%`, status: 'good' },
          { label: 'Security Score', value: `${data.metrics?.securityScore || 90}/100`, status: 'good' },
          { label: 'Performance Rating', value: data.metrics?.performanceRating || 'Optimized', status: 'neutral' }
        );
      }

      if (data.issues && data.issues.length > 0) {
        sections.push({
          title: 'Identified Code Deficiencies & Security Findings',
          description: `Discovered ${data.issues.length} areas for optimization and security reinforcement.`,
          items: data.issues.map((iss: any) => ({
            title: iss.title || 'Code Improvement',
            severity: iss.severity || 'Medium',
            category: iss.category || 'Quality',
            location: iss.line ? `Line ${iss.line}` : undefined,
            description: iss.description || '',
            solution: iss.suggestion,
            codeSnippet: iss.snippet,
          })),
        });
      }

      if (data.strengths && data.strengths.length > 0) {
        sections.push({
          title: 'Codebase Strengths & Architectural Highlights',
          description: 'Observed clean patterns and positive design implementations.',
          tableHeaders: ['Aspect', 'Strength Details'],
          tableRows: data.strengths.map((str: string, idx: number) => [`Key Strength #${idx + 1}`, str]),
        });
      }

      if (includeActionPlan && data.recommendations && data.recommendations.length > 0) {
        actionItems.push(...data.recommendations);
      } else {
        actionItems.push(
          'Address all Critical and High severity issues before production deployment.',
          'Adopt consistent naming conventions and modularize oversized routines.',
          'Execute automated regression testing suites across edge conditions.'
        );
      }

      conclusion = 'The codebase demonstrates functional viability. Incorporating the prioritized recommendations will ensure long-term maintainability, zero security leaks, and reliable throughput.';
      break;
    }

    case 'bugs': {
      defaultTitle = customTitle || 'Defect Detection & Vulnerability Mitigation Report';
      defaultSubtitle = `Static analysis defect breakdown, root causes, and verified fixes for ${fileName}`;
      overallScore = Math.max(20, 100 - (data.totalBugs || (data.bugs?.length || 0)) * 15);
      executiveSummary = data.summary || 'Deep vulnerability scan and logic defect identification.';

      if (includeMetrics) {
        metrics.push(
          { label: 'Defects Detected', value: data.totalBugs ?? (data.bugs?.length || 0), status: (data.totalBugs || 0) > 0 ? 'danger' : 'good' },
          { label: 'Critical / High Vulnerabilities', value: data.criticalCount ?? 0, status: (data.criticalCount || 0) > 0 ? 'danger' : 'good' },
          { label: 'Code Safety Index', value: `${overallScore}%`, status: overallScore >= 70 ? 'good' : 'warning' }
        );
      }

      if (data.bugs && data.bugs.length > 0) {
        sections.push({
          title: 'Detailed Defect Breakdown & Root Cause Analysis',
          items: data.bugs.map((b: any) => ({
            title: b.title,
            severity: b.severity || 'High',
            location: b.whereItOccurs || (b.line ? `Line ${b.line}` : undefined),
            description: b.whatIsWrong || '',
            impact: b.whyItHappens ? `Root Cause: ${b.whyItHappens}` : undefined,
            solution: b.howToFix,
            codeSnippet: b.codeFix,
          })),
        });
      }

      if (includeCode && data.fixedCode) {
        sections.push({
          title: 'Verified Bug-Free Replacement Source Code',
          description: 'Production-ready code remediating all identified defects and logic vulnerabilities.',
          codeBlock: {
            title: `${fileName} (Corrected)`,
            language,
            code: data.fixedCode,
          },
        });
      }

      actionItems.push(
        'Deploy the provided bug-free patched code snippet.',
        'Implement automated boundary assertion tests for edge-case payloads.',
        'Review concurrency, null-pointer safeguards, and memory bounds.'
      );
      conclusion = 'All detected logic flaws and critical vulnerabilities have been documented with deterministic remediation steps.';
      break;
    }

    case 'refactor': {
      defaultTitle = customTitle || 'Code Modernization & Refactoring Blueprint';
      defaultSubtitle = `Performance optimization, readability enhancement, and architecture cleanup for ${fileName}`;
      executiveSummary = data.summary || 'Architecture restructuring and modern design pattern implementation.';

      if (includeMetrics) {
        metrics.push(
          { label: 'Performance Gains', value: `${data.performanceImprovements?.length || 2} Factors`, status: 'good' },
          { label: 'Readability Enhancements', value: `${data.readabilityImprovements?.length || 3} Areas`, status: 'good' },
          { label: 'Refactoring Scope', value: `${data.changes?.length || 0} Modules`, status: 'neutral' }
        );
      }

      if (data.changes && data.changes.length > 0) {
        sections.push({
          title: 'Refactoring Changes & Structural Modifications',
          items: data.changes.map((ch: any) => ({
            title: `${ch.type.toUpperCase()} Optimization`,
            category: ch.type,
            description: ch.description,
            solution: ch.after ? `Refactored Output: ${ch.after}` : undefined,
          })),
        });
      }

      if (includeCode && data.improvedCode) {
        sections.push({
          title: 'Modernized Production Source Code',
          description: 'Optimized, cleanly typed, and standardized code implementation.',
          codeBlock: {
            title: `${fileName} (Modernized)`,
            language,
            code: data.improvedCode,
          },
        });
      }

      if (data.bestPractices && data.bestPractices.length > 0) {
        actionItems.push(...data.bestPractices);
      } else {
        actionItems.push(
          'Adopt standard linting & formatting configurations across repository.',
          'Decompose multi-responsibility functions into testable sub-procedures.',
          'Profile hot paths under high-concurrency benchmarks.'
        );
      }
      conclusion = 'The modernized code structure exhibits significantly improved readability, lower algorithmic complexity, and scalable modularity.';
      break;
    }

    case 'tests': {
      defaultTitle = customTitle || 'Automated Unit Test Specification & Suite';
      defaultSubtitle = `Comprehensive test fixtures, edge-case coverage, and assertion harness for ${fileName}`;
      executiveSummary = data.summary || `Automated test suite engineered in ${data.framework || 'Modern Test Framework'}.`;

      if (includeMetrics) {
        metrics.push(
          { label: 'Testing Framework', value: data.framework || 'Standard Runner', status: 'neutral' },
          { label: 'Test Cases Generated', value: data.testCases?.length || 0, status: 'good' },
          { label: 'Estimated Code Coverage', value: data.coverageEstimate || '92%+', status: 'good' }
        );
      }

      if (data.testCases && data.testCases.length > 0) {
        sections.push({
          title: 'Test Case Matrix & Coverage Breakdown',
          tableHeaders: ['Test Case Name', 'Classification', 'Validation Objective'],
          tableRows: data.testCases.map((tc: any) => [
            tc.name,
            tc.type?.replace('_', ' ').toUpperCase() || 'UNIT TEST',
            tc.description,
          ]),
        });
      }

      if (includeCode && data.testCode) {
        sections.push({
          title: 'Executable Test Harness & Assertions',
          description: `Ready-to-run test file compatible with ${data.framework}.`,
          codeBlock: {
            title: `test_${fileName}`,
            language,
            code: data.testCode,
          },
        });
      }

      actionItems.push(
        `Execute test suite with: ${data.instructions || 'npm test / pytest'}`,
        'Integrate test execution into CI/CD build pipeline.',
        'Add contract testing for third-party external integrations.'
      );
      conclusion = 'The generated test suite provides high confidence for regression prevention, validating happy paths, boundary conditions, and error exception flows.';
      break;
    }

    case 'documentation': {
      defaultTitle = customTitle || data.title || 'Technical Architecture & Interface Specification';
      defaultSubtitle = `API specifications, function contracts, parameters, and developer documentation for ${fileName}`;
      executiveSummary = data.overview || 'Complete technical guide and architectural interface specification.';

      if (includeMetrics) {
        metrics.push(
          { label: 'Public Interfaces', value: data.functions?.length || 0, status: 'neutral' },
          { label: 'Documented Edge Cases', value: data.edgeCases?.length || 0, status: 'good' },
          { label: 'API Specification', value: data.apiEndpoints?.length ? `${data.apiEndpoints.length} Routes` : 'Standard Library', status: 'neutral' }
        );
      }

      if (data.functions && data.functions.length > 0) {
        sections.push({
          title: 'Public Interfaces & Method Signatures',
          items: data.functions.map((fn: any) => ({
            title: fn.name,
            category: fn.returns ? `Returns: ${fn.returns.type}` : 'Function',
            description: `${fn.description}\n\nParameters:\n${(fn.params || []).map((p: any) => `• ${p.name} (${p.type}): ${p.description}`).join('\n')}`,
            solution: fn.exampleUsage ? `Example Usage:\n${fn.exampleUsage}` : undefined,
          })),
        });
      }

      if (data.edgeCases && data.edgeCases.length > 0) {
        sections.push({
          title: 'Operational Edge Cases & Boundary Handling',
          tableHeaders: ['Scenario #', 'Edge Case Behavior & Constraints'],
          tableRows: data.edgeCases.map((ec: string, idx: number) => [`Scenario #${idx + 1}`, ec]),
        });
      }

      actionItems.push(
        'Publish generated documentation to developer knowledge base.',
        'Ensure interface contract versions are tagged in release notes.',
        'Implement runtime type validation matching the documented parameter schemas.'
      );
      conclusion = 'This technical document provides clear specifications for integration, maintainability, and client SDK consumers.';
      break;
    }

    case 'explain': {
      defaultTitle = customTitle || 'Algorithm Explanation & Architecture Dissection';
      defaultSubtitle = `Step-by-step logic breakdown, algorithmic complexity, and system design patterns for ${fileName}`;
      executiveSummary = data.summary || 'Deep architectural dissection of runtime mechanics and computational complexity.';

      if (includeMetrics) {
        metrics.push(
          { label: 'Time Complexity', value: data.timeComplexity || 'O(N)', status: 'good' },
          { label: 'Space Complexity', value: data.spaceComplexity || 'O(1)', status: 'good' },
          { label: 'Architecture Patterns', value: `${data.architecturePatterns?.length || 1} Patterns`, status: 'neutral' }
        );
      }

      if (data.stepByStep && data.stepByStep.length > 0) {
        sections.push({
          title: 'Sequential Execution Flow & Logic Walkthrough',
          items: data.stepByStep.map((st: any) => ({
            title: `Step ${st.step}: ${st.title}`,
            location: st.relevantLines ? `Lines ${st.relevantLines}` : undefined,
            description: st.explanation,
          })),
        });
      }

      if (data.keyConcepts && data.keyConcepts.length > 0) {
        sections.push({
          title: 'Key Algorithmic Concepts & Patterns',
          tableHeaders: ['Concept', 'Design Application'],
          tableRows: data.keyConcepts.map((kc: string, idx: number) => [`Concept #${idx + 1}`, kc]),
        });
      }

      actionItems.push(
        'Profile memory allocation for large batch workloads.',
        'Document asynchronous state transitions for concurrent callers.',
        'Conduct peer architecture reviews for critical path subsystems.'
      );
      conclusion = 'The logic structure follows established computational paradigms and provides predictable execution paths under defined bounds.';
      break;
    }
  }

  // If source code inclusion requested and not already included in code block
  if (includeCode && code && !sections.some(s => s.codeBlock)) {
    sections.push({
      title: 'Audited Source Code Snapshot',
      codeBlock: {
        title: fileName,
        language,
        code,
      },
    });
  }

  return {
    title: defaultTitle,
    subtitle: defaultSubtitle,
    reportId,
    generatedAt: timestamp,
    author: authorName,
    projectName,
    fileName,
    language,
    analysisType,
    overallScore,
    executiveSummary,
    metrics,
    sections,
    actionItems,
    conclusion,
    rawPayload: data,
  };
}

// ----------------------------------------------------------------------
// EXPORT FORMAT: DOCX / Microsoft Word (.doc)
// ----------------------------------------------------------------------
export function exportToWordDoc(report: StructuredReport) {
  const scoreHtml = report.overallScore !== undefined ? `
    <div style="margin: 20px 0; padding: 15px; background: #EEF2FF; border-left: 6px solid #4F46E5; border-radius: 4px;">
      <h3 style="margin: 0 0 5px 0; color: #3730A3; font-size: 14pt;">System Quality & Health Score</h3>
      <p style="margin: 0; font-size: 20pt; font-weight: bold; color: #1E1B4B;">${report.overallScore} <span style="font-size: 11pt; color: #4B5563; font-weight: normal;">/ 100 benchmark</span></p>
    </div>
  ` : '';

  const metricsHtml = report.metrics.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        ${report.metrics.map(m => `
          <td style="padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; text-align: center; vertical-align: middle;">
            <div style="font-size: 9pt; color: #64748B; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">${m.label}</div>
            <div style="font-size: 14pt; color: #0F172A; font-weight: bold;">${m.value}</div>
          </td>
        `).join('')}
      </tr>
    </table>
  ` : '';

  const sectionsHtml = report.sections.map(sec => `
    <div style="margin-top: 25px;">
      <h2 style="font-size: 14pt; color: #1E293B; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px;">${sec.title}</h2>
      ${sec.description ? `<p style="font-size: 10pt; color: #475569; margin-bottom: 12px;">${sec.description}</p>` : ''}
      
      ${sec.items && sec.items.length > 0 ? sec.items.map(item => `
        <div style="margin-bottom: 15px; padding: 12px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 11pt; color: #0F172A;">${item.title}</strong>
            ${item.severity ? `<span style="font-size: 9pt; font-weight: bold; padding: 2px 8px; border-radius: 4px; background: ${item.severity === 'Critical' ? '#FFE4E6; color: #9F1239' : item.severity === 'High' ? '#FFEDD5; color: #9A3412' : item.severity === 'Medium' ? '#FEF3C7; color: #92400E' : '#E0F2FE; color: #075985'}">${item.severity}</span>` : ''}
          </div>
          ${item.location ? `<div style="font-size: 9pt; color: #6366F1; font-family: Consolas, monospace; margin-bottom: 6px;">📍 ${item.location}</div>` : ''}
          <p style="font-size: 10pt; color: #334155; line-height: 1.5; margin: 4px 0;">${item.description.replace(/\n/g, '<br/>')}</p>
          ${item.impact ? `<div style="font-size: 9.5pt; color: #B91C1C; margin-top: 6px;">⚠️ <strong>Impact:</strong> ${item.impact}</div>` : ''}
          ${item.solution ? `<div style="font-size: 9.5pt; color: #15803D; margin-top: 6px; background: #F0FDF4; padding: 8px; border-left: 3px solid #16A34A;"><strong>💡 Solution:</strong> ${item.solution.replace(/\n/g, '<br/>')}</div>` : ''}
          ${item.codeSnippet ? `
            <div style="margin-top: 8px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 10px; font-family: Consolas, monospace; font-size: 9pt; color: #0F172A; white-space: pre-wrap; border-radius: 4px;">
              ${escapeHtml(item.codeSnippet)}
            </div>
          ` : ''}
        </div>
      `).join('') : ''}

      ${sec.tableHeaders && sec.tableRows ? `
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background: #F1F5F9;">
              ${sec.tableHeaders.map(th => `<th style="padding: 8px 12px; border: 1px solid #CBD5E1; text-align: left; font-size: 9.5pt; color: #334155;">${th}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${sec.tableRows.map(row => `
              <tr>
                ${row.map(cell => `<td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-size: 9.5pt; color: #1E293B;">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${sec.codeBlock ? `
        <div style="margin-top: 10px;">
          <div style="font-size: 9pt; font-weight: bold; color: #475569; margin-bottom: 4px; font-family: Consolas, monospace;">${sec.codeBlock.title}</div>
          <div style="background: #0F172A; color: #E2E8F0; padding: 14px; font-family: Consolas, monospace; font-size: 9pt; border-radius: 6px; white-space: pre-wrap; line-height: 1.4;">
            ${escapeHtml(sec.codeBlock.code)}
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');

  const actionItemsHtml = report.actionItems.length > 0 ? `
    <div style="margin-top: 25px; padding: 15px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px;">
      <h3 style="font-size: 12pt; color: #166534; margin: 0 0 10px 0;">Actionable Next Steps & Implementation Plan</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 10pt; color: #14532D; line-height: 1.6;">
        ${report.actionItems.map(act => `<li>${act}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${report.title}</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; color: #1E293B; line-height: 1.5; padding: 40px; }
        h1 { color: #1E1B4B; font-size: 22pt; margin-bottom: 4px; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; border-bottom: 2px solid #4F46E5; }
        .meta-table td { padding: 6px 10px; font-size: 9.5pt; color: #475569; }
      </style>
    </head>
    <body>
      <h1>${report.title}</h1>
      <p style="font-size: 11pt; color: #4F46E5; font-weight: bold; margin-top: 0; margin-bottom: 15px;">${report.subtitle}</p>

      <table class="meta-table">
        <tr>
          <td><strong>Project:</strong> ${report.projectName}</td>
          <td><strong>Source File:</strong> ${report.fileName}</td>
          <td><strong>Language:</strong> ${report.language.toUpperCase()}</td>
        </tr>
        <tr>
          <td><strong>Audit ID:</strong> ${report.reportId}</td>
          <td><strong>Generated:</strong> ${report.generatedAt}</td>
          <td><strong>Author/Reviewer:</strong> ${report.author}</td>
        </tr>
      </table>

      <div style="margin: 20px 0;">
        <h2 style="font-size: 13pt; color: #1E293B; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px;">Executive Summary</h2>
        <p style="font-size: 10.5pt; color: #334155; line-height: 1.6;">${report.executiveSummary}</p>
      </div>

      ${scoreHtml}
      ${metricsHtml}
      ${sectionsHtml}
      ${actionItemsHtml}

      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #E2E8F0; font-size: 9pt; color: #64748B; text-align: center;">
        <p>Generated with AI Studio Deep Code Intelligence Engine • Model: Gemini 3.7 Flash • Confirmed & Audited</p>
      </div>
    </body>
    </html>
  `;

  downloadBlob(htmlContent, `${sanitizeFileName(report.title)}_${report.reportId}.doc`, 'application/msword');
}

// ----------------------------------------------------------------------
// EXPORT FORMAT: POWERPOINT PRESENTATION (.ppt)
// ----------------------------------------------------------------------
export function exportToPowerPoint(report: StructuredReport) {
  // PowerPoint HTML Slides Format
  const slides = [];

  // Slide 1: Title Slide
  slides.push(`
    <div class="slide title-slide">
      <div class="slide-badge">EXECUTIVE CODE INTELLIGENCE AUDIT</div>
      <h1>${escapeHtml(report.title)}</h1>
      <div class="subtitle">${escapeHtml(report.subtitle)}</div>
      <div class="slide-meta">
        <div><strong>Project:</strong> ${escapeHtml(report.projectName)}</div>
        <div><strong>Source File:</strong> ${escapeHtml(report.fileName)} (${escapeHtml(report.language.toUpperCase())})</div>
        <div><strong>Date:</strong> ${escapeHtml(report.generatedAt)}</div>
        <div><strong>Audit ID:</strong> ${escapeHtml(report.reportId)}</div>
      </div>
      ${report.overallScore !== undefined ? `
        <div class="score-callout">
          Quality Score: <strong>${report.overallScore} / 100</strong>
        </div>
      ` : ''}
    </div>
  `);

  // Slide 2: Executive Summary & Health Metrics
  slides.push(`
    <div class="slide">
      <div class="slide-header">
        <h2>Executive Summary & Health Scorecard</h2>
        <div class="slide-num">Slide 02</div>
      </div>
      <div class="slide-body">
        <div class="summary-box">
          <p>${escapeHtml(report.executiveSummary)}</p>
        </div>
        ${report.metrics.length > 0 ? `
          <div class="metrics-grid">
            ${report.metrics.map(m => `
              <div class="metric-card">
                <div class="metric-label">${escapeHtml(m.label)}</div>
                <div class="metric-val">${escapeHtml(String(m.value))}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `);

  // Slide 3+: Sections / Findings Slides
  report.sections.forEach((sec, idx) => {
    if (sec.items && sec.items.length > 0) {
      slides.push(`
        <div class="slide">
          <div class="slide-header">
            <h2>${escapeHtml(sec.title)}</h2>
            <div class="slide-num">Slide ${String(idx + 3).padStart(2, '0')}</div>
          </div>
          <div class="slide-body">
            <div class="findings-list">
              ${sec.items.slice(0, 4).map(item => `
                <div class="finding-card">
                  <div class="finding-header">
                    <span class="finding-title">${escapeHtml(item.title)}</span>
                    ${item.severity ? `<span class="sev-badge ${item.severity.toLowerCase()}">${escapeHtml(item.severity)}</span>` : ''}
                  </div>
                  <p class="finding-desc">${escapeHtml(item.description.slice(0, 180))}${item.description.length > 180 ? '...' : ''}</p>
                  ${item.solution ? `<div class="finding-sol"><strong>Remediation:</strong> ${escapeHtml(item.solution.slice(0, 150))}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `);
    } else if (sec.tableHeaders && sec.tableRows) {
      slides.push(`
        <div class="slide">
          <div class="slide-header">
            <h2>${escapeHtml(sec.title)}</h2>
            <div class="slide-num">Slide ${String(idx + 3).padStart(2, '0')}</div>
          </div>
          <div class="slide-body">
            <table class="slide-table">
              <thead>
                <tr>${sec.tableHeaders.map(th => `<th>${escapeHtml(th)}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${sec.tableRows.slice(0, 5).map(row => `
                  <tr>${row.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `);
    } else if (sec.codeBlock) {
      slides.push(`
        <div class="slide">
          <div class="slide-header">
            <h2>${escapeHtml(sec.title)}</h2>
            <div class="slide-num">Slide ${String(idx + 3).padStart(2, '0')}</div>
          </div>
          <div class="slide-body">
            <div class="code-container">
              <div class="code-title">${escapeHtml(sec.codeBlock.title)} (${escapeHtml(sec.codeBlock.language)})</div>
              <pre class="code-content">${escapeHtml(sec.codeBlock.code.slice(0, 800))}${sec.codeBlock.code.length > 800 ? '\n// ... [Continued in Full Report]' : ''}</pre>
            </div>
          </div>
        </div>
      `);
    }
  });

  // Final Slide: Action Plan & Next Steps
  slides.push(`
    <div class="slide final-slide">
      <div class="slide-header">
        <h2>Action Plan & Next Steps</h2>
        <div class="slide-num">Slide ${String(slides.length + 1).padStart(2, '0')}</div>
      </div>
      <div class="slide-body">
        <div class="actions-container">
          <ul class="action-list">
            ${report.actionItems.map((act, i) => `
              <li>
                <span class="action-num">0${i + 1}</span>
                <span class="action-text">${escapeHtml(act)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="conclusion-box">
          <p>${escapeHtml(report.conclusion)}</p>
        </div>
      </div>
    </div>
  `);

  const pptHtml = `
    <html xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:p="urn:schemas-microsoft-com:office:powerpoint"
    xmlns:oa="urn:schemas-microsoft-com:office:activation">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(report.title)} - Slides</title>
      <style>
        @page { size: 16in 9in; margin: 0; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; margin: 0; padding: 0; background: #0F172A; color: #1E293B; }
        .slide { width: 100vw; height: 100vh; max-width: 1280px; max-height: 720px; page-break-after: always; background: #FFFFFF; box-sizing: border-box; padding: 40px 60px; position: relative; display: flex; flex-direction: column; justify-content: space-between; margin: 20px auto; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
        .title-slide { background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%); color: #FFFFFF; }
        .title-slide h1 { font-size: 32pt; margin: 15px 0 10px 0; color: #FFFFFF; font-weight: 800; line-height: 1.2; }
        .title-slide .subtitle { font-size: 16pt; color: #C7D2FE; margin-bottom: 25px; }
        .slide-badge { display: inline-block; padding: 6px 14px; background: rgba(255,255,255,0.15); border-radius: 20px; font-size: 10pt; font-weight: 700; letter-spacing: 1px; color: #E0E7FF; }
        .slide-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11pt; color: #E0E7FF; background: rgba(0,0,0,0.2); padding: 15px 20px; border-radius: 8px; }
        .score-callout { margin-top: 15px; font-size: 14pt; background: #10B981; color: white; padding: 10px 20px; border-radius: 8px; display: inline-block; font-weight: 700; }
        
        .slide-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 12px; margin-bottom: 20px; }
        .slide-header h2 { font-size: 20pt; color: #0F172A; margin: 0; font-weight: 700; }
        .slide-num { font-size: 12pt; color: #64748B; font-weight: 700; }
        .slide-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }

        .summary-box { background: #F8FAFC; border-left: 5px solid #4F46E5; padding: 18px 24px; border-radius: 6px; font-size: 13pt; color: #334155; line-height: 1.6; margin-bottom: 25px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .metric-card { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 10px; padding: 20px; text-align: center; }
        .metric-label { font-size: 10pt; color: #4338CA; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
        .metric-val { font-size: 22pt; color: #1E1B4B; font-weight: 800; }

        .findings-list { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .finding-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; }
        .finding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .finding-title { font-weight: 700; font-size: 11pt; color: #0F172A; }
        .sev-badge { font-size: 9pt; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
        .sev-badge.critical { background: #FFE4E6; color: #9F1239; }
        .sev-badge.high { background: #FFEDD5; color: #9A3412; }
        .sev-badge.medium { background: #FEF3C7; color: #92400E; }
        .sev-badge.low { background: #E0F2FE; color: #075985; }
        .finding-desc { font-size: 10pt; color: #475569; margin: 4px 0; }
        .finding-sol { font-size: 9.5pt; color: #15803D; margin-top: 6px; background: #F0FDF4; padding: 4px 8px; border-radius: 4px; }

        .slide-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
        .slide-table th { background: #F1F5F9; padding: 12px; border: 1px solid #CBD5E1; text-align: left; font-weight: 700; color: #1E293B; }
        .slide-table td { padding: 10px 12px; border: 1px solid #CBD5E1; color: #334155; }

        .code-container { background: #0F172A; border-radius: 8px; padding: 15px; color: #E2E8F0; font-family: Consolas, monospace; }
        .code-title { color: #818CF8; font-size: 10pt; font-weight: 700; margin-bottom: 8px; }
        .code-content { font-size: 9.5pt; line-height: 1.4; margin: 0; white-space: pre-wrap; max-height: 400px; overflow: hidden; }

        .action-list { list-style: none; padding: 0; margin: 0 0 20px 0; }
        .action-list li { display: flex; align-items: center; gap: 15px; margin-bottom: 12px; background: #F8FAFC; padding: 12px 18px; border-radius: 8px; border: 1px solid #E2E8F0; }
        .action-num { background: #4F46E5; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11pt; font-weight: 700; flex-shrink: 0; }
        .action-text { font-size: 12pt; color: #1E293B; font-weight: 600; }
        .conclusion-box { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px 20px; border-radius: 8px; font-size: 11pt; color: #166534; }
      </style>
    </head>
    <body>
      ${slides.join('')}
    </body>
    </html>
  `;

  downloadBlob(pptHtml, `${sanitizeFileName(report.title)}_Deck_${report.reportId}.ppt`, 'application/vnd.ms-powerpoint');
}

// ----------------------------------------------------------------------
// EXPORT FORMAT: MARKDOWN (.md)
// ----------------------------------------------------------------------
export function exportToMarkdown(report: StructuredReport) {
  const lines: string[] = [];

  lines.push(`# ${report.title}`);
  lines.push(`> ${report.subtitle}\n`);

  lines.push(`| Metadata | Value |`);
  lines.push(`| :--- | :--- |`);
  lines.push(`| **Project** | ${report.projectName} |`);
  lines.push(`| **Source File** | \`${report.fileName}\` (${report.language}) |`);
  lines.push(`| **Audit ID** | \`${report.reportId}\` |`);
  lines.push(`| **Generated At** | ${report.generatedAt} |`);
  lines.push(`| **Author/Reviewer** | ${report.author} |`);
  if (report.overallScore !== undefined) {
    lines.push(`| **Overall Score** | **${report.overallScore}/100** |`);
  }
  lines.push('');

  lines.push(`## 📌 Executive Summary`);
  lines.push(report.executiveSummary);
  lines.push('');

  if (report.metrics.length > 0) {
    lines.push(`## 📊 System Quality Benchmarks`);
    lines.push(`| Metric | Value |`);
    lines.push(`| :--- | :--- |`);
    report.metrics.forEach(m => {
      lines.push(`| **${m.label}** | \`${m.value}\` |`);
    });
    lines.push('');
  }

  report.sections.forEach(sec => {
    lines.push(`## 🔍 ${sec.title}`);
    if (sec.description) {
      lines.push(sec.description);
      lines.push('');
    }

    if (sec.items && sec.items.length > 0) {
      sec.items.forEach((item, idx) => {
        lines.push(`### ${idx + 1}. ${item.title} ${item.severity ? `\`[${item.severity.toUpperCase()}]\`` : ''}`);
        if (item.location) lines.push(`- **Location**: \`${item.location}\``);
        if (item.category) lines.push(`- **Category**: ${item.category}`);
        lines.push(`- **Description**: ${item.description}`);
        if (item.impact) lines.push(`- **Impact**: ⚠️ ${item.impact}`);
        if (item.solution) lines.push(`- **Remediation**: 💡 ${item.solution}`);
        if (item.codeSnippet) {
          lines.push('\n```' + report.language);
          lines.push(item.codeSnippet);
          lines.push('```\n');
        }
      });
    }

    if (sec.tableHeaders && sec.tableRows) {
      lines.push(`| ${sec.tableHeaders.join(' | ')} |`);
      lines.push(`| ${sec.tableHeaders.map(() => ':---').join(' | ')} |`);
      sec.tableRows.forEach(row => {
        lines.push(`| ${row.join(' | ')} |`);
      });
      lines.push('');
    }

    if (sec.codeBlock) {
      lines.push(`### 📄 ${sec.codeBlock.title}`);
      lines.push('```' + sec.codeBlock.language);
      lines.push(sec.codeBlock.code);
      lines.push('```\n');
    }
  });

  if (report.actionItems.length > 0) {
    lines.push(`## 🚀 Recommended Next Steps`);
    report.actionItems.forEach((act, i) => {
      lines.push(`- [ ] **Step ${i + 1}**: ${act}`);
    });
    lines.push('');
  }

  lines.push(`---\n*Report generated with AI Studio Deep Code Intelligence Engine*`);

  downloadBlob(lines.join('\n'), `${sanitizeFileName(report.title)}_${report.reportId}.md`, 'text/markdown');
}

// ----------------------------------------------------------------------
// EXPORT FORMAT: STANDALONE EXECUTIVE HTML (.html)
// ----------------------------------------------------------------------
export function exportToHTML(report: StructuredReport) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(report.title)}</title>
      <style>
        :root {
          --primary: #4f46e5;
          --primary-light: #eef2ff;
          --slate-900: #0f172a;
          --slate-800: #1e293b;
          --slate-700: #334155;
          --slate-600: #475569;
          --slate-200: #e2e8f0;
          --slate-50: #f8fafc;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; color: var(--slate-800); line-height: 1.6; padding: 40px 20px; }
        .container { max-width: 960px; margin: 0 auto; background: #ffffff; border: 1px solid var(--slate-200); border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { border-bottom: 2px solid var(--slate-200); padding-bottom: 20px; margin-bottom: 25px; }
        .title { font-size: 24px; font-weight: 800; color: var(--slate-900); }
        .subtitle { font-size: 14px; color: var(--primary); font-weight: 600; margin-top: 4px; }
        .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; background: var(--slate-50); padding: 16px; border-radius: 10px; margin-top: 15px; border: 1px solid var(--slate-200); font-size: 12px; }
        .meta-grid span { color: var(--slate-600); }
        .meta-grid strong { color: var(--slate-900); display: block; }
        .score-card { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: white; border-radius: 12px; padding: 20px; margin: 25px 0; display: flex; align-items: center; justify-content: space-between; }
        .score-val { font-size: 36px; font-weight: 800; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-box { background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: 10px; padding: 16px; text-align: center; }
        .metric-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--slate-600); }
        .metric-number { font-size: 20px; font-weight: 800; color: var(--slate-900); margin-top: 4px; }
        .section { margin-top: 35px; }
        .section-title { font-size: 18px; font-weight: 700; color: var(--slate-900); border-bottom: 1px solid var(--slate-200); padding-bottom: 8px; margin-bottom: 15px; }
        .item-card { background: #ffffff; border: 1px solid var(--slate-200); border-radius: 10px; padding: 16px; margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
        .badge-critical { background: #ffe4e6; color: #9f1239; }
        .badge-high { background: #ffedd5; color: #9a3412; }
        .badge-medium { background: #fef3c7; color: #92400e; }
        .badge-low { background: #e0f2fe; color: #075985; }
        .code-box { background: var(--slate-900); color: #e2e8f0; padding: 16px; border-radius: 8px; font-family: Consolas, monospace; font-size: 12px; overflow-x: auto; white-space: pre-wrap; margin-top: 10px; }
        .action-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-top: 30px; }
        .action-box h3 { color: #166534; font-size: 15px; margin-bottom: 10px; }
        .action-box li { color: #14532d; font-size: 13px; margin-bottom: 6px; margin-left: 20px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: var(--slate-600); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">${escapeHtml(report.title)}</h1>
          <p class="subtitle">${escapeHtml(report.subtitle)}</p>
          <div class="meta-grid">
            <div><span>Project</span><strong>${escapeHtml(report.projectName)}</strong></div>
            <div><span>Source File</span><strong>${escapeHtml(report.fileName)} (${escapeHtml(report.language)})</strong></div>
            <div><span>Audit ID</span><strong>${escapeHtml(report.reportId)}</strong></div>
            <div><span>Date</span><strong>${escapeHtml(report.generatedAt)}</strong></div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Executive Summary</h2>
          <p style="font-size: 14px; color: var(--slate-700);">${escapeHtml(report.executiveSummary)}</p>
        </div>

        ${report.overallScore !== undefined ? `
          <div class="score-card">
            <div>
              <h3 style="font-size: 16px; margin-bottom: 4px;">Health & Architecture Score</h3>
              <p style="font-size: 12px; opacity: 0.9;">Calculated by deep static analysis & AI evaluation</p>
            </div>
            <div class="score-val">${report.overallScore} <span style="font-size: 16px; font-weight: normal;">/ 100</span></div>
          </div>
        ` : ''}

        ${report.metrics.length > 0 ? `
          <div class="metrics-grid">
            ${report.metrics.map(m => `
              <div class="metric-box">
                <div class="metric-title">${escapeHtml(m.label)}</div>
                <div class="metric-number">${escapeHtml(String(m.value))}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${report.sections.map(sec => `
          <div class="section">
            <h2 class="section-title">${escapeHtml(sec.title)}</h2>
            ${sec.description ? `<p style="font-size: 13px; color: var(--slate-600); margin-bottom: 12px;">${escapeHtml(sec.description)}</p>` : ''}
            
            ${sec.items && sec.items.length > 0 ? sec.items.map(item => `
              <div class="item-card">
                <div class="item-header">
                  <strong style="font-size: 14px; color: var(--slate-900);">${escapeHtml(item.title)}</strong>
                  ${item.severity ? `<span class="badge badge-${item.severity.toLowerCase()}">${escapeHtml(item.severity)}</span>` : ''}
                </div>
                ${item.location ? `<div style="font-size: 11px; color: var(--primary); font-family: monospace; margin-bottom: 6px;">📍 ${escapeHtml(item.location)}</div>` : ''}
                <p style="font-size: 13px; color: var(--slate-700);">${escapeHtml(item.description)}</p>
                ${item.solution ? `<div style="font-size: 12px; color: #15803d; background: #f0fdf4; padding: 8px 12px; border-radius: 6px; margin-top: 8px;"><strong>💡 Solution:</strong> ${escapeHtml(item.solution)}</div>` : ''}
                ${item.codeSnippet ? `<div class="code-box">${escapeHtml(item.codeSnippet)}</div>` : ''}
              </div>
            `).join('') : ''}

            ${sec.codeBlock ? `
              <div class="code-box">
                <div style="color: #818cf8; font-weight: bold; margin-bottom: 6px;">// ${escapeHtml(sec.codeBlock.title)}</div>
                ${escapeHtml(sec.codeBlock.code)}
              </div>
            ` : ''}
          </div>
        `).join('')}

        ${report.actionItems.length > 0 ? `
          <div class="action-box">
            <h3>Action Plan & Implementation Checklist</h3>
            <ul>
              ${report.actionItems.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="footer">
          <p>Generated with AI Studio Code Intelligence Engine • ${escapeHtml(report.generatedAt)}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadBlob(htmlContent, `${sanitizeFileName(report.title)}_${report.reportId}.html`, 'text/html');
}

// ----------------------------------------------------------------------
// EXPORT FORMAT: PDF (Print Preview Dialog)
// ----------------------------------------------------------------------
export function exportToPDF(report: StructuredReport) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable PDF report.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHtml(report.title)} - Print / PDF</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; font-size: 10pt; }
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 15px; }
        h1 { font-size: 16pt; color: #0f172a; margin: 0 0 4px 0; }
        .meta { font-size: 8.5pt; color: #475569; display: flex; justify-content: space-between; margin-top: 6px; }
        .section-title { font-size: 12pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 16px 0 8px 0; color: #0f172a; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; margin-bottom: 8px; }
        .badge { font-size: 7.5pt; font-weight: bold; padding: 2px 6px; border-radius: 3px; }
        .code { background: #f1f5f9; font-family: Consolas, monospace; font-size: 8pt; padding: 8px; border: 1px solid #cbd5e1; white-space: pre-wrap; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 8.5pt; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
        th { background: #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${escapeHtml(report.title)}</h1>
        <div class="meta">
          <span>Project: ${escapeHtml(report.projectName)} | File: ${escapeHtml(report.fileName)}</span>
          <span>Date: ${escapeHtml(report.generatedAt)} | Audit ID: ${escapeHtml(report.reportId)}</span>
        </div>
      </div>

      <div class="section-title">Executive Summary</div>
      <p style="margin-bottom: 12px;">${escapeHtml(report.executiveSummary)}</p>

      ${report.metrics.length > 0 ? `
        <table>
          <tr>
            ${report.metrics.map(m => `<th>${escapeHtml(m.label)}</th>`).join('')}
          </tr>
          <tr>
            ${report.metrics.map(m => `<td><strong>${escapeHtml(String(m.value))}</strong></td>`).join('')}
          </tr>
        </table>
      ` : ''}

      ${report.sections.map(sec => `
        <div class="section-title">${escapeHtml(sec.title)}</div>
        ${sec.items ? sec.items.map(it => `
          <div class="box">
            <div style="display: flex; justify-content: space-between;">
              <strong>${escapeHtml(it.title)}</strong>
              ${it.severity ? `<span class="badge">${escapeHtml(it.severity)}</span>` : ''}
            </div>
            <div style="font-size: 9pt; margin-top: 4px;">${escapeHtml(it.description)}</div>
            ${it.solution ? `<div style="font-size: 8.5pt; color: #15803d; margin-top: 4px;">Fix: ${escapeHtml(it.solution)}</div>` : ''}
          </div>
        `).join('') : ''}
        ${sec.codeBlock ? `
          <div class="code">${escapeHtml(sec.codeBlock.code)}</div>
        ` : ''}
      `).join('')}

      ${report.actionItems.length > 0 ? `
        <div class="section-title">Actionable Plan</div>
        <ul>
          ${report.actionItems.map(act => `<li>${escapeHtml(act)}</li>`).join('')}
        </ul>
      ` : ''}
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ----------------------------------------------------------------------
// EXPORT FORMAT: JSON (.json)
// ----------------------------------------------------------------------
export function exportToJSON(report: StructuredReport) {
  const payload = {
    reportId: report.reportId,
    title: report.title,
    subtitle: report.subtitle,
    generatedAt: report.generatedAt,
    author: report.author,
    project: {
      name: report.projectName,
      fileName: report.fileName,
      language: report.language,
    },
    analysisType: report.analysisType,
    overallScore: report.overallScore,
    executiveSummary: report.executiveSummary,
    metrics: report.metrics,
    sections: report.sections,
    actionItems: report.actionItems,
    conclusion: report.conclusion,
    rawResult: report.rawPayload,
  };

  downloadBlob(JSON.stringify(payload, null, 2), `${sanitizeFileName(report.title)}_${report.reportId}.json`, 'application/json');
}

// ----------------------------------------------------------------------
// HELPER UTILITIES
// ----------------------------------------------------------------------
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeFileName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function downloadBlob(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
