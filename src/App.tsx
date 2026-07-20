import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CSVImporter } from './features/import/CSVImporter';
import { EmployeeRoster } from './features/import/EmployeeRoster';
import { Dashboard } from './features/dashboard/Dashboard';
import { OutliersAnalysis } from './features/outliers/OutliersAnalysis';
import { MarketBenchmarking } from './features/benchmark/MarketBenchmarking';
import { PhilosophyAlignment } from './features/philosophy/PhilosophyAlignment';
import { MarketResearch } from './features/research/MarketResearch';
import type { Employee, MarketBenchmark } from './types';
import { generateSampleEmployees, generateSampleBenchmarks } from './utils/sampleData';


function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [benchmarks, setBenchmarks] = useState<MarketBenchmark[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  // Check if data is already in state
  const hasData = employees.length > 0;

  // Handle data import from CSV
  const handleDataImported = (importedEmployees: Employee[], name: string) => {
    setEmployees(importedEmployees);
    setFileName(name);
    
    // Auto-generate corresponding benchmarks if not loaded yet
    if (benchmarks.length === 0) {
      setBenchmarks(generateSampleBenchmarks());
    }
    
    setCurrentView('dashboard');
  };

  // Load sample dataset
  const handleLoadSampleData = () => {
    setEmployees(generateSampleEmployees());
    setBenchmarks(generateSampleBenchmarks());
    setFileName('sample_org_ledger.csv');
    setCurrentView('dashboard');
  };

  // Reset state
  const handleClearData = () => {
    setEmployees([]);
    setBenchmarks([]);
    setFileName(null);
    setCurrentView('dashboard');
  };

  // Update employee salary (from outlier editing)
  const handleUpdateEmployeeSalary = (id: string, newSalary: number) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === id ? { ...emp, baseSalary: newSalary } : emp
      )
    );
  };



  // Render view panel
  const renderViewContent = () => {
    // If no data loaded, restrict tabs (except research/employees uploader)
    if (!hasData && currentView !== 'research' && currentView !== 'employees') {
      return (
        <CSVImporter 
          onDataImported={handleDataImported} 
          onLoadSampleData={handleLoadSampleData} 
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            employees={employees} 
            benchmarks={benchmarks} 
            onViewChange={setCurrentView} 
          />
        );
      case 'employees':
        if (!hasData) {
          return (
            <CSVImporter 
              onDataImported={handleDataImported} 
              onLoadSampleData={handleLoadSampleData} 
            />
          );
        }
        return <EmployeeRoster employees={employees} />;
      case 'outliers':
        return (
          <OutliersAnalysis 
            employees={employees} 
            benchmarks={benchmarks} 
            onUpdateEmployeeSalary={handleUpdateEmployeeSalary} 
          />
        );
      case 'benchmarks':
        return (
          <MarketBenchmarking 
            employees={employees} 
            benchmarks={benchmarks} 
          />
        );
      case 'philosophy':
        return (
          <PhilosophyAlignment 
            employees={employees} 
            benchmarks={benchmarks} 
          />
        );
      case 'research':
        return <MarketResearch employees={employees} />;
      default:
        return <Dashboard employees={employees} benchmarks={benchmarks} onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Drawer Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        hasData={hasData} 
      />

      {/* Main Panel */}
      <div className="main-content">
        <Header 
          currentView={currentView} 
          hasData={hasData} 
          employeeCount={employees.length} 
          fileName={fileName} 
          onClearData={handleClearData} 
        />

        <main style={{ flex: 1 }}>
          {renderViewContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
