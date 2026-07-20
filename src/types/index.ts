export interface Employee {
  id: string;
  name: string;
  title: string;
  jobFamily: string;
  level: string;
  baseSalary: number;
  equity: number;
  bonus: number;
  gender: string;
  tenureMonths: number;
}

export interface MarketBenchmark {
  jobFamily: string;
  level: string;
  p25: number;
  p50: number; // Midpoint
  p75: number;
  p90?: number;
}

export interface OutlierResult {
  employee: Employee;
  reason: string;
  severity: 'warning' | 'danger';
  compaRatio: number;
  expectedRange?: { min: number; max: number };
}

export interface CompPhilosophy {
  targetPercentile: 'p25' | 'p50' | 'p75' | 'p90';
  minCompaRatio: number;
  maxCompaRatio: number;
  maxPayGapPercentage: number;
}

export interface PolicyViolation {
  id: string;
  employeeId?: string;
  employeeName?: string;
  type: 'compa-ratio' | 'pay-gap' | 'range-breach' | 'equity-imbalance';
  message: string;
  severity: 'warning' | 'danger';
}
