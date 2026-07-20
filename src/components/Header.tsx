import React from 'react';
import { Database, Trash2, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  hasData: boolean;
  employeeCount: number;
  fileName: string | null;
  onClearData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  hasData, 
  employeeCount, 
  fileName, 
  onClearData 
}) => {
  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Analytics Dashboard';
      case 'employees':
        return 'Employee Roster';
      case 'outliers':
        return 'Outlier Detection';
      case 'benchmarks':
        return 'Market Benchmarking';
      case 'philosophy':
        return 'Philosophy Alignment';
      case 'research':
        return 'AI Comp Researcher';
      default:
        return 'Compensation Benchmarker';
    }
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      backgroundColor: 'rgba(18, 24, 38, 0.7)',
      backdropFilter: 'var(--backdrop-glass)',
      WebkitBackdropFilter: 'var(--backdrop-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 9
    }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
          {getTitle()}
        </h1>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Compensation Suite &bull; {getTitle()}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {hasData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', animation: 'fadeIn 0.2s ease' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem'
            }}>
              <Database size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                {fileName} ({employeeCount} records)
              </span>
            </div>

            <button
              onClick={onClearData}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                borderColor: 'rgba(244, 63, 94, 0.2)',
                color: 'var(--color-danger)'
              }}
              title="Clear all compensation data"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
        )}

        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'color 0.2s ease'
          }}
          className="header-icon-link"
        >
          <HelpCircle size={20} />
        </a>
      </div>
    </header>
  );
};
