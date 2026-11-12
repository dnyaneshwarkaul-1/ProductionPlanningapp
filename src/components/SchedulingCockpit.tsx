import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Calendar, 
  Clock, 
  Zap, 
  Layers, 
  AlertTriangle, 
  ChevronRight, 
  Eye, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  Sparkles,
  Columns,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Droplet,
  ShieldCheck,
  Building,
  LineChart as LineChartIcon,
  Activity,
  Cpu,
  Move,
  GripHorizontal,
  AlertCircle,
  Check,
  FileDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  PlantId, 
  MachineId, 
  PackSize, 
  ScenarioId, 
  ScheduledJob, 
  OptimizationScenario,
  HistoricalTrendPoint,
  ShiftType
} from '../types/ppds';
import { 
  PLANTS, 
  MACHINES, 
  SHADES_FORMULATIONS, 
  SKUS, 
  BENCHMARK_JOBS, 
  OPTIMIZATION_SCENARIOS, 
  WEEK_DEMAND, 
  CAPACITY_MATRIX, 
  CHANGEOVER_MATRIX,
  HISTORICAL_30D_TRENDS
} from '../data/mockData';
import { ExportReportModal } from './ExportReportModal';

interface SchedulingCockpitProps {
  selectedPlant: PlantId;
  onSelectPlant: (p: PlantId) => void;
  activeSubView?: 'timeline' | 'side_by_side' | 'trends';
  onSubViewChange?: (view: 'timeline' | 'side_by_side' | 'trends') => void;
  onNavigateToSequencing?: () => void;
}

export const SchedulingCockpit: React.FC<SchedulingCockpitProps> = ({
  selectedPlant,
  onSelectPlant,
  activeSubView = 'timeline',
  onSubViewChange,
  onNavigateToSequencing,
}) => {
  // View mode: 'timeline' | 'side_by_side' | 'trends'
  const [internalViewMode, setInternalViewMode] = useState<'timeline' | 'side_by_side' | 'trends'>(activeSubView);
  
  // Keep in sync with parent if provided
  const viewMode = activeSubView || internalViewMode;
  const setViewMode = (v: 'timeline' | 'side_by_side' | 'trends') => {
    setInternalViewMode(v);
    onSubViewChange?.(v);
  };

  // Multi-dimensional filters
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // May
  const [selectedWeek, setSelectedWeek] = useState<number>(18);
  const [selectedLine, setSelectedLine] = useState<string>('Line 1');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedShade, setSelectedShade] = useState<string>('all');
  const [selectedPackSize, setSelectedPackSize] = useState<string>('all');
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('min_changeover');
  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null);

  // Drag-and-drop & Schedule editing state
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>(BENCHMARK_JOBS);
  const [dragState, setDragState] = useState<{
    jobId: string;
    mode: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    initialStartHour: number;
    initialEndHour: number;
    currentStartHour: number;
    currentEndHour: number;
    machineId: MachineId;
    timelineWidth: number;
  } | null>(null);
  const [ganttToast, setGanttToast] = useState<string | null>(null);

  const showGanttToast = (msg: string) => {
    setGanttToast(msg);
    setTimeout(() => setGanttToast(null), 3500);
  };

  // Schedule conflict detection (machine overlaps)
  const scheduleConflicts = useMemo(() => {
    const conflicts: Record<string, { conflictingJobCode: string; conflictingId: string; overlapHours: number; machineId: MachineId }> = {};
    MACHINES.forEach((m) => {
      const mJobs = scheduledJobs
        .filter((j) => j.machineId === m.id)
        .sort((a, b) => a.startHour - b.startHour);
      for (let i = 1; i < mJobs.length; i++) {
        const prev = mJobs[i - 1];
        const curr = mJobs[i];
        if (curr.startHour < prev.endHour) {
          const overlap = Number((prev.endHour - curr.startHour).toFixed(1));
          conflicts[curr.id] = { conflictingJobCode: prev.jobCode, conflictingId: prev.id, overlapHours: overlap, machineId: m.id };
          conflicts[prev.id] = { conflictingJobCode: curr.jobCode, conflictingId: curr.id, overlapHours: overlap, machineId: m.id };
        }
      }
    });
    return conflicts;
  }, [scheduledJobs]);

  const totalConflictCount = Object.keys(scheduleConflicts).length;

  // Auto-resolve all overlaps across the plant
  const handleAutoResolveConflicts = () => {
    setScheduledJobs((prev) => {
      const updated = prev.map((j) => ({ ...j }));
      MACHINES.forEach((m) => {
        const mJobs = updated
          .filter((j) => j.machineId === m.id)
          .sort((a, b) => a.startHour - b.startHour);
        for (let i = 1; i < mJobs.length; i++) {
          const prevJob = mJobs[i - 1];
          const currJob = mJobs[i];
          if (currJob.startHour < prevJob.endHour) {
            const duration = currJob.durationHours;
            currJob.startHour = Number(prevJob.endHour.toFixed(1));
            currJob.endHour = Number((currJob.startHour + duration).toFixed(1));
            currJob.dayAssigned = Math.min(7, Math.floor(currJob.startHour / 24) + 1);
            const hourInDay = currJob.startHour % 24;
            if (hourInDay >= 7 && hourInDay < 15.5) {
              currJob.shiftAssigned = 'Shift 1 - Day (07:00 - 15:30)';
            } else if (hourInDay >= 15.5 && hourInDay < 23.5) {
              currJob.shiftAssigned = 'Shift 2 - Swing (15:30 - 23:30)';
            } else {
              currJob.shiftAssigned = 'Shift 3 - Graveyard (23:30 - 07:00)';
            }
          }
        }
      });
      return updated;
    });
    showGanttToast('All schedule overlaps resolved! Orders cascaded chronologically.');
  };

  // Resolve conflict for a single job by shifting it downstream
  const handleResolveSingleConflict = (jobId: string) => {
    const conflict = scheduleConflicts[jobId];
    if (!conflict) return;
    setScheduledJobs((prev) => {
      const opposing = prev.find((j) => j.id === conflict.conflictingId);
      if (!opposing) return prev;
      return prev.map((j) => {
        if (j.id === jobId) {
          const newStart = Number(opposing.endHour.toFixed(1));
          const newEnd = Number((newStart + j.durationHours).toFixed(1));
          const day = Math.min(7, Math.floor(newStart / 24) + 1);
          return { ...j, startHour: newStart, endHour: newEnd, dayAssigned: day };
        }
        return j;
      });
    });
    showGanttToast(`Conflict resolved! Order shifted downstream to clear window.`);
  };

  // Reset to original mathematical benchmark
  const handleResetSchedule = () => {
    setScheduledJobs(BENCHMARK_JOBS);
    setSelectedJob(null);
    showGanttToast('Schedule restored to optimal Gurobi 11.0 benchmark.');
  };

  // Drag and drop event handlers
  const handlePointerDown = (
    e: React.PointerEvent,
    job: ScheduledJob,
    mode: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    const laneEl = (e.currentTarget.closest('.gantt-lane-track') as HTMLElement);
    const laneWidth = laneEl ? laneEl.getBoundingClientRect().width : 700;

    setDragState({
      jobId: job.id,
      mode,
      startX: e.clientX,
      initialStartHour: job.startHour,
      initialEndHour: job.endHour,
      currentStartHour: job.startHour,
      currentEndHour: job.endHour,
      machineId: job.machineId,
      timelineWidth: laneWidth,
    });
    setSelectedJob(job);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    const deltaX = e.clientX - dragState.startX;
    const timelineMax = timeZoom === '24h' ? 24 : timeZoom === '48h' ? 48 : 168;
    const hoursPerPixel = timelineMax / dragState.timelineWidth;
    const deltaHours = deltaX * hoursPerPixel;
    const snappedDelta = Math.round(deltaHours * 2) / 2; // snap to 0.5h

    const initialDuration = dragState.initialEndHour - dragState.initialStartHour;

    if (dragState.mode === 'move') {
      let newStart = Math.max(0, Math.min(timelineMax - initialDuration, dragState.initialStartHour + snappedDelta));
      newStart = Number(newStart.toFixed(1));
      const newEnd = Number((newStart + initialDuration).toFixed(1));
      setDragState((prev) => prev ? { ...prev, currentStartHour: newStart, currentEndHour: newEnd } : null);
    } else if (dragState.mode === 'resize-end') {
      let newEnd = Math.max(dragState.initialStartHour + 0.5, Math.min(timelineMax, dragState.initialEndHour + snappedDelta));
      newEnd = Number(newEnd.toFixed(1));
      setDragState((prev) => prev ? { ...prev, currentEndHour: newEnd } : null);
    } else if (dragState.mode === 'resize-start') {
      let newStart = Math.max(0, Math.min(dragState.initialEndHour - 0.5, dragState.initialStartHour + snappedDelta));
      newStart = Number(newStart.toFixed(1));
      setDragState((prev) => prev ? { ...prev, currentStartHour: newStart } : null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    const { jobId, currentStartHour, currentEndHour } = dragState;
    const duration = Number((currentEndHour - currentStartHour).toFixed(1));

    setScheduledJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const day = Math.min(7, Math.floor(currentStartHour / 24) + 1);
        const hourInDay = currentStartHour % 24;
        let shift: ShiftType = 'Shift 1 - Day (07:00 - 15:30)';
        if (hourInDay >= 15.5 && hourInDay < 23.5) {
          shift = 'Shift 2 - Swing (15:30 - 23:30)';
        } else if (hourInDay >= 23.5 || hourInDay < 7) {
          shift = 'Shift 3 - Graveyard (23:30 - 07:00)';
        }

        const updated: ScheduledJob = {
          ...j,
          startHour: currentStartHour,
          endHour: currentEndHour,
          durationHours: duration,
          dayAssigned: day,
          shiftAssigned: shift,
        };
        setSelectedJob(updated);
        return updated;
      })
    );

    showGanttToast(`Order "${jobId}" rescheduled: ${currentStartHour.toFixed(1)}h - ${currentEndHour.toFixed(1)}h (${duration}h)`);
    setDragState(null);
  };

  // Manual timing editor submission
  const handleManualUpdateJob = (
    jobId: string, 
    newStart: number, 
    newDuration: number, 
    newMachine: MachineId
  ) => {
    setScheduledJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const endHour = Number((newStart + newDuration).toFixed(1));
        const day = Math.min(7, Math.floor(newStart / 24) + 1);
        const hourInDay = newStart % 24;
        let shift: ShiftType = 'Shift 1 - Day (07:00 - 15:30)';
        if (hourInDay >= 15.5 && hourInDay < 23.5) {
          shift = 'Shift 2 - Swing (15:30 - 23:30)';
        } else if (hourInDay >= 23.5 || hourInDay < 7) {
          shift = 'Shift 3 - Graveyard (23:30 - 07:00)';
        }

        const updated: ScheduledJob = {
          ...j,
          startHour: newStart,
          endHour,
          durationHours: newDuration,
          machineId: newMachine,
          dayAssigned: day,
          shiftAssigned: shift,
        };
        setSelectedJob(updated);
        return updated;
      })
    );
    showGanttToast(`Order "${jobId}" updated manually to start at ${newStart.toFixed(1)}h on ${newMachine}.`);
  };

  // Side-by-Side comparison scenarios
  const [compareScenarioAId, setCompareScenarioAId] = useState<ScenarioId>('min_changeover');
  const [compareScenarioBId, setCompareScenarioBId] = useState<ScenarioId>('max_throughput');

  // Trend horizon filter for Recharts
  const [trendHorizonDays, setTrendHorizonDays] = useState<7 | 14 | 30>(30);

  // Time zoom for Gantt
  const [timeZoom, setTimeZoom] = useState<'24h' | '48h' | '168h'>('168h');
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [showCapacityModal, setShowCapacityModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Active scenario definition
  const activeScenario = OPTIMIZATION_SCENARIOS.find((s) => s.id === activeScenarioId) || OPTIMIZATION_SCENARIOS[0];
  const scenarioA = OPTIMIZATION_SCENARIOS.find((s) => s.id === compareScenarioAId) || OPTIMIZATION_SCENARIOS[0];
  const scenarioB = OPTIMIZATION_SCENARIOS.find((s) => s.id === compareScenarioBId) || OPTIMIZATION_SCENARIOS[1];

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return scheduledJobs.filter((job) => {
      if (selectedDay !== 'all' && job.dayAssigned !== selectedDay) return false;
      if (selectedShift !== 'all' && !job.shiftAssigned.includes(selectedShift)) return false;
      if (selectedShade !== 'all' && job.shadeId !== selectedShade) return false;
      if (selectedPackSize !== 'all' && job.packSize !== selectedPackSize) return false;
      return true;
    });
  }, [scheduledJobs, selectedDay, selectedShift, selectedShade, selectedPackSize]);

  // Filtered historical trends
  const filteredTrends = useMemo(() => {
    if (trendHorizonDays === 7) return HISTORICAL_30D_TRENDS.slice(-7);
    if (trendHorizonDays === 14) return HISTORICAL_30D_TRENDS.slice(-14);
    return HISTORICAL_30D_TRENDS;
  }, [trendHorizonDays]);

  const timelineMaxHours = timeZoom === '24h' ? 24 : timeZoom === '48h' ? 48 : 168;

  const getShadeColor = (shadeId: string) => {
    const s = SHADES_FORMULATIONS.find((sh) => sh.id === shadeId);
    return s ? s.color : '#002B66';
  };

  const exportScheduleCsv = () => {
    const headers = 'JobCode,Line,Machine,Shade,PackSize,SKU,StartHour,EndHour,DurationHours,Units,Kg,Status,Shift,Day';
    const rows = filteredJobs.map((j) => 
      `"${j.jobCode}","${j.lineId}","${j.machineId}","${j.shadeId}","${j.packSize}","${j.skuCode}",${j.startHour},${j.endHour},${j.durationHours},${j.productionUnits},${j.productionKg},"${j.status}","${j.shiftAssigned}",${j.dayAssigned}`
    ).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KC_${selectedPlant}_W${selectedWeek}_Schedule.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. TOP CONTROLS & SUB-MENU BAR */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#002B66]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              North America Personal Care &amp; Healthcare Cockpit
            </h2>
            <span className="text-[11px] text-[#002B66] bg-sky-50 px-2 py-0.5 rounded font-mono font-medium">
              Plant × SKU × Line × Month × Day × Shift
            </span>
          </div>

          {/* Sub-Menu Navigation: Timeline vs Compare vs 30-Day Trends */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-semibold">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Gantt Timeline</span>
              </button>
              
              <button
                onClick={() => setViewMode('side_by_side')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'side_by_side'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Compare Scenarios</span>
              </button>

              <button
                onClick={() => setViewMode('trends')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'trends'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>30-Day Trends (Recharts)</span>
              </button>
            </div>

            {onNavigateToSequencing && (
              <button
                onClick={onNavigateToSequencing}
                className="text-xs font-bold px-3 py-1.5 text-white bg-[#002B66] hover:bg-[#001D45] rounded-md transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                title="Open Sequencing Engine Workflow (Input -> Processing -> Output)"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-300" />
                <span>Sequencing Engine Workflow</span>
              </button>
            )}

            <button
              onClick={() => setShowCapacityModal(true)}
              className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors hidden sm:block"
            >
              Speeds Matrix
            </button>
            <button
              onClick={() => setShowMatrixModal(true)}
              className="text-xs font-semibold px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors hidden sm:block"
            >
              F2F Matrix
            </button>
            <button
              onClick={exportScheduleCsv}
              className="text-xs font-semibold px-2.5 py-1 text-[#002B66] bg-sky-100 hover:bg-sky-200 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
              title="Download raw tabular schedule as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="text-xs font-bold px-2.5 py-1 text-white bg-[#002B66] hover:bg-[#001D45] rounded-md transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
              title="Download presentation-ready schedule report (PDF/CSV)"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-300" />
              <span>Export Dossier (PDF)</span>
            </button>
          </div>
        </div>

        {/* Multi-Dimensional Filter Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          
          {/* Plant */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Manufacturing Site
            </label>
            <select
              value={selectedPlant}
              onChange={(e) => onSelectPlant(e.target.value as PlantId)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-1.5 focus:ring-1 focus:ring-[#002B66]"
            >
              {PLANTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.city}, {p.state}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Month (Q2)
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-1.5 focus:ring-1 focus:ring-[#002B66]"
            >
              <option value={4}>April</option>
              <option value={5}>May (Peak Run)</option>
              <option value={6}>June (Clinical Run)</option>
            </select>
          </div>

          {/* Week */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Production Week
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-1.5 focus:ring-1 focus:ring-[#002B66]"
            >
              <option value={18}>Week 18 (Current Schedule)</option>
              <option value={19}>Week 19 (Promo Pre-Build)</option>
              <option value={20}>Week 20 (Clinical Zinc Run)</option>
            </select>
          </div>

          {/* Line */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Production Line
            </label>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-1.5 focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="Line 1">Line 1 (Lipstick &amp; Molding)</option>
              <option value="Line 2">Line 2 (Hot-Pour Balms)</option>
              <option value="Line 3">Line 3 (Medical Salve)</option>
            </select>
          </div>

          {/* Day */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Day Horizon
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-1.5 focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="all">Full Week (Day 1 - 7)</option>
              <option value={1}>Day 1 (Mon - Ruby Red)</option>
              <option value={2}>Day 2 (Tue - cGMP 36h)</option>
              <option value={3}>Day 3 (Wed - Berry Plum)</option>
              <option value={4}>Day 4 (Thu - Coral Peach)</option>
              <option value={5}>Day 5 (Fri - Mauve)</option>
              <option value={6}>Day 6 (Sat - Medicated)</option>
              <option value={7}>Day 7 (Sun - Zinc Salve)</option>
            </select>
          </div>

          {/* Shift */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Operating Shift
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-1.5 focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="all">All Shifts (24 Hours)</option>
              <option value="Shift 1">Shift 1 - Day (07:00 - 15:30)</option>
              <option value="Shift 2">Shift 2 - Swing (15:30 - 23:30)</option>
              <option value="Shift 3">Shift 3 - Graveyard (23:30 - 07:00)</option>
            </select>
          </div>

          {/* Shade Recipe */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Color Shade / Form
            </label>
            <select
              value={selectedShade}
              onChange={(e) => setSelectedShade(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-1.5 focus:ring-1 focus:ring-[#002B66]"
            >
              <option value="all">All Shades (s1 - s9)</option>
              {SHADES_FORMULATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} - {s.shortName}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. RECHARTS 30-DAY HISTORICAL OTIF & MAKESPAN TREND CHART (Requested)  */}
      {/* ==================================================================== */}
      {viewMode === 'trends' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Trend Header & Horizon Switcher */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#002B66]" />
                  <h3 className="text-base font-bold text-slate-900">
                    30-Day Solver Performance &amp; OTIF vs Makespan Analytics
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tracking Gurobi MILP optimization convergence, Customer Service Level (OTIF %), and Total Makespan reduction over the last 30 operational days.
                </p>
              </div>

              {/* Horizon Toggle */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <span className="text-[10px] text-slate-500 uppercase px-1">Horizon:</span>
                <button
                  onClick={() => setTrendHorizonDays(7)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    trendHorizonDays === 7 ? 'bg-[#002B66] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setTrendHorizonDays(14)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    trendHorizonDays === 14 ? 'bg-[#002B66] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Last 14 Days
                </button>
                <button
                  onClick={() => setTrendHorizonDays(30)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    trendHorizonDays === 30 ? 'bg-[#002B66] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full 30 Days
                </button>
              </div>
            </div>

            {/* 4 Summary Scorecards for Trends */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
                <span className="text-[10px] font-bold text-[#002B66] uppercase block">Average OTIF Service Level</span>
                <p className="text-xl font-extrabold text-[#002B66] mt-0.5 tabular-nums">97.2%</p>
                <span className="text-[10px] text-emerald-600 font-bold">▲ +5.6% vs 30 days ago</span>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <span className="text-[10px] font-bold text-purple-900 uppercase block">Average Weekly Makespan</span>
                <p className="text-xl font-extrabold text-purple-900 mt-0.5 tabular-nums">155.8h</p>
                <span className="text-[10px] text-emerald-600 font-bold">▼ -23.9h reduction</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block">Average Solver Speed</span>
                <p className="text-xl font-extrabold text-emerald-800 mt-0.5 tabular-nums">2.2s</p>
                <span className="text-[10px] text-slate-500">Gurobi 11.0 Presolve</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Total Solvent Scrap Saved</span>
                <p className="text-xl font-extrabold text-amber-950 mt-0.5 tabular-nums">$31,400</p>
                <span className="text-[10px] text-emerald-700 font-bold">42% waste reduction</span>
              </div>
            </div>

            {/* Recharts Dual-Axis Line Chart */}
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredTrends}
                  margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  
                  <XAxis 
                    dataKey="dayLabel" 
                    tick={{ fontSize: 11, fill: '#64748B' }} 
                    stroke="#CBD5E1"
                  />
                  
                  {/* Left Axis: OTIF % */}
                  <YAxis
                    yAxisId="left"
                    domain={[92, 101]}
                    tick={{ fontSize: 11, fill: '#002B66' }}
                    stroke="#002B66"
                    unit="%"
                  />
                  
                  {/* Right Axis: Makespan Hours */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[140, 172]}
                    tick={{ fontSize: 11, fill: '#7C3AED' }}
                    stroke="#7C3AED"
                    unit="h"
                  />

                  {/* Reference Line for Target DIFC 95% */}
                  <ReferenceLine
                    yAxisId="left"
                    y={95.0}
                    label={{ value: 'Target DIFC SLA (95%)', fill: '#0D9488', fontSize: 10, position: 'insideTopLeft' }}
                    stroke="#0D9488"
                    strokeDasharray="4 4"
                  />

                  {/* Reference Line for Stretch Target 98% */}
                  <ReferenceLine
                    yAxisId="left"
                    y={98.0}
                    label={{ value: 'Stretch SLA (98%)', fill: '#059669', fontSize: 10, position: 'insideTopRight' }}
                    stroke="#059669"
                    strokeDasharray="4 4"
                  />

                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as HistoricalTrendPoint;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1">
                            <p className="font-bold text-sky-300">{data.date} ({data.dayLabel})</p>
                            <p className="flex justify-between space-x-3">
                              <span className="text-slate-400">Customer OTIF:</span>
                              <span className="font-bold text-emerald-400">{data.otifPercent}%</span>
                            </p>
                            <p className="flex justify-between space-x-3">
                              <span className="text-slate-400">Makespan:</span>
                              <span className="font-bold text-purple-300">{data.makespanHours}h</span>
                            </p>
                            <p className="flex justify-between space-x-3">
                              <span className="text-slate-400">Washdown Setup:</span>
                              <span className="font-bold text-amber-300">{data.washdownHours}h</span>
                            </p>
                            <p className="flex justify-between space-x-3">
                              <span className="text-slate-400">Solvent Cost:</span>
                              <span className="font-bold text-slate-200">${data.solventCostUsd.toLocaleString()}</span>
                            </p>
                            <p className="flex justify-between space-x-3 text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                              <span>Solver Runtime:</span>
                              <span>{data.solverRunSeconds}s</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                  />

                  {/* Line 1: OTIF % */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="otifPercent"
                    name="Customer OTIF % (Left Axis)"
                    stroke="#002B66"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#002B66' }}
                    activeDot={{ r: 6, fill: '#00A3E0' }}
                  />

                  {/* Line 2: Makespan Hours */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="makespanHours"
                    name="Total Makespan Hours (Right Axis)"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={{ r: 2.5, fill: '#7C3AED' }}
                  />

                  {/* Line 3: Washdown Hours */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="washdownHours"
                    name="Washdown Hours (Right Axis)"
                    stroke="#E11D48"
                    strokeWidth={1.5}
                    dot={false}
                  />

                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Insights */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-900">Key Performance Observation: </span>
              Between Day -30 and Day 0, mathematical grouping of dark dye lakes (Ruby Red &amp; Burgundy Matte) decreased weekly washdown hours by <strong>65% (from 21.5h to 7.5h)</strong>. This lifted North America customer OTIF from <strong>94.2% to 99.8%</strong> without adding shift overtime.
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. SIDE-BY-SIDE SCENARIO COMPARISON VIEW                             */}
      {/* ==================================================================== */}
      {viewMode === 'side_by_side' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Comparison Selector Bar */}
          <div className="bg-gradient-to-r from-[#002B66] via-[#003882] to-[#001D45] text-white rounded-xl p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Columns className="w-5 h-5 text-sky-300" />
                  <h3 className="text-base font-extrabold text-white">
                    Side-by-Side Optimization Scenario Comparator
                  </h3>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  Evaluate trade-offs between cleanout washdown hours, makespan, solvent cost, and customer service level (OTIF).
                </p>
              </div>

              {/* Dual Selectors */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-lg border border-white/20">
                  <span className="text-[11px] font-bold text-sky-200">Scenario A:</span>
                  <select
                    value={compareScenarioAId}
                    onChange={(e) => setCompareScenarioAId(e.target.value as ScenarioId)}
                    className="text-xs font-bold text-slate-900 bg-white rounded px-2.5 py-1 focus:ring-1 focus:ring-sky-400"
                  >
                    {OPTIMIZATION_SCENARIOS.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.title}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs font-black text-sky-300">VS</span>

                <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-lg border border-white/20">
                  <span className="text-[11px] font-bold text-sky-200">Scenario B:</span>
                  <select
                    value={compareScenarioBId}
                    onChange={(e) => setCompareScenarioBId(e.target.value as ScenarioId)}
                    className="text-xs font-bold text-slate-900 bg-white rounded px-2.5 py-1 focus:ring-1 focus:ring-sky-400"
                  >
                    {OPTIMIZATION_SCENARIOS.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Metrics Delta Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Makespan</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-extrabold text-[#002B66]">{scenarioA.kpis.totalMakespanHours}h</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-extrabold text-slate-800">{scenarioB.kpis.totalMakespanHours}h</span>
              </div>
              <span className={`text-[10px] font-bold block mt-1 ${
                scenarioA.kpis.totalMakespanHours <= scenarioB.kpis.totalMakespanHours ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {(scenarioA.kpis.totalMakespanHours - scenarioB.kpis.totalMakespanHours).toFixed(1)}h difference
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Washdown Hours</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-extrabold text-[#002B66]">{scenarioA.kpis.changeoverWashHours}h</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-extrabold text-slate-800">{scenarioB.kpis.changeoverWashHours}h</span>
              </div>
              <span className={`text-[10px] font-bold block mt-1 ${
                scenarioA.kpis.changeoverWashHours <= scenarioB.kpis.changeoverWashHours ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {scenarioA.kpis.changeoverWashHours < scenarioB.kpis.changeoverWashHours ? '-42% solvent downtime' : '+higher setup load'}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer OTIF %</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-extrabold text-emerald-700">{scenarioA.kpis.serviceLevelOtifPercent}%</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-extrabold text-emerald-700">{scenarioB.kpis.serviceLevelOtifPercent}%</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Retail DIFC safety target: 95%
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Solvent &amp; Scrap</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-extrabold text-[#002B66]">${(scenarioA.kpis.solventScrapCostUsd / 1000).toFixed(1)}k</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-extrabold text-slate-800">${(scenarioB.kpis.solventScrapCostUsd / 1000).toFixed(1)}k</span>
              </div>
              <span className={`text-[10px] font-bold block mt-1 ${
                scenarioA.kpis.solventScrapCostUsd <= scenarioB.kpis.solventScrapCostUsd ? 'text-emerald-600' : 'text-red-600'
              }`}>
                Δ ${Math.abs(scenarioA.kpis.solventScrapCostUsd - scenarioB.kpis.solventScrapCostUsd).toLocaleString()}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Energy (kWh)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-extrabold text-[#002B66]">{(scenarioA.kpis.energyConsumptionKwh / 1000).toFixed(1)}k</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-extrabold text-slate-800">{(scenarioB.kpis.energyConsumptionKwh / 1000).toFixed(1)}k</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Kettle melting efficiency
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Line 1 OEE %</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-extrabold text-[#002B66]">{scenarioA.kpis.oeePercent}%</span>
                <span className="text-xs text-slate-400">vs</span>
                <span className="text-sm font-extrabold text-slate-800">{scenarioB.kpis.oeePercent}%</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                {(scenarioA.kpis.oeePercent - scenarioB.kpis.oeePercent).toFixed(1)}% OEE delta
              </span>
            </div>

          </div>

          {/* Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 border-2 border-[#002B66] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-[#002B66]">
                    SCENARIO A ({scenarioA.badge})
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{scenarioA.title}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {scenarioA.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{scenarioA.description}</p>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans">Objective Function:</span>
                <span className="text-sky-900 font-bold">{scenarioA.solverStrategy}</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-emerald-700 text-xs block mb-1">Key Advantages:</span>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    {scenarioA.tradeOffHighlights.pros.map((p, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-amber-700 text-xs block mb-1">Operational Trade-Offs:</span>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    {scenarioA.tradeOffHighlights.cons.map((c, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-slate-300 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                    SCENARIO B ({scenarioB.badge})
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{scenarioB.title}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {scenarioB.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{scenarioB.description}</p>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans">Objective Function:</span>
                <span className="text-purple-950 font-bold">{scenarioB.solverStrategy}</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="font-bold text-emerald-700 text-xs block mb-1">Key Advantages:</span>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    {scenarioB.tradeOffHighlights.pros.map((p, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-amber-700 text-xs block mb-1">Operational Trade-Offs:</span>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    {scenarioB.tradeOffHighlights.cons.map((c, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. GANTT TIMELINE SCHEDULE VIEW                                      */}
      {/* ==================================================================== */}
      {viewMode === 'timeline' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Active Scenario Selector & Quick KPI Row */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Active Strategy: {activeScenario.badge}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">{activeScenario.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{activeScenario.tagline}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">Solver Plan:</span>
                <select
                  value={activeScenarioId}
                  onChange={(e) => setActiveScenarioId(e.target.value as ScenarioId)}
                  className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-[#002B66]"
                >
                  {OPTIMIZATION_SCENARIOS.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.title} ({sc.badge})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Makespan</span>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums">{activeScenario.kpis.totalMakespanHours}h</p>
                <span className="text-[10px] text-slate-500">168h Max Horizon</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Washdown Setup</span>
                <p className="text-lg font-extrabold text-[#002B66] mt-0.5 tabular-nums">{activeScenario.kpis.changeoverWashHours}h</p>
                <span className="text-[10px] text-emerald-600 font-bold">-42% vs unsorted</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Customer OTIF</span>
                <p className="text-lg font-extrabold text-emerald-700 mt-0.5 tabular-nums">{activeScenario.kpis.serviceLevelOtifPercent}%</p>
                <span className="text-[10px] text-emerald-600">High service SLA</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Line 1 OEE %</span>
                <p className="text-lg font-extrabold text-[#002B66] mt-0.5 tabular-nums">{activeScenario.kpis.oeePercent}%</p>
                <span className="text-[10px] text-sky-700 font-semibold">+5.4% improvement</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Solvent &amp; Scrap</span>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums">${(activeScenario.kpis.solventScrapCostUsd / 1000).toFixed(1)}k</p>
                <span className="text-[10px] text-slate-500">Controlled purge cost</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">FDA cGMP Clean</span>
                <p className="text-lg font-extrabold text-sky-800 mt-0.5 tabular-nums">{activeScenario.kpis.sanitationHours}h</p>
                <span className="text-[10px] text-emerald-600 font-bold">100% compliant</span>
              </div>
            </div>
          </div>

          {/* Interactive Gantt Timeline with Drag & Drop */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            
            {/* Toast for Gantt actions */}
            {ganttToast && (
              <div className="p-3 bg-[#002B66] text-white rounded-lg shadow-md text-xs font-semibold flex items-center justify-between border border-sky-400 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{ganttToast}</span>
                </div>
                <button onClick={() => setGanttToast(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Active Schedule Conflict Alert Banner */}
            {totalConflictCount > 0 && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      ⚠️ Schedule Conflict Detected ({totalConflictCount} order overlap{totalConflictCount > 1 ? 's' : ''})
                    </h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Two or more production orders are scheduled simultaneously on the same machine station. Planners can drag orders horizontally to reschedule or click Auto-Resolve.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleAutoResolveConflicts}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-Resolve All Conflicts</span>
                  </button>
                  <button
                    onClick={handleResetSchedule}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            )}

            {/* Gantt Top Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#002B66]" />
                  <span>Personal Care &amp; Healthcare Production Schedule (Week {selectedWeek} • Line 1)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                  <span>Interactive Drag &amp; Drop Enabled: Grab order body to move • Drag edges ◀ ▶ to resize.</span>
                </p>
              </div>

              {/* Time Zoom & Benchmark Reset Controls */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <button
                  onClick={handleResetSchedule}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  title="Reset to mathematical Gurobi benchmark"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Baseline</span>
                </button>

                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setTimeZoom('24h')}
                    className={`px-2 py-1 rounded ${timeZoom === '24h' ? 'bg-white text-[#002B66] shadow-xs' : 'text-slate-600'}`}
                  >
                    24h
                  </button>
                  <button
                    onClick={() => setTimeZoom('48h')}
                    className={`px-2 py-1 rounded ${timeZoom === '48h' ? 'bg-white text-[#002B66] shadow-xs' : 'text-slate-600'}`}
                  >
                    48h (+ cGMP)
                  </button>
                  <button
                    onClick={() => setTimeZoom('168h')}
                    className={`px-2 py-1 rounded ${timeZoom === '168h' ? 'bg-white text-[#002B66] shadow-xs' : 'text-slate-600'}`}
                  >
                    7-Day (168h)
                  </button>
                </div>
              </div>
            </div>

            {/* Legend Bar & Drag Instructions */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Shades:</span>
                {SHADES_FORMULATIONS.slice(0, 6).map((sh) => (
                  <div key={sh.id} className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: sh.color }} />
                    <span className="text-[11px] text-slate-700 font-medium">{sh.shortName}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-300">
                  <span className="w-3.5 h-2.5 bg-hatch-pattern rounded-xs border border-red-400" />
                  <span className="text-[11px] text-red-700 font-bold">Washdown</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-2.5 bg-sanitation-pattern rounded-xs border border-sky-400" />
                  <span className="text-[11px] text-sky-800 font-bold">FDA cGMP 36h</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                <Move className="w-3.5 h-3.5 text-[#002B66]" />
                <span>Snap grid: 0.5h increments</span>
              </div>
            </div>

            {/* Gantt Viewport with Global Pointer Handlers */}
            <div 
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-900 text-white relative select-none"
            >
              
              <div className="min-w-[900px] border-b border-slate-800 bg-slate-950 p-2 flex text-xs font-mono">
                <div className="w-52 shrink-0 font-bold text-slate-400 pl-2">Station / Machine</div>
                <div className="flex-1 flex justify-between px-2 text-[11px] text-slate-400">
                  {timeZoom === '168h' ? (
                    <>
                      <span>Mon (Day 1)</span>
                      <span>Tue (Day 2 • cGMP)</span>
                      <span>Wed (Day 3)</span>
                      <span>Thu (Day 4)</span>
                      <span>Fri (Day 5)</span>
                      <span>Sat (Day 6)</span>
                      <span>Sun (Day 7)</span>
                    </>
                  ) : timeZoom === '48h' ? (
                    <>
                      <span>07:00 Mon</span>
                      <span>19:00</span>
                      <span>07:00 Tue</span>
                      <span>19:00</span>
                      <span>cGMP 36H Clean</span>
                    </>
                  ) : (
                    <>
                      <span>Shift 1 (07:00 - 15:30)</span>
                      <span>Shift 2 (15:30 - 23:30)</span>
                      <span>Shift 3 (23:30 - 07:00)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Machine Lanes */}
              <div className="min-w-[900px] divide-y divide-slate-800/80">
                {MACHINES.map((machine) => {
                  const machineJobs = filteredJobs.filter((j) => j.machineId === machine.id);

                  return (
                    <div key={machine.id} className="flex items-center h-18 hover:bg-slate-800/40 transition-colors">
                      <div className="w-52 shrink-0 px-3 border-r border-slate-800">
                        <p className="text-xs font-bold text-slate-200 truncate">{machine.name.split('(')[0]}</p>
                        <p className="text-[10px] text-slate-400 truncate">{machine.category}</p>
                        <p className="text-[9px] font-mono text-sky-400">{machine.currentSpeedUnitsHr.toLocaleString()} units/h</p>
                      </div>

                      <div className="gantt-lane-track flex-1 h-full relative p-1.5 flex items-center">
                        {timeZoom === '168h' && (
                          <div className="absolute inset-0 pointer-events-none flex">
                            {[1, 2, 3, 4, 5, 6].map((dayIdx) => (
                              <div
                                key={dayIdx}
                                className="h-full border-r border-slate-800/50"
                                style={{ left: `${(dayIdx * 24 / 168) * 100}%`, position: 'absolute' }}
                              />
                            ))}
                          </div>
                        )}

                        {machineJobs.map((job) => {
                          const isDragging = dragState?.jobId === job.id;
                          const effectiveStart = isDragging ? dragState.currentStartHour : job.startHour;
                          const effectiveEnd = isDragging ? dragState.currentEndHour : job.endHour;
                          const effectiveDuration = Number((effectiveEnd - effectiveStart).toFixed(1));

                          const leftPercent = Math.max(0, Math.min(100, (effectiveStart / timelineMaxHours) * 100));
                          const widthPercent = Math.max(1.5, Math.min(100 - leftPercent, (effectiveDuration / timelineMaxHours) * 100));

                          if (effectiveStart >= timelineMaxHours) return null;

                          const isSelected = selectedJob?.id === job.id;
                          const conflictInfo = scheduleConflicts[job.id];
                          const hasConflict = !!conflictInfo;

                          if (job.isChangeover) {
                            return (
                              <div
                                key={job.id}
                                onPointerDown={(e) => handlePointerDown(e, job, 'move')}
                                onClick={() => setSelectedJob(job)}
                                style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                                className={`absolute h-11 rounded-xs bg-hatch-pattern border cursor-grab active:cursor-grabbing transition-shadow z-10 flex items-center justify-between px-1 ${
                                  hasConflict
                                    ? 'border-amber-400 ring-2 ring-amber-400/80 animate-pulse'
                                    : isSelected
                                    ? 'border-red-400 ring-2 ring-red-400'
                                    : 'border-red-500/80 hover:ring-1 hover:ring-red-400'
                                } ${isDragging ? 'shadow-2xl z-30 scale-105 opacity-90' : ''}`}
                                title={`Washdown: ${job.skuDescription} (${effectiveDuration}h)`}
                              >
                                {/* Left resize handle */}
                                <div
                                  onPointerDown={(e) => handlePointerDown(e, job, 'resize-start')}
                                  className="w-2 h-full hover:bg-white/30 cursor-ew-resize flex items-center justify-center text-[7px] text-white/70"
                                  title="Resize start time"
                                >
                                  ◀
                                </div>
                                <span className="text-[9px] font-bold text-red-100 truncate px-0.5">
                                  Wash ({effectiveDuration}h)
                                </span>
                                {/* Right resize handle */}
                                <div
                                  onPointerDown={(e) => handlePointerDown(e, job, 'resize-end')}
                                  className="w-2 h-full hover:bg-white/30 cursor-ew-resize flex items-center justify-center text-[7px] text-white/70"
                                  title="Resize end time"
                                >
                                  ▶
                                </div>
                              </div>
                            );
                          }

                          if (job.isSanitationBreak) {
                            return (
                              <div
                                key={job.id}
                                onPointerDown={(e) => handlePointerDown(e, job, 'move')}
                                onClick={() => setSelectedJob(job)}
                                style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                                className={`absolute h-11 rounded-xs bg-sanitation-pattern border border-sky-400 cursor-grab active:cursor-grabbing transition-shadow z-10 flex items-center justify-between px-1 ${
                                  isSelected ? 'ring-2 ring-sky-300' : 'hover:ring-1 hover:ring-sky-300'
                                } ${isDragging ? 'shadow-2xl z-30 scale-105 opacity-90' : ''}`}
                                title={`Sanitation: ${job.skuDescription}`}
                              >
                                <span className="text-[9px] font-bold text-sky-100 truncate px-1">
                                  FDA cGMP 36H ({effectiveDuration}h)
                                </span>
                              </div>
                            );
                          }

                          const shadeColor = getShadeColor(job.shadeId);

                          return (
                            <div
                              key={job.id}
                              onPointerDown={(e) => handlePointerDown(e, job, 'move')}
                              onClick={() => setSelectedJob(job)}
                              style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                                backgroundColor: shadeColor,
                              }}
                              className={`group absolute h-12 rounded-xs border p-1 cursor-grab active:cursor-grabbing transition-all hover:z-20 shadow-xs flex flex-col justify-between overflow-visible ${
                                hasConflict
                                  ? 'border-red-400 ring-2 ring-red-500 animate-pulse z-25'
                                  : isSelected
                                  ? 'border-white ring-2 ring-white scale-[1.01] z-30'
                                  : 'border-white/20 hover:border-white/60'
                              } ${isDragging ? 'shadow-2xl z-40 scale-105 ring-2 ring-sky-300 opacity-95' : ''}`}
                              title={`${job.shadeId} | ${job.packSize} | ${effectiveStart.toFixed(1)}h - ${effectiveEnd.toFixed(1)}h`}
                            >
                              {/* Left Resize Handle */}
                              <div
                                onPointerDown={(e) => handlePointerDown(e, job, 'resize-start')}
                                className="absolute left-0 top-0 bottom-0 w-2.5 hover:bg-white/40 cursor-ew-resize flex items-center justify-center text-[7px] text-white/80 select-none z-20 rounded-l-xs"
                                title="Drag left edge to adjust order start time"
                              >
                                ◀
                              </div>

                              {/* Live Dragging Tooltip Badge */}
                              {isDragging && (
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#001D45] text-sky-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-xl border border-sky-400 z-50 pointer-events-none">
                                  ↔ {effectiveStart.toFixed(1)}h - {effectiveEnd.toFixed(1)}h ({effectiveDuration}h)
                                </div>
                              )}

                              {/* Conflict Warning Indicator */}
                              {hasConflict && !isDragging && (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResolveSingleConflict(job.id);
                                  }}
                                  className="absolute -top-3.5 right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-xs shadow-md border border-white/40 flex items-center space-x-0.5 cursor-pointer hover:bg-red-700 z-30"
                                  title="Click to auto-resolve this conflict"
                                >
                                  <span>⚠️ Overlap {conflictInfo.overlapHours}h</span>
                                </div>
                              )}

                              {/* Header info */}
                              <div className="flex items-center justify-between text-[10px] font-bold text-white leading-none px-1.5 pointer-events-none">
                                <span className="truncate">{job.shadeId}-{job.packSize}</span>
                                <span className="font-mono text-[9px] opacity-90">{effectiveDuration.toFixed(1)}h</span>
                              </div>

                              {/* Footer volume / job code */}
                              <div className="flex items-center justify-between text-[9px] font-mono text-white/90 truncate leading-none px-1.5 pointer-events-none">
                                <span className="truncate font-semibold">{job.jobCode}</span>
                                <span>{job.productionUnits > 0 ? `${(job.productionUnits / 1000).toFixed(0)}k` : `${job.productionKg}kg`}</span>
                              </div>

                              {/* Right Resize Handle */}
                              <div
                                onPointerDown={(e) => handlePointerDown(e, job, 'resize-end')}
                                className="absolute right-0 top-0 bottom-0 w-2.5 hover:bg-white/40 cursor-ew-resize flex items-center justify-center text-[7px] text-white/80 select-none z-20 rounded-r-xs"
                                title="Drag right edge to adjust order duration / end time"
                              >
                                ▶
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Selected Job Detailed Inspector Drawer with Manual Time & Conflict Controls */}
            {selectedJob && (
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs animate-in fade-in duration-200 space-y-3">
                
                {/* Header & Close */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-sky-200/60 gap-2">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-mono font-bold text-[#002B66] text-sm">{selectedJob.jobCode}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedJob.isChangeover 
                        ? 'bg-red-100 text-red-800' 
                        : selectedJob.isSanitationBreak
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedJob.isChangeover ? 'Pigment Washdown' : selectedJob.isSanitationBreak ? 'FDA cGMP Clean' : 'Production Batch'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="font-semibold text-slate-800">{selectedJob.skuDescription}</span>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>

                {/* If selected job has a conflict, display instant resolver */}
                {scheduleConflicts[selectedJob.id] && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-red-900">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="font-bold">
                        Schedule Overlap Conflict: Overlaps with {scheduleConflicts[selectedJob.id].conflictingJobCode} by {scheduleConflicts[selectedJob.id].overlapHours} hours on {selectedJob.machineId}.
                      </span>
                    </div>
                    <button
                      onClick={() => handleResolveSingleConflict(selectedJob.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-xs shrink-0 transition-colors"
                    >
                      Resolve Conflict (Push Downstream)
                    </button>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-slate-700">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Machine / Station:</span>
                    <p className="font-bold text-slate-900">{selectedJob.machineId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Scheduled Timeline:</span>
                    <p className="font-mono font-bold text-[#002B66]">{selectedJob.startHour.toFixed(1)}h - {selectedJob.endHour.toFixed(1)}h ({selectedJob.durationHours.toFixed(1)}h)</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Volume:</span>
                    <p className="font-mono font-bold text-slate-900">{selectedJob.productionUnits.toLocaleString()} units</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Shift Assigned:</span>
                    <p className="font-semibold text-slate-900">{selectedJob.shiftAssigned.split(' - ')[0]} (Day {selectedJob.dayAssigned})</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Process Compliance:</span>
                    <p className="font-bold text-emerald-700">{selectedJob.complianceScore}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">FDA Monograph:</span>
                    <p className="font-semibold text-sky-800">USP Title 21 Clean</p>
                  </div>
                </div>

                {/* Manual Timing Adjustment Controls */}
                <div className="p-3 bg-white rounded-lg border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2 text-slate-600 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-[#002B66]" />
                    <span>Fine-Tune Timing / Reassign Station:</span>
                  </div>

                  <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-500 text-[11px]">Start:</span>
                      <input
                        type="number"
                        min="0"
                        max="168"
                        step="0.5"
                        defaultValue={selectedJob.startHour}
                        id={`input-start-${selectedJob.id}`}
                        className="w-16 p-1 border border-slate-300 rounded text-center font-mono font-bold text-[#002B66]"
                      />
                      <span className="text-slate-400 text-[10px]">h</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-slate-500 text-[11px]">Duration:</span>
                      <input
                        type="number"
                        min="0.5"
                        max="72"
                        step="0.5"
                        defaultValue={selectedJob.durationHours}
                        id={`input-dur-${selectedJob.id}`}
                        className="w-16 p-1 border border-slate-300 rounded text-center font-mono font-bold text-slate-800"
                      />
                      <span className="text-slate-400 text-[10px]">h</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-slate-500 text-[11px]">Station:</span>
                      <select
                        defaultValue={selectedJob.machineId}
                        id={`select-mach-${selectedJob.id}`}
                        className="p-1 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                      >
                        {MACHINES.map((m) => (
                          <option key={m.id} value={m.id}>{m.name.split(' - ')[0]}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const startEl = document.getElementById(`input-start-${selectedJob.id}`) as HTMLInputElement;
                        const durEl = document.getElementById(`input-dur-${selectedJob.id}`) as HTMLInputElement;
                        const machEl = document.getElementById(`select-mach-${selectedJob.id}`) as HTMLSelectElement;
                        if (startEl && durEl && machEl) {
                          handleManualUpdateJob(
                            selectedJob.id,
                            Number(startEl.value),
                            Number(durEl.value),
                            machEl.value as MachineId
                          );
                        }
                      }}
                      className="px-3 py-1 bg-[#002B66] hover:bg-[#001D45] text-white font-bold rounded shadow-xs transition-colors"
                    >
                      Update Timing
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Demand vs Production Reconciliation Table */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Commercial Demand vs Actual Production Reconciliation (Week {selectedWeek})
                </h3>
                <p className="text-xs text-slate-500">
                  Reconciliation across global prestige finished goods (Pure Color Envy Lipsticks, Crystal Balms, and ANR Skincare).
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                {WEEK_DEMAND.length} Product Formats
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Formulation / Shade</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Pack Format</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">Actual Output (Units)</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">Commercial Demand (Units)</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">GAP (Units)</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 text-right">OTIF Service Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {WEEK_DEMAND.map((row, idx) => {
                    const isUnder = row.gapUnits < 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900 flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getShadeColor(row.shadeId) }} />
                          <span>{row.shadeId} ({row.shadeName})</span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#002B66]">{row.packSize}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{row.actualProductionUnits.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-600">{row.demandUnits.toLocaleString()}</td>
                        <td className={`py-2 px-3 text-right tabular-nums font-bold ${isUnder ? 'text-red-600' : 'text-emerald-700'}`}>
                          {row.gapUnits > 0 ? `+${row.gapUnits.toLocaleString()}` : row.gapUnits.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-bold text-emerald-700">
                          {row.serviceLevelOtifPercent.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Speed Capacity Matrix Modal */}
      {showCapacityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">Machine Rated Speed Matrix (Units / Hour)</h3>
              <button
                onClick={() => setShowCapacityModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-2 px-3 text-left font-bold text-slate-700">Pack Format</th>
                    <th className="py-2 px-3 text-right font-bold text-[#002B66]">Kettle 1</th>
                    <th className="py-2 px-3 text-right font-bold text-[#002B66]">M1 Rotary</th>
                    <th className="py-2 px-3 text-right font-bold text-[#002B66]">M2 Hot-Pour</th>
                    <th className="py-2 px-3 text-right font-bold text-sky-800">M3 Sleever</th>
                    <th className="py-2 px-3 text-right font-bold text-sky-800">P1 Bulk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(CAPACITY_MATRIX).map(([size, speeds]) => (
                    <tr key={size} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{size}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{speeds.Kettle1.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{speeds.Machine1.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{speeds.Machine2.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold text-sky-800">{speeds.Machine3.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums font-semibold text-sky-800">{speeds.Portion1.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowCapacityModal(false)}
                className="px-4 py-1.5 bg-[#002B66] text-white rounded-md text-xs font-semibold"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pigment Washdown Matrix Modal */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sequence-Dependent Pigment Washdown Matrix (Hours)</h3>
                <p className="text-xs text-slate-500">Intense Lake Dyes (Carnal Red &amp; Statement Berry) to Crystal Balm require up to 9.5 hours hot-solvent flush.</p>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs font-mono text-center">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-2 px-3 text-left font-bold text-slate-700">From / To</th>
                    {['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'].map((col) => (
                      <th key={col} className="py-2 px-2.5 font-bold text-[#002B66]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(CHANGEOVER_MATRIX).map(([fromShade, targets]) => (
                    <tr key={fromShade} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-left font-bold text-slate-900">{fromShade}</td>
                      {['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'].map((toShade) => {
                        const val = targets[toShade];
                        const isSevere = val >= 7.0;
                        const isZero = val === 0.0;
                        return (
                          <td 
                            key={toShade} 
                            className={`py-2 px-2.5 tabular-nums ${
                              isSevere 
                                ? 'bg-red-100 text-red-900 font-extrabold' 
                                : isZero 
                                ? 'text-slate-400' 
                                : 'text-slate-800'
                            }`}
                          >
                            {val.toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-1.5 bg-[#002B66] text-white rounded-md text-xs font-semibold"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stakeholder Export Modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        selectedPlant={selectedPlant}
        selectedWeek={selectedWeek}
        scheduledJobs={scheduledJobs}
        activeKpis={activeScenario.kpis}
      />

    </div>
  );
};
