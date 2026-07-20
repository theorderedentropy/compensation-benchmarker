import React, { useState, useMemo, useRef } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { DollarSign, Settings, Check, X, ShieldAlert } from 'lucide-react';
import type { Employee, MarketBenchmark, OutlierResult } from '../../types';
import { detectIQROutliers } from '../../utils/stats';

interface OutliersAnalysisProps {
  employees: Employee[];
  benchmarks: MarketBenchmark[];
  onUpdateEmployeeSalary: (id: string, newSalary: number) => void;
}

export const OutliersAnalysis: React.FC<OutliersAnalysisProps> = ({ 
  employees, 
  benchmarks,
  onUpdateEmployeeSalary
}) => {
  const [selectedOutlier, setSelectedOutlier] = useState<OutlierResult | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  const outliers = useMemo(() => {
    return detectIQROutliers(employees, benchmarks);
  }, [employees, benchmarks]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  // Prepare scatter plot data
  const scatterData = useMemo(() => {
    const outlierIds = new Set(outliers.map(o => o.employee.id));
    
    return employees.map(emp => {
      const isOutlier = outlierIds.has(emp.id);
      const outlierInfo = outliers.find(o => o.employee.id === emp.id);
      
      return {
        id: emp.id,
        name: emp.name,
        title: emp.title,
        jobFamily: emp.jobFamily,
        level: emp.level,
        tenure: emp.tenureMonths,
        salary: emp.baseSalary,
        isOutlier,
        severity: outlierInfo?.severity || 'none',
        reason: outlierInfo?.reason || ''
      };
    });
  }, [employees, outliers]);

  const handleOpenAdjustment = (outlier: OutlierResult) => {
    setSelectedOutlier(outlier);
    setAdjustmentValue(outlier.employee.baseSalary.toString());
    dialogRef.current?.showModal();
  };

  const handleCloseAdjustment = () => {
    dialogRef.current?.close();
    setSelectedOutlier(null);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOutlier && adjustmentValue) {
      const newSalary = parseFloat(adjustmentValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(newSalary) && newSalary > 0) {
        onUpdateEmployeeSalary(selectedOutlier.employee.id, newSalary);
        handleCloseAdjustment();
      }
    }
  };

  // Scatter plot custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card" style={{ 
          padding: '0.75rem 1rem', 
          border: data.isOutlier 
            ? `1px solid var(--color-${data.severity})` 
            : '1px solid var(--border-color)', 
          fontSize: '0.8rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          maxWidth: '250px'
        }}>
          <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{data.name}</strong>
          <span style={{ display: 'block', color: 'var(--text-secondary)' }}>{data.title} ({data.level})</span>
          <span style={{ display: 'block', color: 'var(--text-secondary)' }}>Tenure: {data.tenure} months</span>
          <span style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
            Base Salary: {formatCurrency(data.salary)}
          </span>
          {data.isOutlier && (
            <span style={{ 
              display: 'block', 
              color: `var(--color-${data.severity})`, 
              fontWeight: 500, 
              marginTop: '0.4rem', 
              borderTop: '1px solid rgba(255,255,255,0.05)', 
              paddingTop: '0.4rem'
            }}>
              ⚠️ {data.reason}
            </span>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            Outlier Analysis Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Identify employees whose compensation deviates statistically from their cohort or range boundaries.
          </p>
        </div>
      </div>

      <div className="charts-grid" style={{ marginBottom: '2rem' }}>
        {/* Scatter Plot Visualizer */}
        <div className="glass-card" style={{ height: '420px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Compensation vs. Tenure Map</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  type="number" 
                  dataKey="tenure" 
                  name="Tenure" 
                  unit=" mo" 
                  stroke="var(--text-secondary)" 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  type="number" 
                  dataKey="salary" 
                  name="Salary" 
                  stroke="var(--text-secondary)" 
                  fontSize={11} 
                  tickLine={false}
                  tickFormatter={(tick) => `$${tick / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Employees" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.isOutlier 
                          ? entry.severity === 'danger' 
                            ? 'var(--color-danger)' 
                            : 'var(--color-warning)'
                          : 'var(--color-primary)'
                      } 
                      style={{ cursor: 'pointer' }}
                      r={entry.isOutlier ? 8 : 5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Within Expected Cohort Range</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Minor Outlier (Warning)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Significant Outlier (Critical)</span>
            </div>
          </div>
        </div>

        {/* Statistical Explanation Card */}
        <div className="glass-card" style={{ border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-primary)' }} />
              How are outliers detected?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
              Our analytics engine groups employees into cohorts by <strong>Job Family</strong> and <strong>Level</strong>. It then runs two detection routines:
            </p>
            <ol style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: '1.5' }}>
              <li>
                <strong>Cohort Interquartile Range (IQR):</strong> For groups of 4 or more, we calculate Q1 (25th percentile) and Q3 (75th percentile). Salaries outside 1.5x the IQR range are flagged as statistical anomalies.
              </li>
              <li>
                <strong>Market Compa-Ratio breaches:</strong> Employees earning less than 80% (low compa-ratio) or more than 120% (high compa-ratio) of the market benchmark midpoint (p50) are flagged.
              </li>
            </ol>
          </div>

          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem', 
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginTop: '1.5rem'
          }}>
            <strong>Recommendation:</strong> Low outliers represent flight risks or compliance anomalies. High outliers might represent top performers or misaligned grades. Review and adjust range assignments or compensation parameters.
          </div>
        </div>
      </div>

      {/* Outliers Table */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Flagged Outlier Directory ({outliers.length})</h3>
      {outliers.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Name</th>
                <th>Job Cohort</th>
                <th style={{ textAlign: 'right' }}>Actual Salary</th>
                <th>Outlier Flags & Reasoning</th>
                <th style={{ textAlign: 'center' }}>Compa-Ratio</th>
                <th style={{ textAlign: 'center' }}>Severity</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {outliers.map((o) => (
                <tr key={o.employee.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{o.employee.id}</td>
                  <td style={{ fontWeight: 600 }}>{o.employee.name}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {o.employee.jobFamily} &bull; {o.employee.level}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(o.employee.baseSalary)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{o.reason}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>
                    <span style={{
                      color: o.compaRatio < 0.8 || o.compaRatio > 1.2 
                        ? o.severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)' 
                        : 'var(--color-success)'
                    }}>
                      {(o.compaRatio * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${o.severity === 'danger' ? 'danger' : 'warning'}`}>
                      {o.severity}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => handleOpenAdjustment(o)}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Settings size={12} />
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Check size={20} />
            Clean Comp Sweep!
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No statistical outliers or compa-ratio violations detected in the ledger.</p>
        </div>
      )}

      {/* Salary Adjustment Modal Dialog */}
      <dialog 
        ref={dialogRef} 
        style={{
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          padding: 0,
          boxShadow: 'var(--shadow-xl)',
          maxWidth: '450px',
          width: '90%',
          margin: 'auto'
        }}
        onClick={(e) => {
          // Close on backdrop click
          if (e.target === dialogRef.current) {
            handleCloseAdjustment();
          }
        }}
      >
        {selectedOutlier && (
          <form onSubmit={handleSaveAdjustment} style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={20} style={{ color: 'var(--color-primary)' }} />
                Adjust Compensation
              </h3>
              <button 
                type="button" 
                onClick={handleCloseAdjustment}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Employee Details
              </div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{selectedOutlier.employee.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedOutlier.employee.title} &bull; {selectedOutlier.employee.level}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid var(--border-color)', 
                padding: '0.6rem 0.8rem', 
                borderRadius: '6px', 
                marginTop: '0.75rem',
                color: selectedOutlier.severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'
              }}>
                <strong>Issue:</strong> {selectedOutlier.reason}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="new-salary-input" className="form-label">New Annual Base Salary ($)</label>
              <input
                id="new-salary-input"
                type="text"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value.replace(/[^0-9.]/g, ''))}
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
                placeholder="e.g. 120000"
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
              <button type="button" onClick={handleCloseAdjustment} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                Apply Adjustment
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
};
