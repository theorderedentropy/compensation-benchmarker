# 📊 CompPulse — Compensation Benchmarker & Analytics Suite

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CompPulse (Compensation Benchmarker)** is a modern, open-source web application designed for People Operations, Total Rewards leaders, and HR Analytics teams. It empowers organizations to upload employee compensation ledgers, benchmark salaries against market data, detect statistical pay anomalies, and enforce compensation philosophy compliance—all in a private, client-side browser environment.

---

## 🚀 Key Features

- **📊 Executive Analytics Dashboard**: Real-time overview of total payroll allocation, average Compa-Ratio, equity breakdown, and departmental distributions.
- **⚠️ Statistical Outlier & Anomaly Detection**: Automated detection of underpaid and overpaid employees using Interquartile Range ($IQR$) statistical analysis and market compa-ratio thresholds. Includes inline salary editing for salary adjustment modeling.
- **📈 Market Benchmarking Engine**: Compare internal pay curves across job families and levels against market percentiles ($P_{25}, P_{50}, P_{75}, P_{90}$).
- **🛡️ Compensation Philosophy Validator**: Audit pay practices against defined corporate policies, identifying gender pay gap discrepancies and target percentile breaches.
- **📥 CSV Ledger Importer & Sample Data**: Drag-and-drop client-side CSV parsing with instant schema validation and pre-populated mock dataset for instant exploration.
- **🤖 AI Market Researcher**: Interactive intelligence assistant interface for job market compensation trends and pay band guidance.

---

## 🧮 Statistical & Compensation Models

### 1. Compa-Ratio
Compa-Ratio measures how an individual's base salary compares to the market midpoint ($P_{50}$) for their specific job family and level:

$$\text{Compa-Ratio} = \frac{\text{Base Salary}}{\text{Market Midpoint } (P_{50})}$$

- **Underpaid Warning ($< 80\%$)**: Employee base pay is significantly below market midpoint.
- **Target Range ($80\% - 120\%$)**: Healthy alignment with market competitive rates.
- **Overpaid Warning ($> 120\%$)**: Employee base pay exceeds upper target threshold.

### 2. Interquartile Range (IQR) Outlier Detection
For employee cohorts grouped by `jobFamily` and `level` ($N \ge 4$), the engine calculates statistical bounds:

$$\text{IQR} = Q_3 - Q_1$$

$$\text{Lower Bound} = Q_1 - 1.5 \times \text{IQR}$$

$$\text{Upper Bound} = Q_3 + 1.5 \times \text{IQR}$$

Salaries outside this range are flagged automatically with severity ratings (`danger` or `warning`).

---

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [TypeScript 6](https://www.typescriptlang.org/), [Vite 8](https://vitejs.dev/)
- **Visualizations**: [Recharts 3](https://recharts.org/)
- **Data Parsing**: [PapaParse 5](https://www.papaparse.com/)
- **Icons & Styling**: [Lucide React](https://lucide.dev/), Modern Vanilla CSS (Design Tokens & Glassmorphism)
- **Linter**: [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)

---

## 📁 Directory Structure

```text
compensation-benchmarker/
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared layout components (Header, Sidebar)
│   ├── features/           # Feature-based domain modules
│   │   ├── benchmark/      # Market benchmarking views & charts
│   │   ├── dashboard/      # Executive analytics dashboard
│   │   ├── import/         # CSV importer & Employee roster
│   │   ├── outliers/       # Statistical outlier detection engine
│   │   ├── philosophy/     # Compensation philosophy alignment rules
│   │   └── research/       # AI comp research tool
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript interfaces & types
│   ├── utils/              # Math engine (stats.ts) & sample data
│   ├── App.tsx             # Root application component
│   └── main.tsx            # Application entrypoint
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/compensation-benchmarker.git
   cd compensation-benchmarker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 📄 CSV Data Format

When importing custom employee data, your CSV file should include the following headers:

| Header Column | Data Type | Example | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `EMP-101` | Unique employee identifier |
| `name` | `string` | `Sarah Chen` | Employee full name |
| `title` | `string` | `Senior Software Engineer` | Job title |
| `jobFamily` | `string` | `Engineering` | Department / Job Family |
| `level` | `string` | `L5` | Career band / Level |
| `baseSalary` | `number` | `165000` | Annual base salary in USD |
| `equity` | `number` | `45000` | Annual equity value in USD |
| `bonus` | `number` | `20000` | Annual variable bonus in USD |
| `gender` | `string` | `Female` | Gender (for equity parity checks) |
| `tenureMonths` | `number` | `36` | Months at company |

*(Or click **"Load Sample Dataset"** inside the app to test with pre-filled mock data immediately).*

---

## 🤝 Contributing

Contributions are welcome! Whether you are fixing bugs, improving statistical models, adding charts, or enhancing UI/UX:

1. **Fork the Repository**
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your Changes**:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style & Quality

Run the linter prior to submitting pull requests:
```bash
npm run lint
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
