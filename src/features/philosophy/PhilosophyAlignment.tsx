import { useState, useMemo } from 'react';
import { ShieldCheck, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Employee, MarketBenchmark, CompPhilosophy, PolicyViolation } from '../../types';
import { calculateMean } from '../../utils/stats';

interface PhilosophyAlignmentProps {
  employees: Employee[];
  benchmarks: MarketBenchmark[];
}

export const PhilosophyAlignment: React.FC<PhilosophyAlignmentProps> = ({ 
  employees, 
  benchmarks 
}) => {
  // 1. Philosophy State Model
  const [philosophy, setPhilosophy] = useState<CompPhilosophy>({
    targetPercentile: 'p50',
    minCompaRatio: 0.80,
    maxCompaRatio: 1.20,
    maxPayGapPercentage: 5.0
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // 2. Perform Real-time Auditing based on Philosophy State
  const auditResults = useMemo(() => {
    const violations: PolicyViolation[] = [];
    
    // Group employees by Family & Level
    const cohortMap: { [key: string]: Employee[] } = {};
    employees.forEach(emp => {
      const key = `${emp.jobFamily}_${emp.level}`;
      if (!cohortMap[key]) cohortMap[key] = [];
      cohortMap[key].push(emp);
    });

    // Check Compa-Ratio and Range Breaches
    employees.forEach(emp => {
      const benchmark = benchmarks.find(b => b.jobFamily === emp.jobFamily && b.level === emp.level);
      if (!benchmark) return;

      // Calculate Target Salary based on selected percentile
      const targetMid = (benchmark[philosophy.targetPercentile as keyof MarketBenchmark] as number) || benchmark.p50;
      const compaRatio = emp.baseSalary / targetMid;

      // Check boundaries
      if (compaRatio < philosophy.minCompaRatio) {
        violations.push({
          id: `CR_LOW_${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.name,
          type: 'compa-ratio',
          message: `${emp.name} (${emp.title}) falls below the minimum policy Compa-Ratio threshold of ${(philosophy.minCompaRatio * 100).toFixed(0)}%. (Current: ${(compaRatio * 100).toFixed(0)}%)`,
          severity: compaRatio < (philosophy.minCompaRatio - 0.10) ? 'danger' : 'warning'
        });
      } else if (compaRatio > philosophy.maxCompaRatio) {
        violations.push({
          id: `CR_HIGH_${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.name,
          type: 'compa-ratio',
          message: `${emp.name} (${emp.title}) exceeds the maximum policy Compa-Ratio threshold of ${(philosophy.maxCompaRatio * 100).toFixed(0)}%. (Current: ${(compaRatio * 100).toFixed(0)}%)`,
          severity: compaRatio > (philosophy.maxCompaRatio + 0.10) ? 'danger' : 'warning'
        });
      }
    });

    // Pay Gap Audit by Job Family (Equal pay for equal work check)
    const families = Array.from(new Set(employees.map(e => e.jobFamily)));
    const payGapReport: Array<{
      jobFamily: string;
      avgMale: number;
      avgFemale: number;
      gapPct: number;
      isViolating: boolean;
      maleCount: number;
      femaleCount: number;
    }> = [];

    families.forEach(family => {
      const familyEmps = employees.filter(e => e.jobFamily === family);
      const maleSalaries = familyEmps.filter(e => e.gender.toLowerCase().startsWith('m')).map(e => e.baseSalary);
      const femaleSalaries = familyEmps.filter(e => e.gender.toLowerCase().startsWith('f')).map(e => e.baseSalary);

      const avgMale = calculateMean(maleSalaries);
      const avgFemale = calculateMean(femaleSalaries);

      if (avgMale > 0 && avgFemale > 0) {
        // Gap formula: (Male - Female) / Male
        const gapPct = ((avgMale - avgFemale) / avgMale) * 100;
        const isViolating = Math.abs(gapPct) > philosophy.maxPayGapPercentage;
        
        payGapReport.push({
          jobFamily: family,
          avgMale,
          avgFemale,
          gapPct,
          isViolating,
          maleCount: maleSalaries.length,
          femaleCount: femaleSalaries.length
        });

        if (isViolating) {
          violations.push({
            id: `GAP_${family}`,
            type: 'pay-gap',
            message: `Demographic pay gap in ${family} is ${Math.abs(gapPct).toFixed(1)}%, which exceeds your philosophy tolerance threshold of ${philosophy.maxPayGapPercentage}%. (Average Male: ${formatCurrency(avgMale)} vs. Female: ${formatCurrency(avgFemale)})`,
            severity: Math.abs(gapPct) > (philosophy.maxPayGapPercentage * 2) ? 'danger' : 'warning'
          });
        }
      }
    });

    return {
      violations,
      payGapReport
    };
  }, [employees, benchmarks, philosophy]);

  // Count genders
  const genderDistribution = useMemo(() => {
    let male = 0;
    let female = 0;
    let other = 0;
    employees.forEach(e => {
      const g = e.gender.toLowerCase();
      if (g.startsWith('m')) male++;
      else if (g.startsWith('f')) female++;
      else other++;
    });
    return { male, female, other };
  }, [employees]);

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            Philosophy Alignment & Policy Auditing
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Model your organization's pay strategy and audit compliance in real-time.
          </p>
        </div>
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '2rem' }}>
        {/* Policy Modeler Panel */}
        <div className="glass-card" style={{ border: '1px solid var(--border-color)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} style={{ color: 'var(--color-primary)' }} />
            Policy Parameters
          </h3>

          <div className="form-field">
            <label htmlFor="percentile-target" className="form-label">Target Market Percentile</label>
            <select
              id="percentile-target"
              value={philosophy.targetPercentile}
              onChange={(e) => setPhilosophy({ ...philosophy, targetPercentile: e.target.value as any })}
              className="form-input"
              style={{ backgroundColor: 'var(--bg-main)', cursor: 'pointer' }}
            >
              <option value="p25">25th Percentile (Conservative)</option>
              <option value="p50">50th Percentile (Market Average)</option>
              <option value="p75">75th Percentile (Aggressive / Lead-Market)</option>
              <option value="p90">90th Percentile (Top Tier)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-field">
              <label htmlFor="min-compa-ratio" className="form-label">Min Compa-Ratio</label>
              <input
                id="min-compa-ratio"
                type="number"
                step="0.05"
                min="0.5"
                max="1.0"
                value={philosophy.minCompaRatio}
                onChange={(e) => setPhilosophy({ ...philosophy, minCompaRatio: parseFloat(e.target.value) || 0.8 })}
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label htmlFor="max-compa-ratio" className="form-label">Max Compa-Ratio</label>
              <input
                id="max-compa-ratio"
                type="number"
                step="0.05"
                min="1.0"
                max="1.5"
                value={philosophy.maxCompaRatio}
                onChange={(e) => setPhilosophy({ ...philosophy, maxCompaRatio: parseFloat(e.target.value) || 1.2 })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-field" style={{ marginTop: '0.5rem' }}>
            <label htmlFor="max-pay-gap" className="form-label">Max Allowable Pay Gap (%)</label>
            <input
              id="max-pay-gap"
              type="number"
              step="0.5"
              min="0"
              max="20"
              value={philosophy.maxPayGapPercentage}
              onChange={(e) => setPhilosophy({ ...philosophy, maxPayGapPercentage: parseFloat(e.target.value) || 5 })}
              className="form-input"
            />
          </div>

          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
            lineHeight: '1.4'
          }}>
            Adjusting these parameters runs a live audit of your employee ledger. Watch how the violation count updates in real-time.
          </div>
        </div>

        {/* Real-time Audit Violations list */}
        <div className="glass-card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
              Live Audit Checklist
            </span>
            <span className={`badge badge-${auditResults.violations.length > 0 ? 'warning' : 'success'}`}>
              {auditResults.violations.length} Concerns
            </span>
          </h3>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px' }}>
            {auditResults.violations.length > 0 ? (
              auditResults.violations.map((violation: PolicyViolation) => (
                <div 
                  key={violation.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem', 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    padding: '0.85rem 1rem', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-color)',
                    borderLeft: violation.severity === 'danger' ? '4px solid var(--color-danger)' : '4px solid var(--color-warning)'
                  }}
                >
                  <AlertTriangle 
                    size={16} 
                    style={{ 
                      flexShrink: 0, 
                      marginTop: '0.15rem', 
                      color: violation.severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)' 
                    }} 
                  />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {violation.message}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-secondary)' }}>
                <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>Compliant with Policy</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', textAlign: 'center' }}>No compa-ratio or demographic pay gap exceptions found.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay Equity Diagnostics Tab */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Demographic Pay Equity & Representation</h3>
      
      {/* Representation indicator row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase' }}>Male Representation</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{genderDistribution.male} employees</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({((genderDistribution.male / employees.length) * 100).toFixed(0)}% of roster)</span>
        </div>
        <div className="glass-card" style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase' }}>Female Representation</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7' }}>{genderDistribution.female} employees</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({((genderDistribution.female / employees.length) * 100).toFixed(0)}% of roster)</span>
        </div>
        <div className="glass-card" style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', textTransform: 'uppercase' }}>Other/Undisclosed</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>{genderDistribution.other} employees</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({((genderDistribution.other / employees.length) * 100).toFixed(0)}% of roster)</span>
        </div>
      </div>

      {/* Pay gap table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Job Family</th>
              <th style={{ textAlign: 'center' }}>Male Staff</th>
              <th style={{ textAlign: 'center' }}>Female Staff</th>
              <th style={{ textAlign: 'right' }}>Male Avg Salary</th>
              <th style={{ textAlign: 'right' }}>Female Avg Salary</th>
              <th style={{ textAlign: 'center' }}>Raw Gender Pay Gap</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {auditResults.payGapReport.map((row: {
              jobFamily: string;
              avgMale: number;
              avgFemale: number;
              gapPct: number;
              isViolating: boolean;
              maleCount: number;
              femaleCount: number;
            }) => (
              <tr key={row.jobFamily}>
                <td style={{ fontWeight: 600 }}>{row.jobFamily}</td>
                <td style={{ textAlign: 'center' }}>{row.maleCount}</td>
                <td style={{ textAlign: 'center' }}>{row.femaleCount}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(row.avgMale)}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(row.avgFemale)}</td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>
                  <span style={{ color: Math.abs(row.gapPct) > philosophy.maxPayGapPercentage ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {row.gapPct > 0 ? `Male Paid +${row.gapPct.toFixed(1)}%` : `Female Paid +${Math.abs(row.gapPct).toFixed(1)}%`}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge badge-${row.isViolating ? 'danger' : 'success'}`}>
                    {row.isViolating ? 'Gap Deviation' : 'Parity Achieved'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
