import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  FileSpreadsheet, 
  Calendar,
  AlertTriangle,
  Factory,
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';
import { NavTab } from './Navbar';
import { EsteeLauderLogo } from './EsteeLauderLogo';

interface ClientWalkthroughProps {
  onNavigate: (tab: NavTab) => void;
}

export const ClientWalkthrough: React.FC<ClientWalkthroughProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const workflowSteps = [
    {
      num: 1,
      title: 'North America Demand & Retail Orders',
      subtitle: 'From SAP APO & Retail EDI',
      description: 'Weekly Net Requirements across North American distribution centers (Target, Walmart, CVS, Hospital Health Systems). Ingests lipstick tubes (3.5g, 4.2g), hot-pour treatment sticks, and medical clinical jars (10g, 50g, 5kg bulk).',
      badge: 'Demand Input',
      metric: '75,000 to 142,000 Units / Shade',
    },
    {
      num: 2,
      title: 'Engineering & FDA cGMP Constraints',
      subtitle: 'Line & Compounding Enforcements',
      description: 'Enforces hard constraints: max rotary molder speed (5,200 units/h), compounding kettle temperature ceiling (125°C), and mandatory FDA Title 21 cGMP 36-hour cleanout flushes.',
      badge: 'Hard Boundaries',
      metric: '5,200 Units/h Molder Ceiling',
    },
    {
      num: 3,
      title: 'Sequence-Dependent Pigment Optimization',
      subtitle: 'Gurobi MILP Traveling Salesperson',
      description: 'Finds optimal spectral color routing (Ruby Red → Burgundy → Berry Plum → Cherry Gloss → Coral → Mauve → Clear Barrier). Slashes solvent flush washdown from 18.0h to 7.5h per week.',
      badge: 'Mathematical Solver',
      metric: '-42% Cleanout Solvent Scrap',
    },
    {
      num: 4,
      title: 'Multi-Scenario Trade-Off Engine',
      subtitle: 'Side-by-Side Scenario Planning',
      description: 'Enables side-by-side evaluation of "Minimum Changeover" (solvent conservation) vs "Maximum Throughput" (99.8% customer OTIF) vs "Balanced Cost" to select the optimal operating policy.',
      badge: 'What-If Comparison',
      metric: '4 Pre-Solved Scenarios',
    },
    {
      num: 5,
      title: 'Shop-Floor MES Dispatch & Shift Handover',
      subtitle: 'Shifts 1, 2, 3 & Operator Governance',
      description: 'Dispatches shift job cards to Melville, Whitman, and Markham shop floors. Enforces spectrophotometer color Delta-E release checks and microbial bioburden clearance.',
      badge: 'Shop-Floor Execution',
      metric: '3 Prestige Facilities',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner / Executive Pitch */}
      <div className="bg-gradient-to-r from-[#002B66] via-[#003882] to-[#001D45] text-white rounded-xl p-6 sm:p-8 shadow-md">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20 shadow-xs">
              <EsteeLauderLogo variant="full" theme="light" size="md" showMonogram={true} />
            </div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-semibold border border-white/15">
              <Factory className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Global Prestige Beauty &amp; Luxury Operations</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            Production Planning &amp; Detailed Scheduling (PPDS) Platform
          </h1>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl mb-6">
            An advanced mathematical optimization and multi-scenario scheduling engine built for high-speed cosmetics and healthcare packaging lines. Manages <strong className="text-white">Plant × SKU × Line × Month × Day × Shift</strong> sequencing to minimize solvent washdowns, comply with FDA cGMP 36-hour sanitation mandates, and maximize customer On-Time In-Full (OTIF) delivery.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('demand_tracking')}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Demand vs Production KPIs</span>
            </button>
            <button
              onClick={() => onNavigate('cockpit')}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#00A3E0] hover:bg-[#0082CA] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Scheduling Cockpit &amp; Gantt</span>
            </button>
            <button
              onClick={() => onNavigate('constraints')}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Constraint Studio</span>
            </button>
            <button
              onClick={() => onNavigate('scenarios')}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>What-If Scenarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 3 Core Pillars: What, How, Why */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* WHAT Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-[#002B66] flex items-center justify-center font-bold text-sm mb-4">
              WHAT
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">What Does PPDS Solve?</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Eliminates the complexity of scheduling multi-shade cosmetics and healthcare batches:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 mb-4">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Multi-Dimensional Control:</strong> Schedules down to Plant × SKU × Line × Month × Day × Shift.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Compounding &amp; Molding Sync:</strong> Balances 850kg melting kettles with 5,200 units/h rotary molders.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">FDA cGMP 36h Cleanouts:</strong> Enforces mandatory bioburden flushes without starving secondary cartoners.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Side-by-Side Comparison:</strong> Simultaneously compares Minimum Changeover vs Maximum Throughput.</span>
              </li>
            </ul>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#002B66]">
            <span>Automated mathematical optimization</span>
          </div>
        </div>

        {/* HOW Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0051A5] flex items-center justify-center font-bold text-sm mb-4">
              HOW
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">How Does the Engine Optimize?</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Through a dual-phase Gurobi MILP solver combined with customizable business rules:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 mb-4">
              <li className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Traveling Salesperson Formulation:</strong> Discovers optimal shade progression (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">Ruby→Burgundy→Mauve</code>).</span>
              </li>
              <li className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Configurable Constraint Engine:</strong> Edit speed limits, temperature thresholds, and freeze windows on the fly.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">What-If Stress Testing:</strong> Injects demand surges or machine downtime before locking schedules.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Formal Approval Workflow:</strong> Stage-gate governance from Draft to MES lock.</span>
              </li>
            </ul>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0051A5]">
            <span>Gurobi 11.0 Certified MILP Engine</span>
          </div>
        </div>

        {/* WHY Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm mb-4">
              WHY
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Why It Delivers High ROI</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Documented business improvements across The Estée Lauder Companies pilot manufacturing lines:
            </p>
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-900">Solvent Scrap &amp; Waste</span>
                  <span className="text-sm font-extrabold text-emerald-700">-42% Waste</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">Saves $15.6k/week in food-grade solvent flushes</p>
              </div>

              <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#002B66]">Customer OTIF Service Level</span>
                  <span className="text-sm font-extrabold text-[#002B66]">99.8% OTIF</span>
                </div>
                <p className="text-[11px] text-sky-900 mt-0.5">Zero backorders on top retail accounts</p>
              </div>

              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-800">Annual Facility Value</span>
                  <span className="text-sm font-extrabold text-[#002B66]">~$2.1M / plant</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Scrap reduction, OEE gains, and zero overtime</p>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-700">
            <span>Payback in &lt; 90 days</span>
          </div>
        </div>

      </div>

      {/* 5-Step Architecture Pipeline */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">End-to-End Scheduling Pipeline Architecture</h2>
            <p className="text-xs text-slate-500">Click on any stage below to inspect data transformations and mathematical rules.</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            Stage {activeStep} of 5
          </span>
        </div>

        {/* Pipeline Stepper Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-6">
          {workflowSteps.map((step) => {
            const isSelected = activeStep === step.num;
            return (
              <button
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'border-[#002B66] bg-sky-50 ring-2 ring-[#002B66]/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isSelected ? 'bg-[#002B66] text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.num}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">{step.badge}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">{step.title}</p>
                <p className="text-[10px] text-slate-500 truncate">{step.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Detailed Stage Content Card */}
        {(() => {
          const current = workflowSteps[activeStep - 1];
          return (
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-bold text-[#002B66] uppercase tracking-wider">{current.badge}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-600">{current.subtitle}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{current.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{current.description}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 min-w-[220px] shadow-xs">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Benchmark Parameter</p>
                  <p className="text-lg font-extrabold text-[#002B66] mt-1">{current.metric}</p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 inline" />
                    <span>Validated against Melville Plant Lines</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Quick Navigation to Key Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('cockpit')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#002B66] text-left transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">Interactive Gantt</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#002B66] group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Compare Scenarios Side-by-Side</h4>
          <p className="text-xs text-slate-500 mt-1">Directly compare Minimum Changeover vs Maximum Throughput in real time.</p>
        </button>

        <button
          onClick={() => onNavigate('constraints')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#002B66] text-left transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Rule Builder</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#002B66] group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Constraint Studio</h4>
          <p className="text-xs text-slate-500 mt-1">Inspect, edit, toggle, or add custom hard, business, and soft constraints.</p>
        </button>

        <button
          onClick={() => onNavigate('scenarios')}
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-[#002B66] text-left transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Governance</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#002B66] group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">What-If &amp; Approval Workflow</h4>
          <p className="text-xs text-slate-500 mt-1">Stress-test demand surges and advance plans through stage-gate approvals.</p>
        </button>
      </div>

    </div>
  );
};
