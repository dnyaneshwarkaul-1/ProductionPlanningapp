import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Code, 
  Copy, 
  Check, 
  Key, 
  Table, 
  Cpu, 
  Server, 
  ArrowDown, 
  FileCode
} from 'lucide-react';

interface SchemaTable {
  id: string;
  name: string;
  type: 'Dimension' | 'Fact' | 'Bridge' | 'Operational';
  description: string;
  primaryKey: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    description: string;
    isPk?: boolean;
    isFk?: boolean;
    fkTarget?: string;
  }[];
}

export const ArchitectureSchemaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'erd' | 'ddl'>('architecture');
  const [selectedTable, setSelectedTable] = useState<string>('fct_scheduled_jobs');
  const [copied, setCopied] = useState<boolean>(false);

  const schemaTables: SchemaTable[] = [
    {
      id: 'fct_scheduled_jobs',
      name: 'fct_scheduled_jobs',
      type: 'Fact',
      description: 'The core fact table storing the production schedule at Plant × SKU × Line × Month × Day × Shift level.',
      primaryKey: 'job_id',
      columns: [
        { name: 'job_id', type: 'VARCHAR(64)', nullable: false, description: 'Unique job execution identifier', isPk: true },
        { name: 'plant_id', type: 'VARCHAR(32)', nullable: false, description: 'The Estée Lauder Companies facility (EL-MELVILLE, EL-WHITMAN, EL-MARKHAM)', isFk: true, fkTarget: 'dim_plants.plant_id' },
        { name: 'line_id', type: 'VARCHAR(32)', nullable: false, description: 'Production line designation', isFk: true, fkTarget: 'dim_lines.line_id' },
        { name: 'machine_id', type: 'VARCHAR(32)', nullable: false, description: 'Primary rotary molder, filler, or cartoner', isFk: true, fkTarget: 'dim_machines.machine_id' },
        { name: 'sku_code', type: 'VARCHAR(32)', nullable: false, description: 'Finished good material code', isFk: true, fkTarget: 'dim_skus.sku_code' },
        { name: 'shade_id', type: 'VARCHAR(16)', nullable: false, description: 'Shade recipe (s1 to s9)', isFk: true, fkTarget: 'dim_shades.shade_id' },
        { name: 'pack_size', type: 'VARCHAR(24)', nullable: false, description: '3.5g Tube, 4.2g Stick, 50g Jar, 5kg Bulk' },
        { name: 'calendar_month', type: 'INTEGER', nullable: false, description: 'Planning month (1-12)' },
        { name: 'calendar_week', type: 'INTEGER', nullable: false, description: 'Planning week (1-52)' },
        { name: 'calendar_day', type: 'INTEGER', nullable: false, description: 'Day of week (1 to 7)' },
        { name: 'shift_id', type: 'VARCHAR(32)', nullable: false, description: 'Shift 1 Day, Shift 2 Swing, Shift 3 Graveyard' },
        { name: 'start_hour', type: 'NUMERIC(6,2)', nullable: false, description: 'Relative start hour within schedule horizon' },
        { name: 'end_hour', type: 'NUMERIC(6,2)', nullable: false, description: 'Relative end hour within horizon' },
        { name: 'duration_hours', type: 'NUMERIC(6,2)', nullable: false, description: 'Net job runtime in hours' },
        { name: 'planned_units', type: 'INTEGER', nullable: false, description: 'Scheduled production output in finished units' },
        { name: 'planned_kg', type: 'NUMERIC(10,2)', nullable: false, description: 'Scheduled batch weight in kg' },
        { name: 'is_changeover', type: 'BOOLEAN', nullable: false, description: 'Flag for pigment washdown cleanout' },
        { name: 'is_sanitation_break', type: 'BOOLEAN', nullable: false, description: 'Flag for mandatory FDA cGMP 36h cleanout' },
        { name: 'status', type: 'VARCHAR(24)', nullable: false, description: 'Status: PLANNED, IN_PROGRESS, COMPLETED, LOCKED' },
      ],
    },
    {
      id: 'dim_plants',
      name: 'dim_plants',
      type: 'Dimension',
      description: 'North American manufacturing facilities with compounding capacity ceilings.',
      primaryKey: 'plant_id',
      columns: [
        { name: 'plant_id', type: 'VARCHAR(32)', nullable: false, description: 'Plant code (NA-NEENAH, NA-ROSWELL, NA-BEECH)', isPk: true },
        { name: 'plant_name', type: 'VARCHAR(128)', nullable: false, description: 'Facility title' },
        { name: 'city', type: 'VARCHAR(64)', nullable: false, description: 'City location' },
        { name: 'state', type: 'VARCHAR(32)', nullable: false, description: 'US State (WI, GA, SC)' },
        { name: 'compounding_cap_kg_hr', type: 'NUMERIC(8,2)', nullable: false, description: 'Bulk wax compounding ceiling in kg/h' },
      ],
    },
    {
      id: 'dim_shades',
      name: 'dim_shades',
      type: 'Dimension',
      description: 'Cosmetic pigment shades, dye lake classifications, and active healthcare formulations.',
      primaryKey: 'shade_id',
      columns: [
        { name: 'shade_id', type: 'VARCHAR(16)', nullable: false, description: 'Shade code (s1 to s9)', isPk: true },
        { name: 'shade_name', type: 'VARCHAR(128)', nullable: false, description: 'Commercial shade description' },
        { name: 'product_type', type: 'VARCHAR(32)', nullable: false, description: 'Lipstick, Lip Balm, Medical Ointment' },
        { name: 'washdown_class', type: 'VARCHAR(32)', nullable: false, description: 'Standard Clean, Intense Dye Purge, Sterile CIP' },
        { name: 'color_hex', type: 'VARCHAR(16)', nullable: false, description: 'UI color hex representation' },
      ],
    },
    {
      id: 'fct_pigment_washdown',
      name: 'fct_pigment_washdown',
      type: 'Fact',
      description: 'Sequence-dependent transition matrix between origin and destination color shades.',
      primaryKey: 'from_shade_id, to_shade_id',
      columns: [
        { name: 'from_shade_id', type: 'VARCHAR(16)', nullable: false, description: 'Origin shade', isPk: true, isFk: true, fkTarget: 'dim_shades.shade_id' },
        { name: 'to_shade_id', type: 'VARCHAR(16)', nullable: false, description: 'Destination shade', isPk: true, isFk: true, fkTarget: 'dim_shades.shade_id' },
        { name: 'washdown_hours', type: 'NUMERIC(4,2)', nullable: false, description: 'Downtime required in hours' },
        { name: 'solvent_liters', type: 'NUMERIC(6,2)', nullable: false, description: 'Solvent flushing volume required' },
        { name: 'requires_color_swab', type: 'BOOLEAN', nullable: false, description: 'Requires QA spectrophotometer release' },
      ],
    },
  ];

  const currentTableData = schemaTables.find((t) => t.id === selectedTable) || schemaTables[0];

  const fullDdlSql = `-- ====================================================================
-- KIMBERLY-CLARK NORTH AMERICA - PERSONAL CARE & HEALTHCARE PPDS
-- Multi-Dimensional Schema: Plant x SKU x Line x Month x Day x Shift
-- Target Database: PostgreSQL 15+ / Google Cloud SQL
-- ====================================================================

CREATE SCHEMA IF NOT EXISTS kc_ppds_core;
SET search_path TO kc_ppds_core, public;

-- 1. North America Facilities
CREATE TABLE dim_plants (
    plant_id VARCHAR(32) PRIMARY KEY,
    plant_name VARCHAR(128) NOT NULL,
    city VARCHAR(64) NOT NULL,
    state VARCHAR(32) NOT NULL,
    country VARCHAR(32) NOT NULL DEFAULT 'United States',
    compounding_cap_kg_hr NUMERIC(8,2) NOT NULL DEFAULT 2850.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Line Master
CREATE TABLE dim_lines (
    line_id VARCHAR(32) PRIMARY KEY,
    plant_id VARCHAR(32) NOT NULL REFERENCES dim_plants(plant_id) ON DELETE CASCADE,
    line_name VARCHAR(128) NOT NULL,
    max_throughput_units_hr INTEGER NOT NULL DEFAULT 5200,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Stations & Molders
CREATE TABLE dim_machines (
    machine_id VARCHAR(32) PRIMARY KEY,
    line_id VARCHAR(32) NOT NULL REFERENCES dim_lines(line_id) ON DELETE CASCADE,
    machine_type VARCHAR(32) NOT NULL, -- ROTARY_MOLDER | HOT_POUR_FILLER | CARTONER
    machine_name VARCHAR(128) NOT NULL,
    max_speed_units_hr INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Shade & Formulation Hierarchy
CREATE TABLE dim_shades (
    shade_id VARCHAR(16) PRIMARY KEY, -- s1 to s9
    shade_name VARCHAR(128) NOT NULL,
    product_type VARCHAR(32) NOT NULL,
    washdown_class VARCHAR(32) NOT NULL,
    color_hex VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Finished Goods Master
CREATE TABLE dim_skus (
    sku_code VARCHAR(32) PRIMARY KEY,
    short_description VARCHAR(256) NOT NULL,
    brand VARCHAR(64) NOT NULL,
    shade_id VARCHAR(16) NOT NULL REFERENCES dim_shades(shade_id),
    pack_size VARCHAR(24) NOT NULL,
    net_weight_grams NUMERIC(6,2) NOT NULL,
    units_per_shipper_case INTEGER NOT NULL,
    wax_to_pigment_ratio NUMERIC(4,2) NOT NULL DEFAULT 0.18,
    kettle_batch_kg NUMERIC(8,2) NOT NULL DEFAULT 850.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Sequence-Dependent Pigment Washdown Matrix
CREATE TABLE fct_pigment_washdown (
    from_shade_id VARCHAR(16) NOT NULL REFERENCES dim_shades(shade_id),
    to_shade_id VARCHAR(16) NOT NULL REFERENCES dim_shades(shade_id),
    washdown_hours NUMERIC(4,2) NOT NULL,
    solvent_liters NUMERIC(6,2) NOT NULL,
    requires_color_swab BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (from_shade_id, to_shade_id)
);

-- 7. Scheduled Production Fact
CREATE TABLE fct_scheduled_jobs (
    job_id VARCHAR(64) PRIMARY KEY,
    plant_id VARCHAR(32) NOT NULL REFERENCES dim_plants(plant_id),
    line_id VARCHAR(32) NOT NULL REFERENCES dim_lines(line_id),
    machine_id VARCHAR(32) NOT NULL REFERENCES dim_machines(machine_id),
    sku_code VARCHAR(32) NOT NULL REFERENCES dim_skus(sku_code),
    shade_id VARCHAR(16) NOT NULL REFERENCES dim_shades(shade_id),
    pack_size VARCHAR(24) NOT NULL,
    calendar_month INTEGER NOT NULL,
    calendar_week INTEGER NOT NULL,
    calendar_day INTEGER NOT NULL CHECK (calendar_day BETWEEN 1 AND 7),
    shift_id VARCHAR(32) NOT NULL,
    start_hour NUMERIC(6,2) NOT NULL,
    end_hour NUMERIC(6,2) NOT NULL,
    duration_hours NUMERIC(6,2) NOT NULL,
    planned_units INTEGER NOT NULL,
    planned_kg NUMERIC(10,2) NOT NULL,
    is_changeover BOOLEAN NOT NULL DEFAULT FALSE,
    is_sanitation_break BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(24) NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- High-performance multi-dimensional index
CREATE INDEX idx_kc_jobs_plant_week ON fct_scheduled_jobs (plant_id, line_id, calendar_week);
CREATE INDEX idx_kc_jobs_day_shift ON fct_scheduled_jobs (calendar_day, shift_id);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullDdlSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#001E38] border border-[#C5A059]/30 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>The Estée Lauder Companies Architecture</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Database Schema &amp; Integration Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Relational PostgreSQL schema supporting the multi-dimensional <strong className="text-slate-900">Plant × SKU × Line × Month × Day × Shift</strong> scheduling hierarchy for Personal Care and Healthcare manufacturing.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'architecture' ? 'bg-[#002B66] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blueprint
          </button>
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'erd' ? 'bg-[#002B66] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ERD &amp; Tables
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'ddl' ? 'bg-[#002B66] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SQL DDL Code
          </button>
        </div>
      </div>

      {/* Blueprint */}
      {activeTab === 'architecture' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">The Estée Lauder Companies 5-Tier Data Integration Flow</h2>
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tier 1 • Demand Ingestion</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">SAP S/4HANA &amp; Retail Customer Forecast (Kinaxis)</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Transfers weekly orders from Target, Walmart, CVS, and hospital health systems.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-sky-50/50">
              <span className="text-[10px] font-bold text-sky-800 uppercase">Tier 2 • Constraint &amp; Capacity Validation</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">Constraint Studio &amp; RCCP Engine</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Enforces rotary molder 5,200 units/h limit and mandatory FDA cGMP 36h cleanout cycles.</p>
            </div>
            <div className="p-4 rounded-xl border-2 border-[#002B66] bg-blue-50/60 shadow-xs">
              <span className="text-[10px] font-bold text-[#002B66] uppercase">Tier 3 • Gurobi 11.0 MILP Optimization Engine</span>
              <p className="text-xs font-bold text-[#002B66] mt-0.5">Multi-Scenario TSP Solver &amp; Heuristics</p>
              <p className="text-[11px] text-slate-700 mt-0.5">Solves spectral color sequence, groups dark pigments, and calculates side-by-side trade-offs.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tier 4 • Relational Multi-Dimensional Storage</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">PostgreSQL 15 / Cloud SQL</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Persists schedules, scenario revisions, and stage-gate approval audit records.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Tier 5 • Shop-Floor Execution &amp; Feedback</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">Wonderware MES &amp; Digital Shift Handovers</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Dispatches job cards to Melville, Whitman, and Markham operators.</p>
            </div>
          </div>
        </div>
      )}

      {/* ERD View */}
      {activeTab === 'erd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Entity Catalog ({schemaTables.length} Tables)
            </h3>
            {schemaTables.map((tbl) => {
              const isSelected = selectedTable === tbl.id;
              return (
                <button
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    isSelected ? 'border-[#002B66] bg-sky-50 text-[#002B66] font-bold shadow-xs' : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono">{tbl.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100">{tbl.type}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <h3 className="text-base font-bold font-mono text-[#002B66]">{currentTableData.name}</h3>
              <span className="text-xs font-mono font-bold text-slate-500">PK: {currentTableData.primaryKey}</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">{currentTableData.description}</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-mono">
                <thead className="bg-slate-50 font-sans">
                  <tr>
                    <th className="py-2 px-3 font-semibold text-slate-700">Column Name</th>
                    <th className="py-2 px-3 font-semibold text-slate-700">Type</th>
                    <th className="py-2 px-3 font-semibold text-slate-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {currentTableData.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{col.name}</td>
                      <td className="py-2 px-3 text-[#002B66] font-semibold">{col.type}</td>
                      <td className="py-2 px-3 font-sans text-slate-600">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DDL */}
      {activeTab === 'ddl' && (
        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <span className="font-mono text-xs text-sky-300 font-bold">kc_ppds_schema.sql (PostgreSQL 15+)</span>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#002B66] hover:bg-[#001D45] text-white rounded-md text-xs font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-lg max-h-[500px] leading-relaxed">
            {fullDdlSql}
          </pre>
        </div>
      )}
    </div>
  );
};
