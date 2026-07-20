import type { Employee, MarketBenchmark } from '../types';

export const generateSampleEmployees = (): Employee[] => {
  return [
    // Engineering
    { id: 'EMP001', name: 'Alex Rivera', title: 'Associate Software Engineer', jobFamily: 'Engineering', level: 'L1', baseSalary: 72000, equity: 10000, bonus: 5000, gender: 'Male', tenureMonths: 14 },
    { id: 'EMP002', name: 'Beatrice Vance', title: 'Associate Software Engineer', jobFamily: 'Engineering', level: 'L1', baseSalary: 74500, equity: 12000, bonus: 5000, gender: 'Female', tenureMonths: 18 },
    { id: 'EMP003', name: 'Carlos Mendez', title: 'Software Engineer', jobFamily: 'Engineering', level: 'L2', baseSalary: 96000, equity: 25000, bonus: 10000, gender: 'Male', tenureMonths: 24 },
    { id: 'EMP004', name: 'Diana Prince', title: 'Software Engineer', jobFamily: 'Engineering', level: 'L2', baseSalary: 98000, equity: 28000, bonus: 10000, gender: 'Female', tenureMonths: 30 },
    { id: 'EMP005', name: 'Evan Wright', title: 'Software Engineer', jobFamily: 'Engineering', level: 'L2', baseSalary: 101000, equity: 22000, bonus: 9500, gender: 'Male', tenureMonths: 12 },
    { id: 'EMP006', name: 'Fiona Gallagher', title: 'Senior Software Engineer', jobFamily: 'Engineering', level: 'L3', baseSalary: 138000, equity: 65000, bonus: 20000, gender: 'Female', tenureMonths: 48 },
    { id: 'EMP007', name: 'George Chen', title: 'Senior Software Engineer', jobFamily: 'Engineering', level: 'L3', baseSalary: 142000, equity: 70000, bonus: 22000, gender: 'Male', tenureMonths: 36 },
    // Outlier 1: Underpaid Senior Engineer (Very low salary)
    { id: 'EMP008', name: 'Hugo Strange', title: 'Senior Software Engineer', jobFamily: 'Engineering', level: 'L3', baseSalary: 92000, equity: 40000, bonus: 15000, gender: 'Male', tenureMonths: 42 },
    // Outlier 2: Overpaid Senior Engineer (Very high salary)
    { id: 'EMP009', name: 'Irene Adler', title: 'Senior Software Engineer', jobFamily: 'Engineering', level: 'L3', baseSalary: 215000, equity: 85000, bonus: 30000, gender: 'Female', tenureMonths: 54 },
    { id: 'EMP010', name: 'James Wilson', title: 'Staff Software Engineer', jobFamily: 'Engineering', level: 'L4', baseSalary: 178000, equity: 120000, bonus: 35000, gender: 'Male', tenureMonths: 60 },
    { id: 'EMP011', name: 'Kate Bishop', title: 'Staff Software Engineer', jobFamily: 'Engineering', level: 'L4', baseSalary: 182000, equity: 130000, bonus: 35000, gender: 'Female', tenureMonths: 28 },
    { id: 'EMP012', name: 'Logan Howlett', title: 'Principal Software Engineer', jobFamily: 'Engineering', level: 'L5', baseSalary: 225000, equity: 220000, bonus: 50000, gender: 'Male', tenureMonths: 72 },
    { id: 'EMP013', name: 'Maria Hill', title: 'Director of Engineering', jobFamily: 'Engineering', level: 'L6', baseSalary: 265000, equity: 350000, bonus: 80000, gender: 'Female', tenureMonths: 84 },

    // Product Management
    { id: 'EMP014', name: 'Nathan Drake', title: 'Associate Product Manager', jobFamily: 'Product', level: 'L1', baseSalary: 68000, equity: 8000, bonus: 6000, gender: 'Male', tenureMonths: 8 },
    { id: 'EMP015', name: 'Olivia Wilde', title: 'Product Manager', jobFamily: 'Product', level: 'L2', baseSalary: 92000, equity: 20000, bonus: 12000, gender: 'Female', tenureMonths: 20 },
    { id: 'EMP016', name: 'Peter Parker', title: 'Product Manager', jobFamily: 'Product', level: 'L2', baseSalary: 94000, equity: 18000, bonus: 12000, gender: 'Male', tenureMonths: 16 },
    { id: 'EMP017', name: 'Quinn Fabray', title: 'Senior Product Manager', jobFamily: 'Product', level: 'L3', baseSalary: 130000, equity: 55000, bonus: 25000, gender: 'Female', tenureMonths: 40 },
    { id: 'EMP018', name: 'Reed Richards', title: 'Senior Product Manager', jobFamily: 'Product', level: 'L3', baseSalary: 135000, equity: 60000, bonus: 25000, gender: 'Male', tenureMonths: 32 },
    { id: 'EMP019', name: 'Susan Storm', title: 'Principal Product Manager', jobFamily: 'Product', level: 'L5', baseSalary: 210000, equity: 180000, bonus: 55000, gender: 'Female', tenureMonths: 96 },

    // Design
    { id: 'EMP020', name: 'Tony Stark', title: 'Associate Designer', jobFamily: 'Design', level: 'L1', baseSalary: 60000, equity: 5000, bonus: 4000, gender: 'Male', tenureMonths: 11 },
    { id: 'EMP021', name: 'Uma Thurman', title: 'Designer', jobFamily: 'Design', level: 'L2', baseSalary: 82000, equity: 12000, bonus: 8000, gender: 'Female', tenureMonths: 22 },
    // Pay parity gap check: Male Designer L2 paid higher than Female L2 Designer
    { id: 'EMP022', name: 'Victor Stone', title: 'Designer', jobFamily: 'Design', level: 'L2', baseSalary: 94000, equity: 15000, bonus: 9000, gender: 'Male', tenureMonths: 24 },
    { id: 'EMP023', name: 'Wanda Maximoff', title: 'Senior Designer', jobFamily: 'Design', level: 'L3', baseSalary: 115000, equity: 40000, bonus: 18000, gender: 'Female', tenureMonths: 36 },
    { id: 'EMP024', name: 'Xavier Charles', title: 'Senior Designer', jobFamily: 'Design', level: 'L3', baseSalary: 128000, equity: 48000, bonus: 20000, gender: 'Male', tenureMonths: 50 },

    // Sales (High bonus focus)
    { id: 'EMP025', name: 'Yolanda Hadid', title: 'Sales Representative', jobFamily: 'Sales', level: 'L1', baseSalary: 50000, equity: 2000, bonus: 40000, gender: 'Female', tenureMonths: 15 },
    { id: 'EMP026', name: 'Zachary Levi', title: 'Sales Representative', jobFamily: 'Sales', level: 'L1', baseSalary: 52000, equity: 2000, bonus: 42000, gender: 'Male', tenureMonths: 12 },
    { id: 'EMP027', name: 'Arthur Curry', title: 'Account Executive', jobFamily: 'Sales', level: 'L2', baseSalary: 75000, equity: 10000, bonus: 70000, gender: 'Male', tenureMonths: 26 },
    { id: 'EMP028', name: 'Bruce Wayne', title: 'Account Executive', jobFamily: 'Sales', level: 'L2', baseSalary: 78000, equity: 12000, bonus: 75000, gender: 'Male', tenureMonths: 31 },
    { id: 'EMP029', name: 'Clark Kent', title: 'Senior Account Executive', jobFamily: 'Sales', level: 'L3', baseSalary: 110000, equity: 35000, bonus: 110000, gender: 'Male', tenureMonths: 45 },
    { id: 'EMP030', name: 'Emma Frost', title: 'Senior Account Executive', jobFamily: 'Sales', level: 'L3', baseSalary: 108000, equity: 33000, bonus: 105000, gender: 'Female', tenureMonths: 48 },

    // Marketing
    { id: 'EMP031', name: 'Flash Allen', title: 'Marketing Coordinator', jobFamily: 'Marketing', level: 'L1', baseSalary: 55000, equity: 1000, bonus: 3000, gender: 'Male', tenureMonths: 6 },
    { id: 'EMP032', name: 'Gwen Stacy', title: 'Marketing Specialist', jobFamily: 'Marketing', level: 'L2', baseSalary: 76000, equity: 8000, bonus: 6000, gender: 'Female', tenureMonths: 19 },
    { id: 'EMP033', name: 'Hal Jordan', title: 'Marketing Specialist', jobFamily: 'Marketing', level: 'L2', baseSalary: 74000, equity: 7500, bonus: 6000, gender: 'Male', tenureMonths: 14 },
    { id: 'EMP034', name: 'Ivy Pepper', title: 'Senior Marketing Manager', jobFamily: 'Marketing', level: 'L3', baseSalary: 105000, equity: 22000, bonus: 15000, gender: 'Female', tenureMonths: 38 }
  ];
};

export const generateSampleBenchmarks = (): MarketBenchmark[] => {
  return [
    // Engineering Benchmarks
    { jobFamily: 'Engineering', level: 'L1', p25: 65000, p50: 72000, p75: 80000, p90: 90000 },
    { jobFamily: 'Engineering', level: 'L2', p25: 85000, p50: 95000, p75: 108000, p90: 120000 },
    { jobFamily: 'Engineering', level: 'L3', p25: 120000, p50: 135000, p75: 150000, p90: 170000 },
    { jobFamily: 'Engineering', level: 'L4', p25: 155000, p50: 175000, p75: 195000, p90: 215000 },
    { jobFamily: 'Engineering', level: 'L5', p25: 200000, p50: 225000, p75: 250000, p90: 280000 },
    { jobFamily: 'Engineering', level: 'L6', p25: 240000, p50: 270000, p75: 310000, p90: 350000 },

    // Product Benchmarks
    { jobFamily: 'Product', level: 'L1', p25: 60000, p50: 67000, p75: 75000, p90: 85000 },
    { jobFamily: 'Product', level: 'L2', p25: 80000, p50: 90000, p75: 102000, p90: 115000 },
    { jobFamily: 'Product', level: 'L3', p25: 115000, p50: 128000, p75: 142000, p90: 160000 },
    { jobFamily: 'Product', level: 'L4', p25: 150000, p50: 168000, p75: 188000, p90: 210000 },
    { jobFamily: 'Product', level: 'L5', p25: 190000, p50: 212000, p75: 240000, p90: 270000 },

    // Design Benchmarks
    { jobFamily: 'Design', level: 'L1', p25: 55000, p50: 62000, p75: 70000, p90: 80000 },
    { jobFamily: 'Design', level: 'L2', p25: 75000, p50: 85000, p75: 96000, p90: 108000 },
    { jobFamily: 'Design', level: 'L3', p25: 105000, p50: 118000, p75: 132000, p90: 148000 },
    { jobFamily: 'Design', level: 'L4', p25: 135000, p50: 152000, p75: 172000, p90: 195000 },

    // Sales Benchmarks
    { jobFamily: 'Sales', level: 'L1', p25: 45000, p50: 52000, p75: 60000, p90: 70000 },
    { jobFamily: 'Sales', level: 'L2', p25: 65000, p50: 75000, p75: 86000, p90: 98000 },
    { jobFamily: 'Sales', level: 'L3', p25: 90000, p50: 105000, p75: 120000, p90: 138000 },

    // Marketing Benchmarks
    { jobFamily: 'Marketing', level: 'L1', p25: 50000, p50: 56000, p75: 63000, p90: 72000 },
    { jobFamily: 'Marketing', level: 'L2', p25: 68000, p50: 76000, p75: 85000, p90: 96000 },
    { jobFamily: 'Marketing', level: 'L3', p25: 92000, p50: 104000, p75: 118000, p90: 132000 }
  ];
};

export const exportToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => {
      let value = item[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};
