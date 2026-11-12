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
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { PlantId, HistoricalPerformanceRecord, ShiftType } from '../types/ppds';
import { 
  PLANTS, 
  SKUS, 
  HISTORICAL_30D_TRENDS, 
  HISTORICAL_PERFORMANCE_RECORDS, 
  CHANGEOVER_MATRIX,
  SHADES_FORMULATIONS
} from '../data/mockData';

interface HistoricalPerformanceDashboardProps {
  selectedPlant: PlantId;
  onSelectPlant: (plant: PlantId) => void;
}

export const HistoricalPerformanceDashboard: React.FC<HistoricalPerformanceDashboardProps> = ({
  selectedPlant,
  onSelectPlant,
}) => {
  // Global Filters
  const [filterPlant, setFilterPlant] = useState<string>('ALL');
  const [filterLine, setFilterLine] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSku, setFilterSku] = useState<string>('ALL');
  const [filterShift, setFilterShift] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Sort State for Ledger Table
  const [sortField, setSortField] = useState<keyof HistoricalPerformanceRecord>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Active Tab within Dashboard
  const [analyticsView, setAnalyticsView] = useState<'overview' | 'line_category' | 'sequence_matrix' | 'records'>('overview');

  // Reset Filters
  const handleResetFilters = () => {
    setFilterPlant('ALL');
    setFilterLine('ALL');
    setFilterCategory('ALL');
    setFilterSku('ALL');
    setFilterShift('ALL');
    setSearchQuery('');
  };

  // Filtered Historical Records
  const filteredRecords = useMemo(() => {
    return HISTORICAL_PERFORMANCE_RECORDS.filter((rec) => {
      const matchPlant = filterPlant === 'ALL' || rec.plantId === filterPlant;
      const matchLine = filterLine === 'ALL' || rec.lineId.includes(filterLine);
      const matchCategory = filterCategory === 'ALL' || rec.category === filterCategory;
      const matchSku = filterSku === 'ALL' || rec.skuCode === filterSku;
      const matchShift = filterShift === 'ALL' || rec.shift.includes(filterShift);
      const matchSearch = 
        searchQuery === '' ||
        rec.skuCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.skuDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.shadeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.plantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.lineId.toLowerCase().includes(searchQuery.toLowerCase());

      return matchPlant && matchLine && matchCategory && matchSku && matchShift && matchSearch;
    });
  }, [filterPlant, filterLine, filterCategory, filterSku, filterShift, searchQuery]);

  // Sorted Records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRecords, sortField, sortAsc]);

  // Aggregate Performance Metrics
  const summaryMetrics = useMemo(() => {
    if (filteredRecords.length === 0) {
      return {
        avgOtif: 98.8,
        avgOee: 93.4,
        totalActualUnits: 780000,
        totalPlannedUnits: 778000,
        avgWashdownHours: 2.3,
        totalSolventCost: 19800,
        avgMakespan: 147.5,
        totalChangeovers: 14,
        cgmpPassRate: 100,
      };
    }

    const totalOtif = filteredRecords.reduce((acc, r) => acc + r.otifPercent, 0);
    const totalOee = filteredRecords.reduce((acc, r) => acc + r.oeePercent, 0);
    const totalActual = filteredRecords.reduce((acc, r) => acc + r.actualUnits, 0);
    const totalPlanned = filteredRecords.reduce((acc, r) => acc + r.plannedUnits, 0);
    const totalWash = filteredRecords.reduce((acc, r) => acc + r.changeoverWashHours, 0);
    const totalCost = filteredRecords.reduce((acc, r) => acc + r.solventScrapCostUsd, 0);
    const totalMakespan = filteredRecords.reduce((acc, r) => acc + r.makespanHours, 0);
    const totalCos = filteredRecords.reduce((acc, r) => acc + r.changeoverCount, 0);

    return {
      avgOtif: Number((totalOtif / filteredRecords.length).toFixed(1)),
      avgOee: Number((totalOee / filteredRecords.length).toFixed(1)),
      totalActualUnits: totalActual,
      totalPlannedUnits: totalPlanned,
      avgWashdownHours: Number((totalWash / Math.max(1, totalCos)).toFixed(1)),
      totalSolventCost: totalCost,
      avgMakespan: Number((totalMakespan / filteredRecords.length).toFixed(1)),
      totalChangeovers: totalCos,
      cgmpPassRate: 100,
    };
  }, [filteredRecords]);

  // Trend Data sliced by TimeRange
  const trendChartData = useMemo(() => {
    if (timeRange === '7D') {
      return HISTORICAL_30D_TRENDS.slice(-7);
    }
    if (timeRange === '90D') {
      // extrapolate historical points
      return HISTORICAL_30D_TRENDS;
    }
    return HISTORICAL_30D_TRENDS;
  }, [timeRange]);

  // Category Aggregated Breakdown for Bar Chart
  const categoryBarData = useMemo(() => {
    const categories = [
      'Lipsticks & Color Cosmetics',
      'Lip Balms & Medicated Sticks',
      'Clinical Ointments & Barrier Jars',
      'Institutional & Bulk Packaging'
    ];

    return categories.map((cat) => {
      const recs = HISTORICAL_PERFORMANCE_RECORDS.filter((r) => r.category === cat);
      const totalUnits = recs.reduce((acc, r) => acc + r.actualUnits, 0);
      const avgOtif = recs.length ? (recs.reduce((acc, r) => acc + r.otifPercent, 0) / recs.length) : 98.0;
      const totalWashHours = recs.reduce((acc, r) => acc + r.changeoverWashHours, 0);
      const totalCost = recs.reduce((acc, r) => acc + r.solventScrapCostUsd, 0);

      const shortLabel = cat.includes('Lipsticks') ? 'Color Cosmetics' :
                         cat.includes('Balms') ? 'Lip Balms' :
                         cat.includes('Clinical') ? 'Clinical Salves' : 'Institutional Bulk';

      return {
        category: shortLabel,
        fullCategory: cat,
        totalUnits: Math.round(totalUnits / 1000), // in k units
        avgOtif: Number(avgOtif.toFixed(1)),
        washdownHours: Number(totalWashHours.toFixed(1)),
        solventCostUsd: totalCost,
      };
    });
  }, []);

  // Line-by-Line Comparative Performance
  const linePerformanceData = useMemo(() => {
    const lines = [
      { name: 'Melville Line 1', lineCode: 'Line 1', plant: 'EL-MELVILLE', oee: 93.8, otif: 99.4, washdown: 7.5, capacityKgHr: 3200 },
      { name: 'Markham Line 1', lineCode: 'Line 1', plant: 'EL-MARKHAM', oee: 94.6, otif: 99.2, washdown: 6.8, capacityKgHr: 2400 },
      { name: 'Markham Line 2', lineCode: 'Line 2', plant: 'EL-MARKHAM', oee: 90.8, otif: 97.9, washdown: 13.2, capacityKgHr: 2200 },
      { name: 'Whitman Line 1', lineCode: 'Line 1', plant: 'EL-WHITMAN', oee: 91.2, otif: 98.4, washdown: 10.5, capacityKgHr: 1800 },
      { name: 'Whitman Line 2', lineCode: 'Line 2', plant: 'EL-WHITMAN', oee: 95.8, otif: 100.0, washdown: 5.8, capacityKgHr: 2100 },
    ];

    if (filterPlant === 'ALL') return lines;
    return lines.filter((l) => l.plant === filterPlant || (l.plant === 'EL-MELVILLE' && filterPlant === 'NA-NEENAH') || (l.plant === 'EL-WHITMAN' && filterPlant === 'NA-ROSWELL') || (l.plant === 'EL-MARKHAM' && filterPlant === 'NA-BEECH'));
  }, [filterPlant]);

  // CSV Exporter
  const handleExportCsv = () => {
    const headers = [
      'Record ID',
      'Date',
      'Plant Code',
      'Plant Name',
      'Line Name',
      'Product Category',
      'SKU Code',
      'SKU Description',
      'Shade Name',
      'Shift',
      'Planned Units',
      'Actual Units',
      'OTIF %',
      'OEE %',
      'Makespan Hours',
      'Washdown Hours',
      'Solvent Scrap Cost USD',
      'cGMP Status'
    ];

    const rows = sortedRecords.map((r) => [
      r.id,
      r.date,
      r.plantId,
      `"${r.plantName}"`,
      `"${r.lineId}"`,
      `"${r.category}"`,
      r.skuCode,
      `"${r.skuDescription}"`,
      `"${r.shadeName}"`,
      `"${r.shift}"`,
      r.plannedUnits,
      r.actualUnits,
      r.otifPercent,
      r.oeePercent,
      r.makespanHours,
      r.changeoverWashHours,
      r.solventScrapCostUsd,
      `${r.cgmpCompliancePercent}% Compliant`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EsteeLauder_PPDS_Historical_Performance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-[#002B66] text-xs font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Multi-Dimensional Production Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Historical Performance &amp; Operational KPI Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Cross-sectional performance telemetry across <strong>Plant × Line × Category × SKU × Shift</strong>. Monitor solver convergence, customer OTIF compliance, sequence-dependent pigment washdowns, and chemical scrap efficiency over time.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Retail SLA: 98.5% Target</span>
            </div>
          </div>
        </div>

        {/* Global Multi-Dimensional Filter Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          
          {/* Filter 1: Plant */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Manufacturing Plant
            </label>
            <select
              value={filterPlant}
              onChange={(e) => {
                setFilterPlant(e.target.value);
                if (e.target.value !== 'ALL') onSelectPlant(e.target.value as PlantId);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="ALL">All Plants (North America)</option>
              {PLANTS.map((p) => (
                <option key={p.id} value={p.id}>{p.city} ({p.id.split('-')[1]})</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Production Line */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Production Line
            </label>
            <select
              value={filterLine}
              onChange={(e) => setFilterLine(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="ALL">All Active Lines</option>
              <option value="Line 1">Line 1 (Lipstick &amp; Primary)</option>
              <option value="Line 2">Line 2 (Hot-Pour &amp; Ointments)</option>
              <option value="Line 3">Line 3 (Medicated Converting)</option>
            </select>
          </div>

          {/* Filter 3: Category */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Product Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="ALL">All Categories</option>
              <option value="Lipsticks & Color Cosmetics">Color Cosmetics</option>
              <option value="Lip Balms & Medicated Sticks">Lip Balms &amp; Sticks</option>
              <option value="Clinical Ointments & Barrier Jars">Clinical Ointments</option>
              <option value="Institutional & Bulk Packaging">Institutional Bulk</option>
            </select>
          </div>

          {/* Filter 4: SKU */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Target SKU Material
            </label>
            <select
              value={filterSku}
              onChange={(e) => setFilterSku(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="ALL">All SKUs (Master Catalog)</option>
              {SKUS.map((s) => (
                <option key={s.materialCode} value={s.materialCode}>
                  {s.materialCode} - {s.shortDescription.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          {/* Filter 5: Shift */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Production Shift
            </label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-semibold focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="ALL">All Shifts (24/7)</option>
              <option value="Shift 1">Shift 1 - Day (07:00-15:30)</option>
              <option value="Shift 2">Shift 2 - Swing (15:30-23:30)</option>
              <option value="Shift 3">Shift 3 - Graveyard (23:30-07:00)</option>
            </select>
          </div>

          {/* Filter 6: Time Range & Reset */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center space-x-1.5">
              {(['7D', '30D', '90D'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    timeRange === r
                      ? 'bg-[#002B66] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={handleResetFilters}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center space-x-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setAnalyticsView('overview')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              analyticsView === 'overview'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>30-Day Executive Trends &amp; OTIF</span>
          </button>

          <button
            onClick={() => setAnalyticsView('line_category')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              analyticsView === 'line_category'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Factory className="w-3.5 h-3.5 text-sky-500" />
            <span>Line &amp; Category Breakdown</span>
          </button>

          <button
            onClick={() => setAnalyticsView('sequence_matrix')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              analyticsView === 'sequence_matrix'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span>Changeover Sequence Heatmap</span>
          </button>

          <button
            onClick={() => setAnalyticsView('records')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              analyticsView === 'records'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Historical Run Ledger ({sortedRecords.length})</span>
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 5-KPI EXECUTIVE METRIC CARDS ROW                         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Customer OTIF */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <span>Customer OTIF Rate</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              Above SLA
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {summaryMetrics.avgOtif}%
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+1.3% MoM</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Benchmark SLA: 98.5% across Target &amp; Walmart</p>
        </div>

        {/* KPI 2: Overall OEE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <span>Overall OEE</span>
            <span className="text-[#002B66] font-bold bg-sky-50 px-1.5 py-0.5 rounded">
              World Class
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {summaryMetrics.avgOee}%
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+2.4%</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Avail: 95.8% • Perf: 98.4% • Qual: 99.5%</p>
        </div>

        {/* KPI 3: Mean Pigment Washdown Duration */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <span>Mean Washdown Time</span>
            <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
              -38% Purge
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-purple-900 tabular-nums">
              {summaryMetrics.avgWashdownHours}h
            </span>
            <span className="text-xs text-purple-700 font-bold">/ changeover</span>
          </div>
          <p className="text-[10px] text-slate-500">Color sequence clustering saved 42h downtime</p>
        </div>

        {/* KPI 4: Chemical Washdown Spend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <span>Chemical Scrap Spend</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              -$12.8k Budget
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#002B66] tabular-nums">
              ${(summaryMetrics.totalSolventCost).toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Includes food-grade solvent &amp; sterile CIP detergent</p>
        </div>

        {/* KPI 5: cGMP Compliance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <span>FDA cGMP 36h Cleanouts</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              100% Validated
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-700 tabular-nums">
              100.0%
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-[10px] text-slate-500">0 sanitation violations across all 3 plants</p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* VIEW 1: 30-DAY RECHARTS OVERVIEW                         */}
      {/* ======================================================== */}
      {analyticsView === 'overview' && (
        <div className="space-y-6">
          
          {/* Main Dual-Axis Chart: OTIF % vs Makespan Hours */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Historical OTIF Compliance (%) vs Total Makespan (Hours)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Plots solver convergence over {trendChartData.length} production cycles against 95.0% Customer SLA and 168.0h Weekly Ceiling.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#002B66]" />
                  <span className="font-semibold text-slate-700">Customer OTIF % (Left Axis)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-600" />
                  <span className="font-semibold text-slate-700">Makespan Hours (Right Axis)</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="dayLabel" 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    domain={[92, 100]} 
                    tick={{ fontSize: 11, fill: '#002B66' }} 
                    unit="%"
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[130, 175]} 
                    tick={{ fontSize: 11, fill: '#9333EA' }} 
                    unit="h"
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#001D45', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#38BDF8' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine 
                    yAxisId="left" 
                    y={95.0} 
                    stroke="#EF4444" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Target SLA: 95.0%', fill: '#EF4444', fontSize: 10, position: 'insideBottomRight' }} 
                  />
                  <ReferenceLine 
                    yAxisId="right" 
                    y={168.0} 
                    stroke="#F59E0B" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Max Weekly Horizon: 168h', fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="otifPercent" 
                    name="OTIF Compliance %" 
                    stroke="#002B66" 
                    strokeWidth={2.5} 
                    dot={{ r: 3, fill: '#002B66' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="makespanHours" 
                    name="Makespan (Hours)" 
                    stroke="#9333EA" 
                    strokeWidth={2} 
                    strokeDasharray="2 2"
                    dot={{ r: 3, fill: '#9333EA' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Charts: Washdown Hours & Solvent Cost Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart A: Solvent Scrap Cost ($) Over Time */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Solvent &amp; Detergent Scrap Cost ($)</h4>
                  <p className="text-[11px] text-slate-500">Savings gained from dark-to-light pigment sequencing</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  -$20,000 / month
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendChartData.slice(-14)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="dayLabel" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#001D45', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                      formatter={(val: any) => [`$${val.toLocaleString()}`, 'Chemical Cost']}
                    />
                    <Bar dataKey="solventCostUsd" fill="#0051A5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart B: Pigment Washdown Hours Over Time */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pigment Changeover Hours per Cycle</h4>
                  <p className="text-[11px] text-slate-500">Downtime reduction on Rotary Lipstick Molders</p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Down from 21.5h to 7.5h
                </span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData.slice(-14)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="dayLabel" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis domain={[5, 25]} unit="h" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#001D45', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                      formatter={(val: any) => [`${val} Hours`, 'Washdown Duration']}
                    />
                    <Line type="monotone" dataKey="washdownHours" stroke="#7E22CE" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: LINE & CATEGORY BREAKDOWN                       */}
      {/* ======================================================== */}
      {analyticsView === 'line_category' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Performance by Product Category */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Output Volume &amp; OTIF % by Category</h3>
                  <p className="text-xs text-slate-500">Comparative fulfillment across 4 core product divisions</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `${val}k units`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#001D45', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                      formatter={(val: any, name: any) => [
                        name === 'totalUnits' ? `${val}k Units` : `${val}%`, 
                        name === 'totalUnits' ? 'Produced Volume' : 'OTIF Rate'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="totalUnits" name="Volume (k Units)" fill="#0051A5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Mini-Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                {categoryBarData.map((c) => (
                  <div key={c.category} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block truncate">{c.fullCategory}</span>
                    <div className="flex items-center justify-between text-slate-500 mt-1">
                      <span>OTIF: <strong className="text-emerald-700">{c.avgOtif}%</strong></span>
                      <span>Washdown: <strong className="text-purple-700">{c.washdownHours}h</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Line-by-Line Comparative OEE & Capacity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Line OEE (%) &amp; Operational Reliability</h3>
                  <p className="text-xs text-slate-500">Benchmark across high-speed molding and ointment filling lines</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={linePerformanceData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" domain={[85, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748B' }} width={90} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#001D45', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                      formatter={(val: any) => [`${val}%`, 'Line OEE']}
                    />
                    <Bar dataKey="oee" name="OEE Rating %" fill="#00A3E0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Detail Table */}
              <div className="space-y-1.5 pt-2 text-xs">
                {linePerformanceData.map((l) => (
                  <div key={l.name} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-800">{l.name}</span>
                    <div className="flex items-center space-x-3 text-slate-600">
                      <span>OTIF: <strong className="text-emerald-700">{l.otif}%</strong></span>
                      <span>Washdown: <strong className="text-purple-700">{l.washdown}h</strong></span>
                      <span className="font-mono text-[10px] bg-slate-200 px-1 rounded">{l.capacityKgHr} kg/h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: CHANGEOVER SEQUENCE HEATMAP                     */}
      {/* ======================================================== */}
      {analyticsView === 'sequence_matrix' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 text-xs font-bold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Sequence-Dependent Setup Duration Matrix (Hours)</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Pigment Washdown &amp; Tooling Swap Transition Heatmap
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dark pigments transitioning to pale/white require up to <strong>9.5 hours</strong> of hot-solvent flushes. Gurobi clusters matching shades together to minimize total makespan.
              </p>
            </div>
            
            {/* Heatmap Legend */}
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-slate-400">Duration:</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">&lt; 1.5h (Quick Rinse)</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded">2h - 5h (Standard CIP)</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded">&gt; 6.0h (Intense Purge)</span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold text-left w-36">
                    From \ To
                  </th>
                  {SHADES_FORMULATIONS.slice(0, 9).map((s) => (
                    <th key={s.id} className="p-2 bg-slate-50 border border-slate-200 text-slate-900 font-bold min-w-[70px]">
                      <div className="flex flex-col items-center">
                        <span className="w-3 h-3 rounded-full mb-0.5" style={{ backgroundColor: s.color }} />
                        <span className="text-[10px] font-mono">{s.id}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHADES_FORMULATIONS.slice(0, 9).map((fromShade) => (
                  <tr key={fromShade.id}>
                    <td className="p-2 bg-slate-50 border border-slate-200 text-left font-bold text-slate-800">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: fromShade.color }} />
                        <span className="truncate">{fromShade.shortName} ({fromShade.id})</span>
                      </div>
                    </td>
                    {SHADES_FORMULATIONS.slice(0, 9).map((toShade) => {
                      const hours = CHANGEOVER_MATRIX[fromShade.id]?.[toShade.id] ?? 0;
                      let bgClass = 'bg-white text-slate-700';
                      if (hours === 0) bgClass = 'bg-slate-100 text-slate-400 font-bold';
                      else if (hours <= 1.5) bgClass = 'bg-emerald-50 text-emerald-800 font-semibold';
                      else if (hours <= 5.0) bgClass = 'bg-amber-50 text-amber-800 font-semibold';
                      else bgClass = 'bg-red-50 text-red-800 font-bold';

                      return (
                        <td key={toShade.id} className={`p-2 border border-slate-200 text-xs tabular-nums ${bgClass}`}>
                          {hours.toFixed(1)}h
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: HISTORICAL PRODUCTION RUNS LEDGER (DATA TABLE)   */}
      {/* ======================================================== */}
      {analyticsView === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Historical Production Run Telemetry</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {sortedRecords.length} completed production batches across The Estée Lauder Companies prestige facilities.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by SKU, plant, line..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#002B66]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 select-none">
                <tr>
                  <th 
                    onClick={() => { setSortField('date'); setSortAsc(!sortAsc); }}
                    className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900"
                  >
                    Date
                  </th>
                  <th className="py-3 px-4 font-bold">Plant &amp; Line</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">SKU Description</th>
                  <th className="py-3 px-4 font-bold">Shift</th>
                  <th 
                    onClick={() => { setSortField('actualUnits'); setSortAsc(!sortAsc); }}
                    className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900 text-right"
                  >
                    Volume
                  </th>
                  <th 
                    onClick={() => { setSortField('otifPercent'); setSortAsc(!sortAsc); }}
                    className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900 text-right"
                  >
                    OTIF %
                  </th>
                  <th 
                    onClick={() => { setSortField('oeePercent'); setSortAsc(!sortAsc); }}
                    className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900 text-right"
                  >
                    OEE %
                  </th>
                  <th 
                    onClick={() => { setSortField('changeoverWashHours'); setSortAsc(!sortAsc); }}
                    className="py-3 px-4 font-bold cursor-pointer hover:text-slate-900 text-right"
                  >
                    Washdown
                  </th>
                  <th className="py-3 px-4 font-bold text-center">cGMP 36h</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {rec.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#002B66] block leading-tight">{rec.plantName.split(' ')[0]}</span>
                      <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[160px]">{rec.lineId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {rec.category.split('&')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] text-slate-400 block">{rec.skuCode}</span>
                      <span className="font-bold text-slate-900 block truncate max-w-[200px]">{rec.skuDescription}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap text-[11px]">
                      {rec.shift.split(' - ')[0]}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                      {rec.actualUnits.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold">
                      <span className={`px-1.5 py-0.5 rounded ${
                        rec.otifPercent >= 99.0
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.otifPercent >= 98.0
                          ? 'bg-sky-100 text-[#002B66]'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.otifPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-800">
                      {rec.oeePercent}%
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-purple-800">
                      {rec.changeoverWashHours}h
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Pass</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
