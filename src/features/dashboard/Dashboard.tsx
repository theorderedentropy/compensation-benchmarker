import React, { useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import type { Employee, MarketBenchmark } from '../../types';
import { calculateMean, detectIQROutliers } from '../../utils/stats';

interface DashboardProps {
  employees: Employee[];
  benchmarks: MarketBenchmark[];
  onViewChange: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  employees, 
  benchmarks, 
  onViewChange 
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Metrics
  const stats = useMemo(() => {
    const headcount = employees.length;
    const totalPayroll = employees.reduce((sum, e) => sum + e.baseSalary, 0);
    const avgSalary = headcount > 0 ? totalPayroll / headcount : 0;
    
    // Find outliers
    const outlierList = detectIQROutliers(employees, benchmarks);
    const criticalOutliers = outlierList.filter(o => o.severity === 'danger').length;
    const totalOutliers = outlierList.length;

    return {
      headcount,
      totalPayroll,
      avgSalary,
      totalOutliers,
      criticalOutliers,
      outlierList
    };
  }, [employees, benchmarks]);

  // Chart 1 Data: Headcount by Job Family
  const headcountData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    employees.forEach(e => {
      counts[e.jobFamily] = (counts[e.jobFamily] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      Count: count
    })).sort((a, b) => b.Count - a.Count);
  }, [employees]);

  // Chart 2 Data: Average Salary by Gender per Job Family
  const genderPayGapData = useMemo(() => {
    const familyGroups: { [key: string]: { Male: number[]; Female: number[]; Nonbinary: number[] } } = {};
    
    employees.forEach(e => {
      if (!familyGroups[e.jobFamily]) {
        familyGroups[e.jobFamily] = { Male: [], Female: [], Nonbinary: [] };
      }
      
      const genderKey = e.gender.toLowerCase();
      if (genderKey.startsWith('m')) {
        familyGroups[e.jobFamily].Male.push(e.baseSalary);
      } else if (genderKey.startsWith('f')) {
        familyGroups[e.jobFamily].Female.push(e.baseSalary);
      } else {
        familyGroups[e.jobFamily].Nonbinary.push(e.baseSalary);
      }
    });

    return Object.entries(familyGroups).map(([name, groups]) => {
      const avgMale = calculateMean(groups.Male);
      const avgFemale = calculateMean(groups.Female);
      
      return {
        name,
        Male: Math.round(avgMale),
        Female: Math.round(avgFemale)
      };
    }).filter(item => item.Male > 0 || item.Female > 0);
  }, [employees]);

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>
          Compensation Analysis Overview
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Real-time metrics, alignment checks, and parity audits across your organization.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        {/* Headcount Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{
            background: 'var(--color-primary-glow)',
            color: 'var(--color-primary)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Headcount
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.1rem' }}>
              {stats.headcount}
            </span>
          </div>
        </div>

        {/* Total Payroll Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{
            background: 'var(--color-success-glow)',
            color: 'var(--color-success)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Annual Payroll
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.1rem' }}>
              {formatCurrency(stats.totalPayroll)}
            </span>
          </div>
        </div>

        {/* Avg Salary Card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{
            background: 'var(--color-info-glow)',
            color: 'var(--color-info)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Average Base Salary
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.1rem' }}>
              {formatCurrency(stats.avgSalary)}
            </span>
          </div>
        </div>

        {/* Outliers Card */}
        <button 
          onClick={() => onViewChange('outliers')}
          className="glass-card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem', 
            border: '1px solid var(--border-color)', 
            textAlign: 'left',
            cursor: 'pointer',
            width: '100%',
            backgroundColor: stats.totalOutliers > 0 ? 'rgba(244, 63, 94, 0.03)' : 'var(--bg-surface)'
          }}
        >
          <div style={{
            background: stats.totalOutliers > 0 ? 'var(--color-danger-glow)' : 'rgba(255, 255, 255, 0.05)',
            color: stats.totalOutliers > 0 ? 'var(--color-danger)' : 'var(--text-muted)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Flagged Outliers
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.1rem', color: stats.totalOutliers > 0 ? 'var(--color-danger)' : 'inherit' }}>
              {stats.totalOutliers}
            </span>
          </div>
          <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Visualizations Section */}
      <div className="charts-grid">
        {/* Gender Pay Gap Chart */}
        <div className="glass-card" style={{ height: '400px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Average Base Salary by Gender & Job Family</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={genderPayGapData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(tick) => `$${tick / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [value !== undefined ? formatCurrency(Number(value)) : '', '']}
                />
                <Legend iconSize={10} verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Male" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Female" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount Breakdown Chart */}
        <div className="glass-card" style={{ height: '400px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Headcount by Department</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={headcountData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={11} tickLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="Count" fill="var(--color-info)" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Outliers Alert List card */}
      {stats.totalOutliers > 0 && (
        <div className="glass-card" style={{ border: '1px solid rgba(244, 63, 94, 0.25)', backgroundColor: 'rgba(244, 63, 94, 0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
              <AlertTriangle size={18} />
              Critical Compensation Outliers Detected ({stats.totalOutliers})
            </h3>
            <button 
              onClick={() => onViewChange('outliers')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              Analyze All
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.outlierList.slice(0, 3).map((outlier) => (
              <div 
                key={outlier.employee.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  backgroundColor: 'var(--bg-surface-elevated)', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  borderLeft: outlier.severity === 'danger' ? '4px solid var(--color-danger)' : '4px solid var(--color-warning)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{outlier.employee.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({outlier.employee.title} &bull; {outlier.employee.level})</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {outlier.reason}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{formatCurrency(outlier.employee.baseSalary)}</div>
                  <div style={{ fontSize: '0.75rem', color: outlier.compaRatio < 0.8 ? 'var(--color-danger)' : 'var(--color-warning)', fontWeight: 500 }}>
                    Compa-Ratio: {(outlier.compaRatio * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
