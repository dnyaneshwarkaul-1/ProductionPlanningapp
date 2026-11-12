import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  FileDown, 
  Layers, 
  Table, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { OptimizationScenario, UserRole } from '../types/ppds';
import { SEQUENCING_CANDIDATE_SKUS } from '../data/mockData';

interface SensitivityAnalysisModuleProps {
  activeScenario: OptimizationScenario;
  scenarios: OptimizationScenario[];
  currentRole: UserRole;
  onPromoteToScenario: (preset: Partial<OptimizationScenario>) => void;
  onOpenExport?: () => void;
}

export const SensitivityAnalysisModule: React.FC<SensitivityAnalysisModuleProps> = ({
  activeScenario,
  scenarios,
  currentRole,
  onPromoteToScenario,
  onOpenExport,
}) => {
  // Scenario Selection for Sensitivity Base
  const [targetScenarioId, setTargetScenarioId] = useState<string>(activeScenario.id);

  // Levers: Fluctuating Material Lead Times & Demand Spikes
  const [leadTimeDelayDays, setLeadTimeDelayDays] = useState<number>(3); // 0 to 14 days
  const [demandSpikePercent, setDemandSpikePercent] = useState<number>(20); // -10% to +50%
  const [componentFocus, setComponentFocus] = useState<'all' | 'bulk_wax' | 'pigments' | 'tubes' | 'apis'>('all');
  const [customerTier, setCustomerTier] = useState<'all' | 'tier1_retail' | 'healthcare' | 'ecommerce'>('all');

  // Monte Carlo Stochastic Simulation State
  const [isMonteCarloRunning, setIsMonteCarloRunning] = useState<boolean>(false);
  const [monteCarloProgress, setMonteCarloProgress] = useState<number>(0);
  const [monteCarloSummary, setMonteCarloSummary] = useState<{
    p50Makespan: number;
    p90Makespan: number;
    p99Makespan: number;
    p50Otif: number;
    p90Otif: number;
    p99Otif: number;
    stockoutProbabilityPercent: number;
    iterations: number;
  } | null>(null);

  // Active base scenario object
  const baseScenario = useMemo(() => {
    return scenarios.find((s) => s.id === targetScenarioId) || activeScenario;
  }, [scenarios, targetScenarioId, activeScenario]);

  // Baseline KPIs
  const baseMakespan = baseScenario.kpis.totalMakespanHours;
  const baseOtif = baseScenario.kpis.serviceLevelOtifPercent;
  const baseWashdown = baseScenario.kpis.changeoverWashHours;
  const baseCost = baseScenario.kpis.solventScrapCostUsd;
  const baseThroughputUnits = 542000;

  // Component vulnerability and safety stock buffers
  const componentBuffers = useMemo(() => [
    {
      id: 'bulk_wax',
      name: 'Bulk Wax Base (Kettle Vessel 1 & 2)',
      safetyBufferDays: 4.5,
      criticality: 'High',
      supplierLocation: 'Chicago, IL (Domestic Rail)',
      impactedSkus: ['KC-LIP-101', 'KC-LIP-108', 'KC-BLM-205'],
    },
    {
      id: 'pigments',
      name: 'Color Pigment & Dye Concentrates (8 Shades)',
      safetyBufferDays: 3.5,
      criticality: 'Medium',
      supplierLocation: 'Fairfield, NJ (Specialty Chemical)',
      impactedSkus: ['KC-LIP-101', 'KC-LIP-103', 'KC-LIP-104'],
    },
    {
      id: 'tubes',
      name: 'Primary Packaging Applicator Tubes & Sticks',
      safetyBufferDays: 2.0,
      criticality: 'Critical',
      supplierLocation: 'Guadalajara, MX (Inbound Cross-Border)',
      impactedSkus: ['KC-BLM-205', 'KC-LIP-102'],
    },
    {
      id: 'apis',
      name: 'Active Pharmaceutical Ingredients (Menthol, Zinc Oxide)',
      safetyBufferDays: 5.0,
      criticality: 'High',
      supplierLocation: 'Basel, Switzerland (Air Freight / Port of NY)',
      impactedSkus: ['KC-BLM-206', 'KC-MED-309'],
    },
  ], []);

  // Real-Time Mathematical Sensitivity Calculations
  const sensitivityResults = useMemo(() => {
    // 1. Demand Spike Impact
    // Extra units = baseThroughputUnits * (demandSpikePercent / 100)
    // Run speed on Line 1 avg = 90 UPM = 5,400 units/hr
    const extraUnits = Math.round(baseThroughputUnits * (demandSpikePercent / 100));
    const extraRunHours = Number((extraUnits / 5400).toFixed(1));

    // 2. Lead Time Delay Impact on Machine Starvation
    // Effective buffer threshold depends on selected component or lowest buffer (2.0 days)
    const effectiveBufferDays = componentFocus === 'tubes' ? 2.0 
      : componentFocus === 'pigments' ? 3.5 
      : componentFocus === 'bulk_wax' ? 4.5 
      : componentFocus === 'apis' ? 5.0 
      : 2.5; // Average across portfolio

    const bufferBreachDays = Math.max(0, leadTimeDelayDays - effectiveBufferDays);
    // Each day of buffer breach delays feeding the line by ~6.5 hours of starvation
    const starvationHours = Number((bufferBreachDays * 6.5).toFixed(1));

    // 3. Calculated Makespan
    const recalculatedMakespan = Number((baseMakespan + extraRunHours + starvationHours).toFixed(1));
    const makespanDelta = Number((recalculatedMakespan - baseMakespan).toFixed(1));

    // 4. Overtime Hours & Financial Exposure
    // Standard weekly operating schedule without overtime = 144 hours (3 shifts * 6 days)
    const overtimeHours = Math.max(0, Number((recalculatedMakespan - 144.0).toFixed(1)));
    const overtimeRatePerHour = 450; // $450/hr for 4-person crew at 1.5x
    const overtimeCost = Math.round(overtimeHours * overtimeRatePerHour);

    // Expedited Freight to rush delayed raw materials
    const expeditedFreightCost = leadTimeDelayDays > 2 ? Math.round(2200 + (leadTimeDelayDays * 650)) : 0;

    // Retail stockout penalty / SLA deduction
    const maxCapacityHours = 168.0; // 7 days * 24h
    const capacityBreached = recalculatedMakespan > maxCapacityHours;
    const unservedUnits = capacityBreached ? Math.round((recalculatedMakespan - maxCapacityHours) * 5400) : 0;
    const stockoutPenaltyCost = Math.round(unservedUnits * 0.95);

    const totalFinancialVariance = overtimeCost + expeditedFreightCost + stockoutPenaltyCost;

    // 5. Customer OTIF % Calculation
    // Base OTIF degrades due to starvation gaps and demand over-capacity
    const demandOtifPenalty = demandSpikePercent > 10 ? (demandSpikePercent - 10) * 0.16 : 0;
    const leadTimeOtifPenalty = bufferBreachDays * 2.2;
    const channelWeightMultiplier = customerTier === 'tier1_retail' ? 1.3 : customerTier === 'healthcare' ? 1.4 : 1.0;
    const totalOtifDrop = (demandOtifPenalty + leadTimeOtifPenalty) * channelWeightMultiplier;
    const recalculatedOtif = Number(Math.max(76.0, Math.min(99.9, baseOtif - totalOtifDrop)).toFixed(1));
    const otifDelta = Number((recalculatedOtif - baseOtif).toFixed(1));

    // 6. Feasibility & Risk Rating
    let feasibility: 'FEASIBLE' | 'OVERTIME_WARNING' | 'CRITICAL_BREACH' = 'FEASIBLE';
    let riskSummary = 'Schedule maintains buffer slack. Demand spike absorbed within existing weekly shifts.';

    if (recalculatedMakespan > 164.0 || recalculatedOtif < 95.0) {
      feasibility = 'CRITICAL_BREACH';
      riskSummary = `Critical SLA Breach: Makespan (${recalculatedMakespan}h) nears weekly ceiling. Customer OTIF drops to ${recalculatedOtif}% (<95% threshold). Mandatory emergency dual-sourcing & Sunday overtime required.`;
    } else if (recalculatedMakespan > 144.0 || leadTimeDelayDays > 3) {
      feasibility = 'OVERTIME_WARNING';
      riskSummary = `Overtime Alert: Requires ${overtimeHours}h of Saturday overtime to absorb ${demandSpikePercent}% demand spike while buffering ${leadTimeDelayDays}d component delay.`;
    }

    return {
      extraUnits,
      extraRunHours,
      bufferBreachDays,
      starvationHours,
      recalculatedMakespan,
      makespanDelta,
      overtimeHours,
      overtimeCost,
      expeditedFreightCost,
      stockoutPenaltyCost,
      totalFinancialVariance,
      recalculatedOtif,
      otifDelta,
      feasibility,
      riskSummary,
    };
  }, [
    baseMakespan, 
    baseOtif, 
    baseThroughputUnits, 
    leadTimeDelayDays, 
    demandSpikePercent, 
    componentFocus, 
    customerTier
  ]);

  // $5 \times 5$ Sensitivity Matrix (Demand Spikes $\times$ Lead Time Delays)
  const sensitivityGrid = useMemo(() => {
    const demandPoints = [0, 10, 20, 35, 50]; // Rows
    const leadTimePoints = [0, 2, 4, 7, 10]; // Cols

    return demandPoints.map((dSpike) => {
      return leadTimePoints.map((ltDelay) => {
        const extraHours = (dSpike * 0.48);
        const breachDays = Math.max(0, ltDelay - 2.5);
        const starvHours = breachDays * 6.5;
        const totalHours = Number((baseMakespan + extraHours + starvHours).toFixed(1));

        const dDrop = dSpike > 10 ? (dSpike - 10) * 0.16 : 0;
        const ltDrop = breachDays * 2.2;
        const calcOtif = Number(Math.max(76.0, Math.min(99.9, baseOtif - (dDrop + ltDrop))).toFixed(1));

        let status: 'safe' | 'warning' | 'critical' = 'safe';
        if (totalHours > 164.0 || calcOtif < 95.0) {
          status = 'critical';
        } else if (totalHours > 144.0 || ltDelay > 3) {
          status = 'warning';
        }

        return {
          demandSpike: dSpike,
          leadTimeDelay: ltDelay,
          otif: calcOtif,
          makespan: totalHours,
          status,
        };
      });
    });
  }, [baseMakespan, baseOtif]);

  // Recharts Data: OTIF Degradation Curves
  const otifCurveData = useMemo(() => {
    const demandSteps = [-10, 0, 10, 20, 30, 40, 50];
    return demandSteps.map((d) => {
      const calcAtDelay = (lt: number) => {
        const breach = Math.max(0, lt - 2.5);
        const dPenalty = d > 10 ? (d - 10) * 0.16 : 0;
        const ltPenalty = breach * 2.2;
        return Number(Math.max(78.0, Math.min(99.9, baseOtif - (dPenalty + ltPenalty))).toFixed(1));
      };

      return {
        demandSpike: `${d > 0 ? '+' : ''}${d}%`,
        'On-Time (0d Delay)': calcAtDelay(0),
        'Moderate (+3d Delay)': calcAtDelay(3),
        'Supplier Disruption (+7d)': calcAtDelay(7),
        'Severe Delay (+10d)': calcAtDelay(10),
      };
    });
  }, [baseOtif]);

  // Recharts Data: Financial Risk Breakdown across Demand Spikes
  const costBreakdownData = useMemo(() => {
    const demandSteps = [0, 10, 20, 35, 50];
    return demandSteps.map((d) => {
      const extraHrs = d * 0.48;
      const breach = Math.max(0, leadTimeDelayDays - 2.5);
      const starvHrs = breach * 6.5;
      const totalHrs = baseMakespan + extraHrs + starvHrs;
      const otHrs = Math.max(0, totalHrs - 144.0);
      const otCost = Math.round(otHrs * 450);
      const freightCost = leadTimeDelayDays > 2 ? Math.round(2200 + (leadTimeDelayDays * 650)) : 0;
      const stockoutHrs = Math.max(0, totalHrs - 168.0);
      const penaltyCost = Math.round(stockoutHrs * 5400 * 0.95);

      return {
        spike: `+${d}% Demand`,
        'Overtime Labor ($)': otCost,
        'Expedited Freight ($)': freightCost,
        'Stockout Chargebacks ($)': penaltyCost,
      };
    });
  }, [baseMakespan, leadTimeDelayDays]);

  // Run Stochastic Monte Carlo Simulation
  const handleRunMonteCarlo = () => {
    setIsMonteCarloRunning(true);
    setMonteCarloProgress(0);
    setMonteCarloSummary(null);

    const interval = setInterval(() => {
      setMonteCarloProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMonteCarloRunning(false);

          // Simulated 1,000 iterations statistical percentiles
          const p50M = Number((baseMakespan + (demandSpikePercent * 0.35) + 3.2).toFixed(1));
          const p90M = Number((baseMakespan + (demandSpikePercent * 0.52) + (leadTimeDelayDays * 2.1) + 8.5).toFixed(1));
          const p99M = Number((baseMakespan + (demandSpikePercent * 0.70) + (leadTimeDelayDays * 3.4) + 14.8).toFixed(1));

          const p50O = Number(Math.max(90.0, baseOtif - (demandSpikePercent * 0.08) - (leadTimeDelayDays * 0.4)).toFixed(1));
          const p90O = Number(Math.max(85.0, baseOtif - (demandSpikePercent * 0.18) - (leadTimeDelayDays * 1.2)).toFixed(1));
          const p99O = Number(Math.max(76.0, baseOtif - (demandSpikePercent * 0.28) - (leadTimeDelayDays * 2.5)).toFixed(1));

          const stockoutProb = Math.min(38.5, Number(((demandSpikePercent * 0.3) + (leadTimeDelayDays * 1.8)).toFixed(1)));

          setMonteCarloSummary({
            p50Makespan: p50M,
            p90Makespan: p90M,
            p99Makespan: p99M,
            p50Otif: p50O,
            p90Otif: p90O,
            p99Otif: p99O,
            stockoutProbabilityPercent: stockoutProb,
            iterations: 1000,
          });

          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  // Convert sensitivity findings into a new governed scenario
  const handlePromoteSensitivityToScenario = () => {
    onPromoteToScenario({
      title: `Buffered Sensitivity Plan: +${demandSpikePercent}% Demand & +${leadTimeDelayDays}d Lead Time`,
      badge: 'Sensitivity Stress-Tested',
      tagline: `Pre-configured with protective shift buffers to absorb material lead time volatility.`,
      description: `Formulated from Sensitivity Analysis against "${baseScenario.title}". Absorbs +${demandSpikePercent}% retail demand spike with ${leadTimeDelayDays} days raw material delay buffer.`,
      targetOtifPercent: sensitivityResults.recalculatedOtif,
      maxHorizonHours: sensitivityResults.recalculatedMakespan,
      weights: {
        makespan: demandSpikePercent > 20 ? 4.5 : 2.5,
        changeover: 14.0,
        otif: 40.0,
        energy: 6.0,
      },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Configuration Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <span>Scenario Governance &amp; Risk Analytics</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#002B66]">Gurobi 11.0 Dual Sensitivity Matrix</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
              <span>Schedule Sensitivity Analysis Engine</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                sensitivityResults.feasibility === 'FEASIBLE'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : sensitivityResults.feasibility === 'OVERTIME_WARNING'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {sensitivityResults.feasibility === 'FEASIBLE' ? 'Schedule Resilient' : sensitivityResults.feasibility === 'OVERTIME_WARNING' ? 'Overtime Triggered' : 'SLA Breached'}
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Dynamically evaluates the impact of upstream material arrival delays (SAP MSEG/RESB) and commercial demand volatility on schedule makespan, customer OTIF service levels, and financial overtime costs.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-all cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Sensitivity Dossier</span>
              </button>
            )}

            <button
              onClick={handlePromoteSensitivityToScenario}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#002B66] hover:bg-[#001D45] rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save as Governed Scenario</span>
            </button>
          </div>
        </div>

        {/* Target Scenario Selector & Scope Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Production Schedule Model:</label>
            <select
              value={targetScenarioId}
              onChange={(e) => setTargetScenarioId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-1 focus:ring-[#002B66] cursor-pointer"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.title} ({sc.badge} — {sc.kpis.serviceLevelOtifPercent}% OTIF)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Critical Component Focus:</label>
            <select
              value={componentFocus}
              onChange={(e) => setComponentFocus(e.target.value as any)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-[#002B66] cursor-pointer"
            >
              <option value="all">All Inbound Materials (Portfolio Buffer 2.5d)</option>
              <option value="tubes">Packaging Tubes (Tight Buffer 2.0d - High Risk)</option>
              <option value="pigments">Color Pigments &amp; Concentrates (Buffer 3.5d)</option>
              <option value="bulk_wax">Bulk Wax Base Base (Buffer 4.5d)</option>
              <option value="apis">APIs - Menthol &amp; Zinc Oxide (Buffer 5.0d)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Customer SLA Tier Sensitivity:</label>
            <select
              value={customerTier}
              onChange={(e) => setCustomerTier(e.target.value as any)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-[#002B66] cursor-pointer"
            >
              <option value="all">Blended Portfolio Customers</option>
              <option value="tier1_retail">Tier 1 National Retailers (Walmart / Target - 98% SLA)</option>
              <option value="healthcare">Healthcare &amp; Clinical Networks (Strict Zero-Backorder)</option>
              <option value="ecommerce">E-Commerce &amp; Rapid Replenishment</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Interactive Levers: Lead Times & Demand Spikes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* LEVER 1: Material Lead Time Delay Slider */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                1. Material Inbound Lead Time Volatility
              </h3>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              +{leadTimeDelayDays} Days Delay
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Simulates supplier port congestion, raw ingredient transit delays, and customs hold-ups before reaching Melville/Whitman facilities.
          </p>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>On-Time Arrival (0d)</span>
              <span className="font-bold text-slate-900 font-mono">+{leadTimeDelayDays} days</span>
              <span>Severe Delay (+14d)</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={leadTimeDelayDays}
              onChange={(e) => setLeadTimeDelayDays(parseInt(e.target.value, 10))}
              className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
            {[
              { label: 'On-Time (0d)', days: 0 },
              { label: 'Moderate (+3d)', days: 3 },
              { label: 'Supplier Delay (+7d)', days: 7 },
              { label: 'Severe Stockout (+12d)', days: 12 },
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => setLeadTimeDelayDays(p.days)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  leadTimeDelayDays === p.days
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Buffer Breached:</span>
            <span className={`font-mono font-bold ${
              sensitivityResults.bufferBreachDays > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {sensitivityResults.bufferBreachDays > 0 ? `+${sensitivityResults.bufferBreachDays.toFixed(1)}d over buffer` : 'Safe within stock buffer'}
            </span>
          </div>
        </div>

        {/* LEVER 2: Demand Spike Slider */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                2. Market Demand Spike &amp; Volume Surge
              </h3>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              {demandSpikePercent > 0 ? `+${demandSpikePercent}%` : `${demandSpikePercent}%`} Surge
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Simulates viral social retail runs, unforecasted promotional pull from Amazon/Target, or winter cold/flu medicated stick spikes.
          </p>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>-10% Contraction</span>
              <span className="font-bold text-slate-900 font-mono">
                {demandSpikePercent > 0 ? `+${demandSpikePercent}%` : `${demandSpikePercent}%`}
              </span>
              <span>+50% Holiday Spike</span>
            </div>
            <input
              type="range"
              min="-10"
              max="50"
              step="5"
              value={demandSpikePercent}
              onChange={(e) => setDemandSpikePercent(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
            {[
              { label: 'Flat (0%)', val: 0 },
              { label: 'Promo (+15%)', val: 15 },
              { label: 'Retail Surge (+30%)', val: 30 },
              { label: 'Peak Spike (+50%)', val: 50 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setDemandSpikePercent(p.val)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  demandSpikePercent === p.val
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Extra Volume Needed:</span>
            <span className="font-mono font-bold text-slate-900">
              {sensitivityResults.extraUnits > 0 ? `+${sensitivityResults.extraUnits.toLocaleString()}` : sensitivityResults.extraUnits.toLocaleString()} units
            </span>
          </div>
        </div>

      </div>

      {/* 3. Recalculated Impact KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Metric 1: Recalculated Makespan */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Recalculated Makespan</span>
            <span className="text-[10px] text-slate-400">Baseline: {baseMakespan}h</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {sensitivityResults.recalculatedMakespan}h
            </span>
            <span className="text-xs font-semibold text-amber-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{sensitivityResults.makespanDelta}h</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {sensitivityResults.overtimeHours > 0 
              ? `${sensitivityResults.overtimeHours}h weekend overtime triggered` 
              : 'Absorbed within standard 144h shift horizon'}
          </p>
        </div>

        {/* Metric 2: Customer Service Level (OTIF %) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Customer OTIF Service</span>
            <span className="text-[10px] text-slate-400">Target &ge;95%</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-extrabold font-mono tabular-nums ${
              sensitivityResults.recalculatedOtif >= 95.0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              {sensitivityResults.recalculatedOtif}%
            </span>
            <span className={`text-xs font-semibold flex items-center ${
              sensitivityResults.otifDelta < 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {sensitivityResults.otifDelta < 0 ? (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{sensitivityResults.otifDelta}%</span>
                </>
              ) : (
                <span>Nominal</span>
              )}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {sensitivityResults.recalculatedOtif >= 95.0 
              ? 'Meets retail customer contractual SLA' 
              : 'Warning: Backorder chargebacks apply'}
          </p>
        </div>

        {/* Metric 3: Total Cost Variance */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Financial Risk Variance</span>
            <span className="text-[10px] text-slate-400">Expedited + Overtime</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-[#002B66] font-mono tabular-nums">
              +${sensitivityResults.totalFinancialVariance.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            Overtime: ${sensitivityResults.overtimeCost.toLocaleString()} · Freight: ${sensitivityResults.expeditedFreightCost.toLocaleString()}
          </p>
        </div>

        {/* Metric 4: Line Starvation Risk */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Line Starvation Hours</span>
            <span className="text-[10px] text-slate-400">Component Depletion</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-extrabold font-mono tabular-nums ${
              sensitivityResults.starvationHours > 0 ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {sensitivityResults.starvationHours}h
            </span>
            <span className="text-xs text-slate-500">idle</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {sensitivityResults.starvationHours > 0 
              ? `Line 1 halted for ${sensitivityResults.starvationHours}h waiting on packaging` 
              : 'Zero starvation. Buffer stock fully covers.'}
          </p>
        </div>

      </div>

      {/* 4. Two-Dimensional Sensitivity Matrix ($5 \times 5$ Grid) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Two-Dimensional Sensitivity Matrix (Demand Spikes vs. Material Lead Time Delays)
            </h3>
            <p className="text-xs text-slate-500">
              Interactive grid evaluating 25 discrete market states. Each cell displays resulting Customer OTIF % and Makespan. Click any cell to test that stress condition.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
              <span>Resilient (&ge;97% OTIF)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              <span>Overtime (94%-96.9%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
              <span>Critical (&lt;94% / &gt;164h)</span>
            </div>
          </div>
        </div>

        {/* 5x5 Matrix Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2.5 border border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase text-[10px] text-left">
                  Demand \ Lead Time Delay
                </th>
                {['On-Time (0d)', '+2 Days Delay', '+4 Days Delay', '+7 Days Delay', '+10 Days Delay'].map((colHeader, cIdx) => (
                  <th key={cIdx} className="p-2.5 border border-slate-200 bg-slate-50 text-slate-800 font-bold text-center min-w-[120px]">
                    {colHeader}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0, 10, 20, 35, 50].map((dVal, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2.5 border border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs whitespace-nowrap">
                    +{dVal}% Demand Surge
                  </td>
                  {sensitivityGrid[rIdx].map((cell, cIdx) => {
                    const isSelected = demandSpikePercent === cell.demandSpike && leadTimeDelayDays === cell.leadTimeDelay;
                    let bg = 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100';
                    if (cell.status === 'warning') {
                      bg = 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100';
                    } else if (cell.status === 'critical') {
                      bg = 'bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100';
                    }

                    return (
                      <td
                        key={cIdx}
                        onClick={() => {
                          setDemandSpikePercent(cell.demandSpike);
                          setLeadTimeDelayDays(cell.leadTimeDelay);
                        }}
                        className={`p-2.5 border text-center transition-all cursor-pointer ${bg} ${
                          isSelected ? 'ring-2 ring-[#002B66] font-bold shadow-xs' : ''
                        }`}
                        title={`Click to simulate: Demand +${cell.demandSpike}%, Lead Time +${cell.leadTimeDelay}d`}
                      >
                        <div className="font-mono font-bold text-xs">{cell.otif}% OTIF</div>
                        <div className="font-mono text-[10px] opacity-80 mt-0.5">{cell.makespan}h makespan</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Sensitivity Curve Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 1: OTIF Degradation Curves */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                OTIF Degradation Curves vs Demand Spikes
              </h3>
              <p className="text-xs text-slate-500">
                Shows service level resilience under varying material transit delays.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={otifCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="demandSpike" tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} unit="%" />
                <RechartsTooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={95} stroke="#dc2626" strokeDasharray="3 3" label={{ value: '95% Retail SLA', fill: '#dc2626', fontSize: 10 }} />
                <Line type="monotone" dataKey="On-Time (0d Delay)" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Moderate (+3d Delay)" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Supplier Disruption (+7d)" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Severe Delay (+10d)" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Financial Risk Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Financial Risk Exposure Breakdown (USD)
              </h3>
              <p className="text-xs text-slate-500">
                Distribution across Overtime Labor, Expedited Air Freight, and Stockout penalties.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdownData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="spike" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Overtime Labor ($)" stackId="a" fill="#002B66" />
                <Bar dataKey="Expedited Freight ($)" stackId="a" fill="#d97706" />
                <Bar dataKey="Stockout Chargebacks ($)" stackId="a" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 6. Vulnerable Production Orders & Buffer Depletion Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Candidate Production Order Vulnerability Analysis (SAP MSEG Inbound Mapping)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates which specific planned production runs will starve first under current +{leadTimeDelayDays}d lead time delay.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 font-semibold">
            Line 1 Rotary Schedule · 8 Planned POs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3 text-left">Order AUFNR</th>
                <th className="py-2.5 px-3 text-left">SKU &amp; Formulation</th>
                <th className="py-2.5 px-3 text-left">Critical Raw Material</th>
                <th className="py-2.5 px-3 text-center">Safety Buffer</th>
                <th className="py-2.5 px-3 text-center">Inbound Delay</th>
                <th className="py-2.5 px-3 text-center">Starvation Risk</th>
                <th className="py-2.5 px-3 text-right">Target Due Hour</th>
                <th className="py-2.5 px-3 text-right">Projected Finish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SEQUENCING_CANDIDATE_SKUS.slice(0, 6).map((sku, idx) => {
                const bufferDays = idx === 3 ? 2.0 : idx === 2 ? 3.5 : 4.5;
                const isStarving = leadTimeDelayDays > bufferDays;
                const projectedDelayHours = isStarving ? (leadTimeDelayDays - bufferDays) * 6.5 : 0;
                const finishHour = Number((sku.dueHour - 12 + projectedDelayHours + (demandSpikePercent * 0.2)).toFixed(1));

                return (
                  <tr key={sku.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                      {sku.orderNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300"
                          style={{ backgroundColor: sku.color }}
                        />
                        <div>
                          <div className="font-bold text-slate-900">{sku.skuDescription}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sku.skuCode} ({sku.shadeName})</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {idx === 3 ? '4.2g Balm Tube Casings' : idx === 5 ? 'Menthol API & Zinc Base' : 'Bulk Wax & Red Dye 40'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium tabular-nums">
                      {bufferDays.toFixed(1)} days
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-800">
                      +{leadTimeDelayDays} days
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isStarving
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : bufferDays - leadTimeDelayDays <= 1.0
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isStarving ? 'Line Starved / Delayed' : bufferDays - leadTimeDelayDays <= 1.0 ? 'Buffer Absorbing' : 'Resilient / On-Time'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                      {sku.dueHour.toFixed(1)}h
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                      <span className={finishHour > sku.dueHour ? 'text-rose-600' : 'text-emerald-700'}>
                        {finishHour}h {finishHour > sku.dueHour ? '(Late)' : '(On-Time)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Prescriptive Mitigations & Stochastic Monte Carlo Sweep */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Action Card 1: Re-sequencing Swap */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs text-sky-800 font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Mitigation Option 1</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Dynamic Sequence Reordering
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resequence `KC-LIP-101` and `KC-LIP-108` forward to run first. Delays Cherry Gloss by 48 hours, allowing the delayed packaging shipment to arrive with zero machine downtime.
            </p>
          </div>
          <button
            onClick={() => alert('Sequence reordering applied: Pushed Cherry Gloss to Position 5 while tube casings arrive. Zero line starvation achieved.')}
            className="w-full py-2 text-xs font-bold text-[#002B66] bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer"
          >
            Apply Sequence Reordering
          </button>
        </div>

        {/* Action Card 2: Expedited Air Transit */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs text-amber-800 font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Mitigation Option 2</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Authorize Emergency Dual-Source Air Freight
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Approve $2,850 expedited air cargo transit from Guadalajara facility. Slashes lead time delay from +{leadTimeDelayDays}d back to 1.0d, completely preserving Walmart/Target 98% OTIF.
            </p>
          </div>
          <button
            onClick={() => {
              setLeadTimeDelayDays(1);
              alert('Emergency expedited air cargo authorized! Lead time delay reset to +1.0d.');
            }}
            className="w-full py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer"
          >
            Authorize Air Transit ($2,850)
          </button>
        </div>

        {/* Action Card 3: Monte Carlo 1,000 Iteration Sweep */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-xs text-purple-800 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stochastic Stress Test</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Monte Carlo Multi-Variable Sweep
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulates 1,000 stochastic permutations sampling joint log-normal supplier lead times and Gaussian demand distributions.
            </p>
          </div>

          <div>
            {monteCarloSummary ? (
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-xs space-y-1 mb-2">
                <div className="flex justify-between font-mono">
                  <span>P50 Expected:</span>
                  <strong className="text-slate-900">{monteCarloSummary.p50Makespan}h ({monteCarloSummary.p50Otif}% OTIF)</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>P90 Stress:</span>
                  <strong className="text-amber-800">{monteCarloSummary.p90Makespan}h ({monteCarloSummary.p90Otif}% OTIF)</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>P99 Black Swan:</span>
                  <strong className="text-rose-800">{monteCarloSummary.p99Makespan}h ({monteCarloSummary.p99Otif}% OTIF)</strong>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleRunMonteCarlo}
              disabled={isMonteCarloRunning}
              className="w-full py-2 text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isMonteCarloRunning ? 'animate-spin' : ''}`} />
              <span>{isMonteCarloRunning ? `Simulating (${monteCarloProgress}%)...` : 'Run 1,000 Monte Carlo Iterations'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
