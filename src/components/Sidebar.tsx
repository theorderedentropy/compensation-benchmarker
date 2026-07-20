import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquareCode, 
  TrendingDown
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  hasData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, hasData }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresData: false },
    { id: 'employees', label: 'Employee Roster', icon: Users, requiresData: false },
    { id: 'outliers', label: 'Outlier Analysis', icon: AlertTriangle, requiresData: true },
    { id: 'benchmarks', label: 'Market Benchmark', icon: TrendingUp, requiresData: true },
    { id: 'philosophy', label: 'Comp Philosophy', icon: ShieldCheck, requiresData: true },
    { id: 'research', label: 'AI Market Research', icon: MessageSquareCode, requiresData: false },
  ];

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary), #a855f7)',
          padding: '0.5rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>
          <TrendingDown size={22} color="#ffffff" style={{ transform: 'rotate(180deg)' }} />
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', display: 'block' }}>
            Comp<span style={{ color: 'var(--color-primary)' }}>Pulse</span>
          </span>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Compensation Suite
          </span>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = item.requiresData && !hasData;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              disabled={isDisabled}
              className={`nav-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                color: isActive 
                  ? 'var(--text-primary)' 
                  : isDisabled 
                    ? 'var(--text-muted)' 
                    : 'var(--text-secondary)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              title={isDisabled ? 'Upload employee data first to unlock this section' : undefined}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  height: '60%',
                  width: '4px',
                  borderRadius: '0 4px 4px 0',
                  backgroundColor: 'var(--color-primary)'
                }} />
              )}
              <Icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'inherit', opacity: isDisabled ? 0.4 : 1 }} />
              <span style={{ opacity: isDisabled ? 0.6 : 1 }}>{item.label}</span>
              {item.requiresData && !hasData && (
                <span style={{ 
                  fontSize: '0.6rem', 
                  marginLeft: 'auto', 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '0.15rem 0.4rem', 
                  borderRadius: '4px',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)'
                }}>
                  Locked
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="glass-card" style={{ padding: '0.75rem 1rem', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hasData ? 'var(--color-success)' : 'var(--color-warning)' }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {hasData ? 'Data Loaded' : 'No Data Active'}
        </span>
      </div>
    </aside>
  );
};
