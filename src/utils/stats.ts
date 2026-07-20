import type { Employee, MarketBenchmark, OutlierResult } from '../types';

export const calculateMean = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
};

export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const calculateStdDev = (numbers: number[], mean: number): number => {
  if (numbers.length <= 1) return 0;
  const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (numbers.length - 1);
  return Math.sqrt(variance);
};

export const calculatePercentile = (numbers: number[], percentile: number): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

// Outlier detection using Interquartile Range (IQR) method:
// Outliers are defined as values below Q1 - 1.5 * IQR or above Q3 + 1.5 * IQR
export const detectIQROutliers = (
  employees: Employee[], 
  benchmarks: MarketBenchmark[]
): OutlierResult[] => {
  const outliers: OutlierResult[] = [];

  // Group employees by Job Family and Level for cohort analysis
  const cohorts: { [key: string]: Employee[] } = {};
  employees.forEach(emp => {
    const key = `${emp.jobFamily}_${emp.level}`;
    if (!cohorts[key]) cohorts[key] = [];
    cohorts[key].push(emp);
  });

  // Analyze each cohort
  Object.entries(cohorts).forEach(([cohortKey, cohortEmps]) => {
    const [jobFamily, level] = cohortKey.split('_');
    const salaries = cohortEmps.map(e => e.baseSalary);
    
    // Find market benchmark midpoint (p50)
    const benchmark = benchmarks.find(b => b.jobFamily === jobFamily && b.level === level);
    const midpoint = benchmark ? benchmark.p50 : calculateMedian(salaries);

    // If cohort is too small (e.g. < 4), calculate outliers relative to market benchmark ranges if available, or skip statistical IQR
    if (cohortEmps.length < 4) {
      if (benchmark) {
        // Use market range (e.g. below p25 is warning, below 0.8 * p50 is critical)
        cohortEmps.forEach(emp => {
          const compaRatio = emp.baseSalary / midpoint;
          
          if (compaRatio < 0.80) {
            outliers.push({
              employee: emp,
              reason: `Severely Underpaid (Compa-Ratio: ${(compaRatio * 100).toFixed(0)}% is below 80% market midpoint)`,
              severity: 'danger',
              compaRatio,
              expectedRange: { min: benchmark.p25, max: benchmark.p75 }
            });
          } else if (compaRatio > 1.25) {
            outliers.push({
              employee: emp,
              reason: `Overpaid (Compa-Ratio: ${(compaRatio * 100).toFixed(0)}% is above 125% market midpoint)`,
              severity: 'warning',
              compaRatio,
              expectedRange: { min: benchmark.p25, max: benchmark.p75 }
            });
          }
        });
      }
      return; // Skip statistical IQR for tiny cohorts
    }

    // Standard IQR calculations
    const q1 = calculatePercentile(salaries, 25);
    const q3 = calculatePercentile(salaries, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    cohortEmps.forEach(emp => {
      const compaRatio = emp.baseSalary / midpoint;
      
      if (emp.baseSalary < lowerBound) {
        outliers.push({
          employee: emp,
          reason: `Statistical low outlier (Paid ${formatCurrency(lowerBound - emp.baseSalary)} below cohort Q1 - 1.5*IQR threshold)`,
          severity: 'danger',
          compaRatio,
          expectedRange: { min: lowerBound, max: upperBound }
        });
      } else if (emp.baseSalary > upperBound) {
        outliers.push({
          employee: emp,
          reason: `Statistical high outlier (Paid ${formatCurrency(emp.baseSalary - upperBound)} above cohort Q3 + 1.5*IQR threshold)`,
          severity: 'warning',
          compaRatio,
          expectedRange: { min: lowerBound, max: upperBound }
        });
      } else if (compaRatio < 0.80) {
        outliers.push({
          employee: emp,
          reason: `Low Compa-Ratio (${(compaRatio * 100).toFixed(0)}% of market midpoint)`,
          severity: 'warning',
          compaRatio,
          expectedRange: { min: benchmark ? benchmark.p25 : q1, max: benchmark ? benchmark.p75 : q3 }
        });
      } else if (compaRatio > 1.20) {
        outliers.push({
          employee: emp,
          reason: `High Compa-Ratio (${(compaRatio * 100).toFixed(0)}% of market midpoint)`,
          severity: 'warning',
          compaRatio,
          expectedRange: { min: benchmark ? benchmark.p25 : q1, max: benchmark ? benchmark.p75 : q3 }
        });
      }
    });
  });

  return outliers;
};

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};
