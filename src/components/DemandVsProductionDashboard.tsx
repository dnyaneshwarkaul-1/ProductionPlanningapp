import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Layers, 
  Sliders, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  DollarSign, 
  Search, 
  RotateCcw,
  Sparkles,
  BarChart3,
  Factory,
  Cpu,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Package,
  Boxes,
  Users,
  Compass,
  Zap,
  ArrowRight,
  Play,
  FileText,
  Workflow,
  ClipboardList,
  Flame,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  PlantId, 
  CategoryDemandGapRecord, 
  SkuDemandGapRecord, 
  PackSize, 
  UserRole,
  PersonaPerspective 
} from '../types/ppds';
import { 
  PLANTS, 
  CATEGORY_DEMAND_GAP_DATA, 
  SKU_DEMAND_GAP_DATA, 
  LINE_RESOURCE_CAPACITY_DATA, 
  SUPPLY_CHAIN_STACK_BENCHMARKS,
  SHADES_FORMULATIONS
} from '../data/mockData';
import { exportProductionScheduleCsv } from '../utils/exportPdf';

interface DemandVsProductionDashboardProps {
  selectedPlant: PlantId;
  onSelectPlant: (plant: PlantId) => void;
  currentRole?: UserRole;
  onOpenExport?: () => void;
}

export const DemandVsProductionDashboard: React.FC<DemandVsProductionDashboardProps> = ({
  selectedPlant,
  onSelectPlant,
  currentRole = 'Enterprise Optimization Principal',
  onOpenExport,
}) => {
  // Navigation sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'category_kpi' | 'sku_kpi' | 'waterfall_capacity' | 'supply_chain_stack' | 'resolution_sandbox'>('category_kpi');
  
  // Persona Perspective Lens (Leadership, Planner, Supervisor, Operator)
  const [activePerspective, setActivePerspective] = useState<PersonaPerspective>('planner');

  // Filters
  const [selectedWeek, setSelectedWeek] = useState<number>(18);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterDeficitOnly, setFilterDeficitOnly] = useState<boolean>(false);
  const [skuSearchQuery, setSkuSearchQuery] = useState<string>('');
  const [selectedPackSize, setSelectedPackSize] = useState<string>('ALL');
  const [expandedCategoryRow, setExpandedCategoryRow] = useState<string | null>(null);

  // Live Interactive Gap Resolution Levers
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [changeoverReductionHours, setChangeoverReductionHours] = useState<number>(0);
  const [speedBoostPercent, setSpeedBoostPercent] = useState<number>(0);
  const [networkSpilloverKg, setNetworkSpilloverKg] = useState<number>(0);
  const [isGurobiBalancing, setIsGurobiBalancing] = useState<boolean>(false);
  const [balanceAppliedToast, setBalanceAppliedToast] = useState<string | null>(null);

  // Operator Execution Interactive State (for Shop-Floor MES Lens)
  const [activeJobRun, setActiveJobRun] = useState<{
    id: string;
    sku: string;
    targetKg: number;
    producedKg: number;
    state: 'RUNNING' | 'PAUSED' | 'CHANGEOVER' | 'COMPLETED';
    scrapKg: number;
  }>({
    id: 'JB-5001-M1',
    sku: 'Pure Color Envy Matte (Carnal) 3.5g Tube',
    targetKg: 57467.2,
    producedKg: 52140.0,
    state: 'RUNNING',
    scrapKg: 182.5,
  });

  const [lineClearanceChecked, setLineClearanceChecked] = useState<{
    swabClean: boolean;
    lakeDyePurge: boolean;
    labelVerification: boolean;
    eSignature: boolean;
  }>({
    swabClean: true,
    lakeDyePurge: true,
    labelVerification: false,
    eSignature: false,
  });

  const currentPlantObj = PLANTS.find((p) => p.id === selectedPlant) || PLANTS[0];

  // Calculated Dynamic Demand Gaps with resolution levers applied
  const resolvedCategoryData = useMemo(() => {
    return CATEGORY_DEMAND_GAP_DATA.map((item) => {
      // If resolution levers are applied
      let addedKg = 0;
      if (item.gapKg < 0) {
        // distribute overtime and speed boost to deficit items
        addedKg += (overtimeHours * 240) + (speedBoostPercent * 180) + (changeoverReductionHours * 310) + (networkSpilloverKg * 0.25);
      }
      const newActualKg = Number((item.actualProdKg + addedKg).toFixed(1));
      const newGapKg = Number((newActualKg - item.demandKg).toFixed(1));
      const newGapPercent = Number(((newGapKg / item.demandKg) * 100).toFixed(2));
      const newStatus = newGapKg >= 0 ? 'Target Met' : 'Deficit Backorder';
      const newRevenueAtRisk = newGapKg < 0 ? Math.round(Math.abs(newGapKg) * 13.5) : 0;

      return {
        ...item,
        actualProdKg: newActualKg,
        gapKg: newGapKg,
        gapPercent: newGapPercent,
        status: newStatus as 'Target Met' | 'Deficit Backorder' | 'Buffer Build',
        revenueAtRiskUsd: newRevenueAtRisk,
      };
    });
  }, [overtimeHours, changeoverReductionHours, speedBoostPercent, networkSpilloverKg]);

  // Aggregate KPI Calculations
  const totals = useMemo(() => {
    const totalDemandKg = resolvedCategoryData.reduce((acc, c) => acc + c.demandKg, 0);
    const totalActualKg = resolvedCategoryData.reduce((acc, c) => acc + c.actualProdKg, 0);
    const netGapKg = totalActualKg - totalDemandKg;
    const netGapPercent = (netGapKg / totalDemandKg) * 100;
    const totalRevenueAtRisk = resolvedCategoryData.reduce((acc, c) => acc + c.revenueAtRiskUsd, 0);
    const totalDemandUnits = resolvedCategoryData.reduce((acc, c) => acc + c.demandUnits, 0);
    const totalActualUnits = resolvedCategoryData.reduce((acc, c) => acc + c.actualProdUnits, 0);
    const fulfillmentRatePercent = (totalActualKg / totalDemandKg) * 100;

    return {
      totalDemandKg: Number(totalDemandKg.toFixed(1)),
      totalActualKg: Number(totalActualKg.toFixed(1)),
      netGapKg: Number(netGapKg.toFixed(1)),
      netGapPercent: Number(netGapPercent.toFixed(2)),
      totalRevenueAtRisk,
      totalDemandUnits,
      totalActualUnits,
      fulfillmentRatePercent: Number(fulfillmentRatePercent.toFixed(1)),
    };
  }, [resolvedCategoryData]);

  // Filtered Category Data
  const filteredCategoryData = useMemo(() => {
    return resolvedCategoryData.filter((item) => {
      if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
      if (filterDeficitOnly && item.gapKg >= 0) return false;
      return true;
    });
  }, [resolvedCategoryData, filterCategory, filterDeficitOnly]);

  // Filtered SKU Data
  const filteredSkuData = useMemo(() => {
    return SKU_DEMAND_GAP_DATA.filter((item) => {
      if (selectedPackSize !== 'ALL' && item.packSize !== selectedPackSize) return false;
      if (filterDeficitOnly && item.gapKg >= 0) return false;
      if (skuSearchQuery) {
        const q = skuSearchQuery.toLowerCase();
        return (
          item.skuCode.toLowerCase().includes(q) ||
          item.skuDescription.toLowerCase().includes(q) ||
          item.shadeName.toLowerCase().includes(q) ||
          item.primaryAccount.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedPackSize, filterDeficitOnly, skuSearchQuery]);

  // Recharts Chart Data for Category Fulfillment
  const chartCategoryData = useMemo(() => {
    return resolvedCategoryData.map((c) => ({
      name: c.shadeName.split(' ')[0],
      fullName: c.shadeName,
      DemandKg: Math.round(c.demandKg),
      ActualKg: Math.round(c.actualProdKg),
      GapKg: Math.round(c.gapKg),
      color: c.color,
    }));
  }, [resolvedCategoryData]);

  // Execute Gurobi 11.0 Auto-Balance
  const handleRunGurobiBalance = () => {
    setIsGurobiBalancing(true);
    setBalanceAppliedToast(null);

    setTimeout(() => {
      setIsGurobiBalancing(false);
      setOvertimeHours(4);
      setChangeoverReductionHours(3.5);
      setSpeedBoostPercent(4);
      setNetworkSpilloverKg(1800);
      setBalanceAppliedToast('Gurobi 11.0 Finite Solver Converged in 0.84s: Closed 5,550 kg deficit with +4h Friday swing buffer & Lake dye grouping.');

      setTimeout(() => {
        setBalanceAppliedToast(null);
      }, 5000);
    }, 950);
  };

  const handleResetLevers = () => {
    setOvertimeHours(0);
    setChangeoverReductionHours(0);
    setSpeedBoostPercent(0);
    setNetworkSpilloverKg(0);
    setBalanceAppliedToast('Parameters restored to baseline unconstrained forecast.');
    setTimeout(() => setBalanceAppliedToast(null), 3000);
  };

  // Export CSV
  const handleExportDemandCsv = () => {
    const headers = ['Category_Shade', 'Product_Type', 'Demand_Kg', 'Actual_Production_Kg', 'GAP_Kg', 'GAP_Percent', 'Demand_Units', 'Actual_Units', 'OTIF_Contribution', 'Assigned_Line', 'Revenue_At_Risk_USD'];
    const rows = resolvedCategoryData.map((c) => [
      `"${c.shadeName}"`,
      `"${c.category}"`,
      c.demandKg,
      c.actualProdKg,
      c.gapKg,
      `${c.gapPercent}%`,
      c.demandUnits,
      c.actualProdUnits,
      `${c.otifContributionPercent}%`,
      `"${c.assignedLine}"`,
      c.revenueAtRiskUsd,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KC_Demand_vs_Production_Gap_Report_Week${selectedWeek}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* 1. TOP EXECUTIVE BANNER & PERSONA PERSPECTIVE SWITCHER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demand vs Production Tracking &bull; S&amp;OP Execution Center</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Week {selectedWeek} (168h Horizon)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
              <span>Demand vs Production KPI Command Center</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Track finite manufacturing capacity against commercial demand forecasts across <strong>Plant × SKU × Line × Month × Day × Shift</strong>. Model variances modeled after Mondelez PPDS POC, o9 Solutions Digital Brain, and SAP S/4HANA PP-DS.
            </p>
          </div>

          {/* Quick Actions & Gurobi Solver Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunGurobiBalance}
              disabled={isGurobiBalancing}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                isGurobiBalancing 
                  ? 'bg-sky-400 cursor-wait' 
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
              }`}
              title="Execute Gurobi 11.0 MILP heuristic to reallocate machine hours and eliminate demand deficits"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGurobiBalancing ? 'animate-spin' : ''}`} />
              <span>{isGurobiBalancing ? 'Re-Balancing Gaps...' : 'Auto-Balance with Gurobi 11.0'}</span>
            </button>

            {onOpenExport ? (
              <button
                onClick={onOpenExport}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-sky-200" />
                <span>Export Dossier (PDF)</span>
              </button>
            ) : (
              <button
                onClick={handleExportDemandCsv}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-sky-200" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Solver Toast Notification */}
        {balanceAppliedToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{balanceAppliedToast}</span>
          </div>
        )}

        {/* 2. PERSONA PERSPECTIVE SWITCHER (Easy to use for everyone in system) */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Role Perspective Lens:
            </span>
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 font-bold">
              
              <button
                onClick={() => setActivePerspective('executive')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activePerspective === 'executive'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Leadership view: Revenue at risk, OTIF SLA, Working Capital, Multi-Plant Allocation"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Leadership / VP</span>
              </button>

              <button
                onClick={() => setActivePerspective('planner')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activePerspective === 'planner'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Planner view (Dnyaneshwar Kaulwar): Finite capacity, SKU gap details, Gurobi solver tuning"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-300" />
                <span>Lead Planner (Kaulwar)</span>
              </button>

              <button
                onClick={() => setActivePerspective('supervisor')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activePerspective === 'supervisor'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Line Supervisor view: Shift-by-shift hourly execution, line bottlenecks, crew matrix"
              >
                <Factory className="w-3.5 h-3.5 text-cyan-400" />
                <span>Shift Supervisor</span>
              </button>

              <button
                onClick={() => setActivePerspective('operator')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activePerspective === 'operator'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Shop-floor MES view: Real-time work order running, start/pause, scrap logging, line clearance"
              >
                <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                <span>Shop Floor MES Operator</span>
              </button>

            </div>
          </div>

          {/* Plant & Horizon Info */}
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <span>Active Plant: <strong className="text-slate-900">{currentPlantObj.city}</strong></span>
            <span>&bull;</span>
            <span>Compounding: <strong className="text-[#002B66]">2,850 Kg/h</strong></span>
            <span>&bull;</span>
            <span>Active Lines: <strong className="text-emerald-700">3 of 3 Active</strong></span>
          </div>
        </div>

        {/* 3. NAVIGATION SUB-VIEWS */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          
          <button
            onClick={() => setActiveSubTab('category_kpi')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'category_kpi'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>KPI-1: Category &amp; Flavor Gap ({resolvedCategoryData.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sku_kpi')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'sku_kpi'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-purple-400" />
            <span>KPI-2: SKU &amp; Pack-Size Matrix ({SKU_DEMAND_GAP_DATA.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('waterfall_capacity')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'waterfall_capacity'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>KPI-3 &amp; 4: Capacity &amp; Line Load</span>
          </button>

          <button
            onClick={() => setActiveSubTab('supply_chain_stack')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'supply_chain_stack'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-amber-400" />
            <span>Architecture: o9 &bull; Kinaxis &bull; SAP &bull; MES</span>
          </button>

          <button
            onClick={() => setActiveSubTab('resolution_sandbox')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeSubTab === 'resolution_sandbox'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gap Resolution Sandbox (What-If)</span>
          </button>

        </div>

      </div>

      {/* 2. 6-METRIC EXECUTIVE KPI SCORECARD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Metric 1: Total Demand (Kg) */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Commercial Demand</span>
            <Package className="w-3.5 h-3.5 text-[#002B66]" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            {totals.totalDemandKg.toLocaleString()} <span className="text-xs text-slate-500 font-normal">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totals.totalDemandUnits.toLocaleString()} total units
          </div>
        </div>

        {/* Metric 2: Actual Scheduled Production */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Scheduled Output</span>
            <Factory className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            {totals.totalActualKg.toLocaleString()} <span className="text-xs text-slate-500 font-normal">kg</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            {totals.fulfillmentRatePercent}% fulfillment rate
          </div>
        </div>

        {/* Metric 3: Net Demand vs Production GAP */}
        <div className={`rounded-xl p-3.5 border shadow-xs ${
          totals.netGapKg >= 0 
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-1">
            <span className={totals.netGapKg >= 0 ? 'text-emerald-800' : 'text-amber-800'}>Net Demand Gap</span>
            {totals.netGapKg >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
            )}
          </div>
          <div className="text-xl font-extrabold tracking-tight">
            {totals.netGapKg > 0 ? `+${totals.netGapKg.toLocaleString()}` : totals.netGapKg.toLocaleString()}{' '}
            <span className="text-xs font-normal">kg</span>
          </div>
          <div className={`text-[11px] font-bold mt-1 ${totals.netGapKg >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {totals.netGapPercent > 0 ? `+${totals.netGapPercent}% surplus` : `${totals.netGapPercent}% backlog`}
          </div>
        </div>

        {/* Metric 4: Revenue at Risk */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Revenue at Risk</span>
            <DollarSign className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            ${(totals.totalRevenueAtRisk / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totals.totalRevenueAtRisk === 0 ? 'Zero unfulfilled orders' : 'Unmet hospital & retail'}
          </div>
        </div>

        {/* Metric 5: Customer OTIF SLA */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Customer OTIF SLA</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 tracking-tight">
            98.2%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Retail target: 98.5%
          </div>
        </div>

        {/* Metric 6: Inventory Buffer Coverage */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Buffer Coverage</span>
            <Clock className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight">
            8.4 <span className="text-xs text-slate-500 font-normal">days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Safety stock target: 7.0d
          </div>
        </div>

      </div>

      {/* 3. CONDITIONAL ROLE PERSPECTIVE ACCORDION / ADVICE BANNER */}
      {activePerspective === 'executive' && (
        <div className="p-4 bg-gradient-to-r from-[#002B66] to-[#0051A5] text-white rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-300" />
              <span className="font-bold text-sm">Executive Leadership Briefing (VP Supply Chain &amp; Operations Director)</span>
            </div>
            <p className="text-xs text-slate-200 max-w-3xl leading-relaxed">
              Consolidated global prestige beauty &amp; cosmetics demand is <strong>98.8% fulfilled</strong>. Key operational bottlenecks are localized to <em>Rose Tea Balm (s6)</em> and <em>Pure Color Envy Carnal 3kg bulk refilling</em>. Gurobi 11.0 reallocation has mitigated $77.6k in revenue risk down to $0 by enabling a Friday 4-hour swing overtime buffer.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleRunGurobiBalance}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Approve Overtime Buffer
            </button>
          </div>
        </div>
      )}

      {activePerspective === 'operator' && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm">Shop Floor MES Operator Execution Terminal</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              MES Terminal #NEENAH-L1-M1 &bull; Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Current Active Run Card */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                <span>Active Work Order</span>
                <span className="text-emerald-400 animate-pulse">&bull; RUNNING</span>
              </div>
              <p className="font-bold text-white text-sm">{activeJobRun.sku}</p>
              <div className="space-y-1 pt-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Batch Output:</span>
                  <strong className="text-white">{activeJobRun.producedKg.toLocaleString()} / {activeJobRun.targetKg.toLocaleString()} kg</strong>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90.7%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>90.7% Complete</span>
                  <span>Scrap: <strong className="text-amber-400">{activeJobRun.scrapKg} kg</strong></span>
                </div>
              </div>
            </div>

            {/* Electronic Line Clearance Checklist */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">FDA Title 21 cGMP Line Clearance</span>
              <div className="space-y-1 text-[11px]">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lineClearanceChecked.swabClean}
                    onChange={(e) => setLineClearanceChecked({ ...lineClearanceChecked, swabClean: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <span>Sanitation Swab &lt;10 CFU/cm² Clean</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lineClearanceChecked.lakeDyePurge}
                    onChange={(e) => setLineClearanceChecked({ ...lineClearanceChecked, lakeDyePurge: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <span>Spectral Lake Dye Purge Verified</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lineClearanceChecked.labelVerification}
                    onChange={(e) => setLineClearanceChecked({ ...lineClearanceChecked, labelVerification: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <span>Carton Barcode Lot Check (CFR 21)</span>
                </label>
              </div>
            </div>

            {/* Operator Quick Action Bar */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Operator Machine Controls</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => alert('Batch paused. Micro-stop recorded for technician inspection.')}
                  className="py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs"
                >
                  Pause (Micro-Stop)
                </button>
                <button
                  onClick={() => alert('Batch completed! Work order dispatched to Siemens Opcenter MES.')}
                  className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                >
                  Complete Batch
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 block">
                Signed by: <strong>Marcus Vance (Lead Tech)</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 1: CATEGORY & FLAVOR LEVEL DEMAND GAP (KPI-1)   */}
      {/* ======================================================== */}
      {activeSubTab === 'category_kpi' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  KPI-1: Demand vs Actual Production Gap at Flavor &amp; Category Level
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/15 text-[#001E38] border border-[#C5A059]/30">
                  The Estée Lauder Companies Standard
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates aggregate demand against scheduled outputs by shade formulation, pigment family, and primary production line.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs font-semibold p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="ALL">All Product Families</option>
                <option value="Lipsticks & Color Cosmetics">Lipsticks &amp; Color Cosmetics</option>
                <option value="Lip Balms & Medicated Sticks">Lip Balms &amp; Medicated Sticks</option>
                <option value="Clinical Ointments & Barrier Jars">Clinical Ointments</option>
                <option value="Institutional & Bulk Packaging">Institutional Bulk</option>
              </select>

              <label className="flex items-center space-x-1.5 text-xs text-slate-700 font-semibold cursor-pointer select-none bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={filterDeficitOnly}
                  onChange={(e) => setFilterDeficitOnly(e.target.checked)}
                  className="rounded border-slate-300 text-[#002B66] focus:ring-[#002B66]"
                />
                <span>Deficits Only</span>
              </label>
            </div>
          </div>

          {/* Table KPI-1 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#001D45] text-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 font-bold">Flavor / Formulation</th>
                  <th className="py-3 px-3 font-bold">Category</th>
                  <th className="py-3 px-3 font-bold text-right">Actual Prod (Kg)</th>
                  <th className="py-3 px-3 font-bold text-right">Demand (Kg)</th>
                  <th className="py-3 px-3 font-bold text-right">GAP Value (Kg)</th>
                  <th className="py-3 px-3 font-bold text-right">GAP %</th>
                  <th className="py-3 px-3 font-bold text-right">Output (Units)</th>
                  <th className="py-3 px-3 font-bold text-center">Fulfillment Status</th>
                  <th className="py-3 px-3 font-bold text-right">Assigned Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategoryData.map((row) => {
                  const isDeficit = row.gapKg < 0;
                  const isPerfect = row.gapKg === 0;
                  return (
                    <React.Fragment key={row.shadeId}>
                      <tr 
                        onClick={() => setExpandedCategoryRow(expandedCategoryRow === row.shadeId ? null : row.shadeId)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300 shadow-xs" 
                              style={{ backgroundColor: row.color }} 
                            />
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">{row.shadeName}</span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase">{row.shadeId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {row.category}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {row.actualProdKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700">
                          {row.demandKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${
                          isDeficit ? 'text-red-700' : isPerfect ? 'text-slate-500' : 'text-emerald-700'
                        }`}>
                          {row.gapKg > 0 ? `+${row.gapKg.toFixed(1)}` : row.gapKg.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            isDeficit 
                              ? 'bg-red-100 text-red-900 border border-red-200' 
                              : isPerfect 
                              ? 'bg-slate-100 text-slate-700' 
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {row.gapPercent > 0 ? `+${row.gapPercent}%` : `${row.gapPercent}%`}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-800">
                          {row.actualProdUnits.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 ${
                            isDeficit
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isDeficit ? <AlertCircle className="w-2.5 h-2.5 text-amber-600" /> : <Check className="w-2.5 h-2.5 text-emerald-600" />}
                            <span>{row.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600 font-medium">
                          {row.assignedLine.split(' ')[0]} {row.assignedLine.split(' ')[1]}
                        </td>
                      </tr>

                      {/* Expandable Drilldown for this category */}
                      {expandedCategoryRow === row.shadeId && (
                        <tr className="bg-sky-50/50">
                          <td colSpan={9} className="p-4 border-t border-b border-sky-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              <div>
                                <span className="font-bold text-[#002B66] block">Commercial SLA Account:</span>
                                <p className="text-slate-700 mt-0.5">{row.primaryCustomer}</p>
                                <span className="text-[10px] text-slate-500">Retail OTIF Impact: {row.otifContributionPercent}%</span>
                              </div>
                              <div>
                                <span className="font-bold text-[#002B66] block">Production Variance Financials:</span>
                                <p className="text-slate-700 mt-0.5">
                                  Revenue at Risk: <strong className="text-red-700">${row.revenueAtRiskUsd.toLocaleString()}</strong>
                                </p>
                                <span className="text-[10px] text-slate-500">Gross Margin Buffer: 64.2%</span>
                              </div>
                              <div>
                                <span className="font-bold text-[#002B66] block">Shop-Floor Recommendations:</span>
                                <p className="text-slate-700 mt-0.5">
                                  {isDeficit 
                                    ? 'Inject +2.5h shift overtime or group with darker Lake dye sequence to eliminate changeover downtime.'
                                    : 'Production pace is fully matched with warehouse outbound docks.'}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: SKU × PACK-SIZE LEVEL DEMAND GAP (KPI-2)     */}
      {/* ======================================================== */}
      {activeSubTab === 'sku_kpi' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  KPI-2: Demand vs Actual Production Gap at SKU (Flavor &amp; Pack-Size) Level
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">
                  Granular SKU Pegging
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct reproduction of Mondelez PPDS POC Table 2: Evaluates SKU-level variances by formulation weight and packaging vessel size.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search SKU or customer..."
                  value={skuSearchQuery}
                  onChange={(e) => setSkuSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <select
                value={selectedPackSize}
                onChange={(e) => setSelectedPackSize(e.target.value)}
                className="font-semibold p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="ALL">All Pack Formats</option>
                <option value="3.5g Tube">3.5g Tube</option>
                <option value="4.2g Stick">4.2g Stick</option>
                <option value="10g Medical Tube">10g Medical Tube</option>
                <option value="15ml Squeeze">15ml Squeeze</option>
                <option value="50g Clinical Jar">50g Clinical Jar</option>
                <option value="5kg Bulk Kettle">5kg Bulk Kettle</option>
              </select>

              <label className="flex items-center space-x-1.5 text-slate-700 font-semibold cursor-pointer select-none bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={filterDeficitOnly}
                  onChange={(e) => setFilterDeficitOnly(e.target.checked)}
                  className="rounded border-slate-300 text-[#002B66]"
                />
                <span>Deficits Only</span>
              </label>
            </div>
          </div>

          {/* Table KPI-2 */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left min-w-[850px]">
              <thead className="bg-[#001D45] text-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 font-bold">Flavor / Shade</th>
                  <th className="py-3 px-3 font-bold">Pack Size</th>
                  <th className="py-3 px-3 font-bold">SKU Code &amp; Description</th>
                  <th className="py-3 px-3 font-bold text-right">Actual Prod (Kg)</th>
                  <th className="py-3 px-3 font-bold text-right">Demand (Kg)</th>
                  <th className="py-3 px-3 font-bold text-right">GAP Value (Kg)</th>
                  <th className="py-3 px-3 font-bold text-right">GAP %</th>
                  <th className="py-3 px-3 font-bold text-center">DOI Coverage</th>
                  <th className="py-3 px-3 font-bold text-center">Backorder Risk</th>
                  <th className="py-3 px-3 font-bold text-right">Primary Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSkuData.map((row, idx) => {
                  const isDeficit = row.gapKg < 0;
                  const isSevere = row.gapPercent <= -10;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {row.shadeName}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#002B66]">
                        {row.packSize}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 block leading-tight">{row.skuCode}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">{row.skuDescription}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {row.actualProdKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {row.demandKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        isDeficit ? 'text-red-700' : 'text-emerald-700'
                      }`}>
                        {row.gapKg > 0 ? `+${row.gapKg.toFixed(2)}` : row.gapKg.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isSevere 
                            ? 'bg-red-600 text-white' 
                            : isDeficit 
                            ? 'bg-red-100 text-red-900' 
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {row.gapPercent > 0 ? `+${row.gapPercent}%` : `${row.gapPercent}%`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="font-semibold text-slate-800">{row.stockCoverageDays}d</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.backorderRisk === 'Critical Shortage'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : row.backorderRisk === 'At Risk'
                            ? 'bg-amber-100 text-amber-800'
                            : row.backorderRisk === 'Low Buffer'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {row.backorderRisk}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 font-medium truncate max-w-[140px]">
                        {row.primaryAccount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 3: CAPACITY LOAD & RESOURCE BALANCING (KPI-3/4) */}
      {/* ======================================================== */}
      {activeSubTab === 'waterfall_capacity' && (
        <div className="space-y-6">
          
          {/* Chart Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Production vs Demand Fulfillment by Formulation (Kg)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual comparison of target demand against actual scheduled output. Dark Lake dyes (s1, s2) and Medicated Balm (s6) exhibit highest variance due to washdowns.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
                  <span>Demand Target</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-[#002B66] inline-block" />
                  <span>Actual Scheduled</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCategoryData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fullName" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k kg`} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [`${Number(value).toLocaleString()} kg`, name === 'DemandKg' ? 'Demand Target' : 'Actual Production']}
                  />
                  <Bar dataKey="DemandKg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ActualKg" fill="#002B66" radius={[4, 4, 0, 0]}>
                    {chartCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.GapKg < 0 ? '#b91c1c' : '#002B66'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Resource Capacity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LINE_RESOURCE_CAPACITY_DATA.map((line) => (
              <div key={line.lineId} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Factory className="w-4 h-4 text-[#002B66]" />
                    <h4 className="font-bold text-slate-900 text-sm">{line.lineId}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-sky-100 text-[#002B66]">
                    {line.utilizationPercent}% Loaded
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-semibold">{line.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{line.category}</p>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Finite Scheduled:</span>
                    <strong className="text-slate-900">{line.finiteScheduledHours}h / 168.0h</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        line.utilizationPercent > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${line.utilizationPercent}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown details */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-500 border-t border-slate-100 font-mono">
                  <div>
                    <span className="block text-slate-400">RUN:</span>
                    <strong className="text-slate-800">{line.plannedProductionHours}h</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">WASHDOWN:</span>
                    <strong className="text-purple-700">{line.changeoverWashHours}h</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">FDA SAN:</span>
                    <strong className="text-sky-700">{line.sanitationFdaHours}h</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200/60">
                  <span className="font-bold text-slate-800 block">Critical Bottleneck:</span>
                  <span className="text-slate-600 block mt-0.5 leading-snug">{line.activeBottleneck}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 4: SUPPLY CHAIN ARCHITECTURE BENCHMARK MATRIX   */}
      {/* ======================================================== */}
      {activeSubTab === 'supply_chain_stack' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          
          <div className="pb-4 border-b border-slate-100">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-2">
              <Workflow className="w-3.5 h-3.5" />
              <span>Multi-Tier Supply Chain Digital Maturity</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Enterprise Operating Model: Strategy &bull; Plan &bull; Detailed PPDS &bull; MES Execution
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-4xl leading-relaxed">
              Based on deep industry research benchmarking <strong>o9 Solutions Digital Brain</strong> (Commercial S&amp;OP &amp; Demand Sensing), <strong>Kinaxis RapidResponse</strong> (Concurrent Buffer Planning), <strong>SAP S/4HANA PP-DS</strong> (Finite Detailed Scheduling), and <strong>Rockwell / Siemens MES</strong> (Shop-Floor Operationalization).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SUPPLY_CHAIN_STACK_BENCHMARKS.map((tier, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#002B66]/30 transition-all shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#002B66] bg-sky-100 px-2 py-0.5 rounded">
                      TIER {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1.5">{tier.tier}</h4>
                    <span className="text-xs font-semibold text-purple-700 block mt-0.5">
                      Benchmark: {tier.industryLeader}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {tier.scope}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tier.focus}
                </p>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                    Estée Lauder Operationalization:
                  </span>
                  <p className="text-slate-600 text-[11px] leading-snug">
                    {tier.kccIntegration}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center space-x-2 text-[10px] text-slate-500">
                  <span className="font-bold text-slate-700">Key KPIs:</span>
                  {tier.keyMetrics.map((m, mIdx) => (
                    <span key={mIdx} className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 5: GAP RESOLUTION SANDBOX (WHAT-IF RE-BALANCING) */}
      {/* ======================================================== */}
      {activeSubTab === 'resolution_sandbox' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-1">
                <Sliders className="w-3.5 h-3.5" />
                <span>Interactive Capacity Re-Allocation Sandbox</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Eliminate Demand Backlogs &amp; Adjust Operational Levers
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stress-test levers to close the 5,550 kg deficit. Adjust Friday overtime, optimize changeovers, throttle line speeds, or spill over volume to Whitman UK / Markham.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetLevers}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
              >
                Reset Levers
              </button>
              <button
                onClick={handleRunGurobiBalance}
                disabled={isGurobiBalancing}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                {isGurobiBalancing ? 'Solving...' : 'Gurobi 11.0 Auto-Optimize'}
              </button>
            </div>
          </div>

          {/* Interactive Levers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            
            {/* Lever 1: Overtime */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Overtime Buffer</span>
                <span className="font-mono text-[#002B66]">+{overtimeHours}h</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={2}
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                className="w-full accent-[#002B66]"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Adds Friday swing/graveyard buffer on Line 1 &amp; 2.
              </span>
            </div>

            {/* Lever 2: Changeover Reduction */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Washdown Reduction</span>
                <span className="font-mono text-purple-700">-{changeoverReductionHours}h</span>
              </div>
              <input
                type="range"
                min={0}
                max={6}
                step={0.5}
                value={changeoverReductionHours}
                onChange={(e) => setChangeoverReductionHours(Number(e.target.value))}
                className="w-full accent-purple-700"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Sequences Lake dye recipes in strict spectral order.
              </span>
            </div>

            {/* Lever 3: Line Speed Throttle */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Line Speed Boost</span>
                <span className="font-mono text-emerald-700">+{speedBoostPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={8}
                step={1}
                value={speedBoostPercent}
                onChange={(e) => setSpeedBoostPercent(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Increases rotary molder cavity injection speed.
              </span>
            </div>

            {/* Lever 4: Multi-Plant Spillover */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Whitman Plant Spillover</span>
                <span className="font-mono text-sky-700">+{networkSpilloverKg} kg</span>
              </div>
              <input
                type="range"
                min={0}
                max={4000}
                step={500}
                value={networkSpilloverKg}
                onChange={(e) => setNetworkSpilloverKg(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Transfers bulk skincare &amp; serum compounding to Whitman facility.
              </span>
            </div>

          </div>

          {/* Outcome comparison */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-950">
            <div>
              <span className="font-bold text-sm text-emerald-900 block">
                Simulated Net Demand Gap: {totals.netGapKg >= 0 ? `+${totals.netGapKg.toLocaleString()} kg (Zero Deficit)` : `${totals.netGapKg.toLocaleString()} kg`}
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Current adjustments resolve {((5550 + totals.netGapKg) / 5550 * 100).toFixed(0)}% of the initial backlog. Customer OTIF projected at <strong>99.4%</strong>.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('category_kpi')}
              className="px-4 py-2 bg-[#002B66] text-white font-bold rounded-xl text-xs shadow-xs"
            >
              View Updated KPI-1 Table
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
