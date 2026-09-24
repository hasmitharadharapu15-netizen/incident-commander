# Incident Command Center (SOC / NOC)

A production-grade, interactive Security Operations Center (SOC) and Network Operations Center (NOC) Incident Monitoring and Response Dashboard built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Recharts**, and **Lucide React**.

---

## Key Features

1. **Calculated Real-Time Metrics & Telemetry**:
   - Total Incidents (initial 10)
   - Critical Incidents (initial 4)
   - High Severity Incidents (initial 3)
   - Active Incidents (initial 3)
   - Investigating Incidents (initial 4)
   - Contained Incidents (initial 1)
   - **SOC Telemetry Banner**: Real-time **30 EPS** (Events Per Second log stream) and **5,000 Monitored Server Nodes** across distributed data centers.

2. **Full Incident Table & Filtering**:
   - Columns: Incident ID, Timestamp, Incident Type, Category, Severity, Location, Affected System, Status, Confidence, and Actions.
   - Comprehensive multi-vector search (searches ID, location, system, category, IP, user, description).
   - Filter by Severity (`critical`, `high`, `medium`, `low`). Filtering for `critical` returns `INC002`, `INC004`, `INC006`, and `INC010`.
   - Filter by Status (`active`, `investigating`, `mitigating`, `contained`, `resolved`, `emergency`). Filtering for `active` returns `INC002`, `INC005`, and `INC009`.
   - Searching for `Bengaluru` returns `INC002` and `INC010`.
   - Sort by Timestamp (ascending / descending) and Severity.
   - One-click Clear Filters button.

3. **Prominent Critical Alerts Priority Stream**:
   - Automatically surfaces all critical and emergency alerts, sorted by newest timestamp.
   - Visual pulsing indicators for immediate triage.

4. **Transparent Rule-Based Risk Analysis (`analyzeIncident`)**:
   - Deterministic, explainable heuristics engine (strictly labeled "Rule-Based Risk Analysis", not a black-box machine learning model).
   - Generates risk score (0–100), priority tier, granular factor-by-factor score impacts, and concrete operational response recommendations.
   - Opening `INC010` shows fire alarm category, Bengaluru data center, 78.5°C temperature, `FIRE-SENSOR-17` sensor ID, 99% confidence, and emergency evacuation & gaseous suppression protocols.

5. **Operational Lifecycle & Working Status Controls**:
   - Lifecycle progression: `Detected` → `Investigating` → `Mitigating` → `Contained` → `Resolved`.
   - Working status action buttons persist changes directly to `localStorage`.
   - Changing `INC010` status instantly updates all tables, charts, and metric counters.

6. **Interactive Recharts Visualizations**:
   - Severity Distribution (Donut Chart)
   - Incidents by Domain Type (Bar Chart)
   - Incidents by Location (Bar Chart)
   - Incident Timeline & Risk Velocity (Area Chart)
   - Lifecycle Status Distribution (Horizontal Bar Chart)
   - Charts automatically re-render when data or statuses change.

7. **Simulate Incident Engine**:
   - One-click realistic incident generation with unique ID (`INC011`, `INC012`, etc.), current timestamp, realistic telemetry, toast alerts, and persistence.

8. **Regional Locations Hub**:
   - Data center cards across Bengaluru, Hyderabad, Chennai, Delhi, Pune, Mumbai, Kolkata, Noida, and Ahmedabad.
   - Interactive click-to-filter.

---

## Quick Start & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will be accessible at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm run preview
```

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── CriticalAlerts.tsx      # Priority critical incident stream
│   │   ├── Header.tsx              # SOC header, DEFCON level, EPS/Server ticker
│   │   ├── IncidentCharts.tsx      # Recharts visualizations
│   │   ├── IncidentDetailModal.tsx # Side-panel/modal with Rule-Based Risk Analysis
│   │   ├── IncidentTable.tsx       # Data table with multi-attribute filtering & search
│   │   ├── LocationsOverview.tsx   # Regional data center hub breakdown
│   │   ├── MetricCards.tsx         # Dynamically calculated SOC counters
│   │   ├── TelemetryBar.tsx        # 30 EPS & 5000 servers telemetry strip
│   │   └── ToastContainer.tsx      # HUD toast alerts
│   ├── data/
│   │   └── incidents.json          # Initial 10 incidents source of truth
│   ├── types/
│   │   └── incident.ts             # TypeScript definitions
│   ├── utils/
│   │   ├── formatters.ts           # Badges, dates, labels
│   │   ├── incidentSimulator.ts    # Synthetic incident generation engine
│   │   ├── riskAnalyzer.ts         # Deterministic rule-based risk evaluator
│   │   └── storage.ts              # LocalStorage persistence & migration
│   ├── App.tsx                     # Top-level state and coordinator
│   ├── index.css                   # Tailwind v4 styles
│   └── main.tsx                    # React DOM entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
