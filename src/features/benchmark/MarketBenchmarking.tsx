import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Scale, AlertCircle, BarChart2 } from 'lucide-react';
import type { Employee, MarketBenchmark } from '../../types';
import { calculateMean } from '../../utils/stats';

interface MarketBenchmarkingProps {
  employees: Employee[];
  benchmarks: MarketBenchmark[];
}

export const MarketBenchmarking: React.FC<MarketBenchmarkingProps> = ({ 
  employees, 
  benchmarks
}) => {
  const [selectedFamily, setSelectedFamily] = useState<string>('Engineering');

  const families = useMemo(() => {
    const list = new Set(benchmarks.map(b => b.jobFamily));
    return Array.from(list).sort();
  }, [benchmarks]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Get matching stats between company data and benchmarks
  const benchmarkComparisonTable = useMemo(() => {
    const tableData: Array<{
      jobFamily: string;
      level: string;
      empCount: number;
      avgSalary: number;
      p25: number;
      p50: number;
      p75: number;
      marketIndex: number; // Avg Salary / Market p50
      status: 'under' | 'aligned' | 'over';
    }> = [];

    // Group employees by family and level
    const employeeGroups: { [key: string]: number[] } = {};
    employees.forEach(emp => {
      const key = `${emp.jobFamily}_${emp.level}`;
      if (!employeeGroups[key]) employeeGroups[key] = [];
      employeeGroups[key].push(emp.baseSalary);
    });

    benchmarks.forEach(bench => {
      const key = `${bench.jobFamily}_${bench.level}`;
      const salaries = employeeGroups[key] || [];
      const avgSalary = calculateMean(salaries);
      
      const marketIndex = bench.p50 > 0 && avgSalary > 0 ? (avgSalary / bench.p50) : 0;
      let status: 'under' | 'aligned' | 'over' = 'aligned';
      
      if (marketIndex > 0) {
        if (marketIndex < 0.90) status = 'under';
        else if (marketIndex > 1.10) status = 'over';
      }

      tableData.push({
        jobFamily: bench.jobFamily,
        level: bench.level,
        empCount: salaries.length,
        avgSalary,
        p25: bench.p25,
        p50: bench.p50,
        p75: bench.p75,
        marketIndex,
        status
      });
    });

    return tableData.sort((a, b) => {
      if (a.jobFamily !== b.jobFamily) return a.jobFamily.localeCompare(b.jobFamily);
      return a.level.localeCompare(b.level);
    });
  }, [employees, benchmarks]);

  // Chart Data for the selected Job Family
  const chartData = useMemo(() => {
    // Filter comparisons for selected family
    const familyComps = benchmarkComparisonTable.filter(c => c.jobFamily === selectedFamily);
    
    // Sort levels L1, L2, L3, etc.
    return familyComps.map(item => ({
      level: item.level,
      'Market p25': item.p25,
      'Market p50': item.p50,
      'Market p75': item.p75,
      'Company Avg': item.avgSalary > 0 ? Math.round(item.avgSalary) : null
    }));
  }, [benchmarkComparisonTable, selectedFamily]);

  const marketHealth = useMemo(() => {
    const activeComps = benchmarkComparisonTable.filter(c => c.empCount > 0);
    if (activeComps.length === 0) return { avgIndex: 0, underpaidPct: 0 };
    
    const totalIndex = activeComps.reduce((sum, c) => sum + c.marketIndex, 0);
    const avgIndex = totalIndex / activeComps.length;
    const underpaidCount = activeComps.filter(c => c.marketIndex < 0.90).length;
    const underpaidPct = (underpaidCount / activeComps.length) * 100;

    return {
      avgIndex,
      underpaidPct
    };
  }, [benchmarkComparisonTable]);

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            External Market Benchmarking
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Compare your internal pay structures against competitive industry percentiles.
          </p>
        </div>
      </div>

      {/* Market Indicators */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{
            background: 'var(--color-primary-glow)',
            color: 'var(--color-primary)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <Scale size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall Market Index
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.1rem', color: marketHealth.avgIndex < 0.9 ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {marketHealth.avgIndex > 0 ? `${(marketHealth.avgIndex * 100).toFixed(0)}%` : 'N/A'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Relative to 50th percentile (midpoint)
            </span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{
            background: marketHealth.underpaidPct > 30 ? 'var(--color-danger-glow)' : 'var(--color-success-glow)',
            color: marketHealth.underpaidPct > 30 ? 'var(--color-danger)' : 'var(--color-success)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Underpaid Cohorts
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.1rem', color: marketHealth.underpaidPct > 30 ? 'var(--color-danger)' : 'inherit' }}>
              {marketHealth.underpaidPct.toFixed(0)}%
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Cohorts paying &lt; 90% of market midpoint
            </span>
          </div>
        </div>

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
              Active Job Benchmarks
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'block', marginTop: '0.1rem' }}>
              {benchmarks.length}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Distinct job families & levels matched
            </span>
          </div>
        </div>
      </div>

      {/* Main Benchmarking Chart */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={18} style={{ color: 'var(--color-primary)' }} />
              Market Percentile Curves vs. Company Average
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Visualizing salary progressions across job levels for <strong>{selectedFamily}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Job Family:</span>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="form-input"
              style={{ minHeight: '38px', backgroundColor: 'var(--bg-main)', cursor: 'pointer', padding: '0.25rem 2rem 0.25rem 0.75rem' }}
            >
              {families.map(family => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ width: '100%', height: '320px', minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="level" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="var(--text-secondary)" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(tick) => `$${tick / 1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [value !== undefined ? formatCurrency(Number(value)) : '', '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
              <Line type="monotone" dataKey="Market p25" stroke="var(--text-muted)" strokeDasharray="5 5" dot={false} strokeWidth={1.5} />
              <Line type="monotone" dataKey="Market p50" stroke="var(--color-info)" strokeDasharray="3 3" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Market p75" stroke="var(--color-success)" strokeDasharray="5 5" dot={false} strokeWidth={1.5} />
              <Line type="monotone" dataKey="Company Avg" stroke="var(--color-primary)" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmarking Roster Table */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Market Comparison Directory</h3>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Job Family</th>
              <th>Level</th>
              <th style={{ textAlign: 'center' }}>Headcount</th>
              <th style={{ textAlign: 'right' }}>Company Avg</th>
              <th style={{ textAlign: 'right' }}>Market p25</th>
              <th style={{ textAlign: 'right' }}>Market p50 (Mid)</th>
              <th style={{ textAlign: 'right' }}>Market p75</th>
              <th style={{ textAlign: 'center' }}>Market Index</th>
              <th style={{ textAlign: 'center' }}>Status Alignment</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkComparisonTable.map((row, idx) => (
              <tr key={`${row.jobFamily}_${row.level}_${idx}`}>
                <td style={{ fontWeight: 600 }}>{row.jobFamily}</td>
                <td style={{ fontWeight: 600 }}>{row.level}</td>
                <td style={{ textAlign: 'center', color: row.empCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {row.empCount}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: row.avgSalary > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {row.avgSalary > 0 ? formatCurrency(row.avgSalary) : '—'}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(row.p25)}</td>
                <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(row.p50)}</td>
                <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{formatCurrency(row.p75)}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                  {row.marketIndex > 0 ? (
                    <span style={{
                      color: row.status === 'under' 
                        ? 'var(--color-danger)' 
                        : row.status === 'over' 
                          ? 'var(--color-primary)' 
                          : 'var(--color-success)'
                    }}>
                      {(row.marketIndex * 100).toFixed(0)}%
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {row.empCount === 0 ? (
                    <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                      No Data
                    </span>
                  ) : (
                    <span className={`badge badge-${row.status === 'under' ? 'danger' : row.status === 'over' ? 'warning' : 'success'}`}>
                      {row.status === 'under' ? 'Under Market' : row.status === 'over' ? 'Above Market' : 'Aligned'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
