import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnalysisRecord, AnalysisType, Project, ProjectFile } from './types';
import { CodeSnippetPreset } from './data/sampleSnippets';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedPreset, setSelectedPreset] = useState<CodeSnippetPreset | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<AnalysisType>('review');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleNavigateToAnalyzer = (preset?: CodeSnippetPreset, type?: string) => {
    if (preset) {
      setSelectedPreset(preset);
    }
    if (type) {
      setSelectedAnalysisType(type as AnalysisType);
    }
    setCurrentTab('analyzer');
  };

  const handleSelectProjectForAnalysis = (project: Project, file?: ProjectFile) => {
    setActiveProject(project);
    if (file) {
      setSelectedPreset({
        id: file.id,
        name: file.name,
        language: file.language,
        code: file.content,
        description: `Project file from ${project.name}`,
        recommendedType: 'review',
      });
    }
    setCurrentTab('analyzer');
  };

  const handleLoadRecordInStudio = (record: AnalysisRecord) => {
    setSelectedPreset({
      id: record.id,
      name: `${record.analysisType}_snippet`,
      language: record.language,
      code: record.code,
      description: `Loaded from audit history (${new Date(record.createdAt).toLocaleDateString()})`,
      recommendedType: record.analysisType,
    });
    setSelectedAnalysisType(record.analysisType);
    setCurrentTab('analyzer');
  };

  return (
    <AuthProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-600 selection:text-white">
        {/* Persistent Side Navigation */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onSelectAnalysisType={(type) => {
            setSelectedAnalysisType(type as AnalysisType);
            setCurrentTab('analyzer');
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-50">
          {/* Top Sticky Header */}
          <Header
            currentTab={currentTab}
            onNewAnalysisClick={() => {
              setSelectedPreset(null);
              setCurrentTab('analyzer');
            }}
            selectedProject={activeProject}
          />

          {/* Dynamic Page Router */}
          <main className="flex-1 overflow-y-auto bg-slate-50">
            {currentTab === 'dashboard' && (
              <DashboardPage
                onNavigateToAnalyzer={handleNavigateToAnalyzer}
                onNavigateToProjects={() => setCurrentTab('projects')}
                onNavigateToHistory={() => setCurrentTab('history')}
                onViewAnalysis={handleLoadRecordInStudio}
              />
            )}

            {currentTab === 'analyzer' && (
              <AnalyzerPage
                initialPreset={selectedPreset}
                initialType={selectedAnalysisType}
                selectedProject={activeProject}
              />
            )}

            {currentTab === 'projects' && (
              <ProjectsPage
                onSelectProjectForAnalysis={handleSelectProjectForAnalysis}
              />
            )}

            {currentTab === 'history' && (
              <HistoryPage onLoadInStudio={handleLoadRecordInStudio} />
            )}

            {currentTab === 'settings' && <SettingsPage />}
          </main>
        </div>

        {/* Global Auth Modal */}
        <AuthModal />
      </div>
    </AuthProvider>
  );
}

export default App;
