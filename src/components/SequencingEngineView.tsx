import React, { useState, useMemo } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  Zap, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  FileDown, 
  ChevronRight, 
  Calendar, 
  Cpu, 
  HelpCircle,
  Split,
  Maximize2,
  Table,
  BarChart2,
  Grid
} from 'lucide-react';
import { 
  SequencingCandidateSku, 
  FactSequencePosition, 
  SequenceScenarioOption, 
  FactChangeoverMatrixEntry,
  PlantId,
  UserRole
} from '../types/ppds';
import { 
  SEQUENCING_CANDIDATE_SKUS, 
  FACT_CHANGEOVER_MATRIX, 
  DEFAULT_SEQUENCE_SCENARIOS, 
  PLANTS 
} from '../data/mockData';

interface SequencingEngineViewProps {
  selectedPlant: PlantId;
  onSelectPlant: (p: PlantId) => void;
  currentRole?: UserRole;
  onOpenExport?: () => void;
  onApplyToCockpit?: (scenarioId: string) => void;
}

type WorkflowStage = 'inputs' | 'processing' | 'outputs';
type InputSubTab = 'skus' | 'line_capability' | 'co_matrix' | 'readiness' | 'constraints';
type OutputSubTab = 'optimal_sequence' | 'gantt' | 'scenarios' | 'co_heatmap';

export const SequencingEngineView: React.FC<SequencingEngineViewProps> = ({
  selectedPlant,
  onSelectPlant,
  currentRole = 'Enterprise Optimization Principal',
  onOpenExport,
  onApplyToCockpit,
}) => {
  // Workflow stage navigation
  const [activeStage, setActiveStage] = useState<WorkflowStage>('outputs');
  const [activeInputTab, setActiveInputTab] = useState<InputSubTab>('skus');
  const [activeOutputTab, setActiveOutputTab] = useState<OutputSubTab>('optimal_sequence');

  // Input Data States
  const [candidateSkus, setCandidateSkus] = useState<SequencingCandidateSku[]>(SEQUENCING_CANDIDATE_SKUS);
  const [selectedLineId, setSelectedLineId] = useState<string>('Line 1');
  const [shiftDurationHours, setShiftDurationHours] = useState<number>(8); // 8h or 12h
  const [crewSize, setCrewSize] = useState<number>(4);
  const [cgmpCleanoutThresholdHours, setCgmpCleanoutThresholdHours] = useState<number>(36);

  // Objective Function Sliders
  const [weights, setWeights] = useState({
    changeoverTime: 15.0,
    throughput: 2.5,
    gsAdherence: 8.0,
    resourceAvailability: 5.0,
  });

  // Optimization Execution State
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizingProgress, setOptimizingProgress] = useState<number>(0);
  const [permutationsCount, setPermutationsCount] = useState<number>(40320);
  const [evaluatedCount, setEvaluatedCount] = useState<number>(40320);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('option_a');
  const [scenarios, setScenarios] = useState<SequenceScenarioOption[]>(DEFAULT_SEQUENCE_SCENARIOS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active scenario data
  const currentScenario = useMemo(() => {
    return scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  }, [scenarios, activeScenarioId]);

  // Selected Plant Object
  const currentPlantObj = PLANTS.find((p) => p.id === selectedPlant) || PLANTS[0];

  // Show transient feedback message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Lock/Pin SKU in position
  const toggleLockSku = (skuId: string, currentPos: number) => {
    setCandidateSkus((prev) =>
      prev.map((s) => {
        if (s.id === skuId) {
          const willLock = !s.isLockedInPosition;
          return {
            ...s,
            isLockedInPosition: willLock,
            lockedPosition: willLock ? currentPos : undefined,
          };
        }
        return s;
      })
    );
    triggerToast(`Updated lock state for SKU. Recalculating permutation space...`);
  };

  // Toggle Exclude SKU from production run
  const toggleExcludeSku = (skuId: string) => {
    setCandidateSkus((prev) =>
      prev.map((s) => (s.id === skuId ? { ...s, isExcluded: !s.isExcluded } : s))
    );
    triggerToast(`Toggled candidate SKU inclusion status.`);
  };

  // Move candidate SKU position in list
  const moveSkuOrder = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= candidateSkus.length) return;
    const copy = [...candidateSkus];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    setCandidateSkus(copy);
  };

  // Run the Optimization Algorithm (OR/ML)
  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setOptimizingProgress(0);
    setEvaluatedCount(0);
    setToastMessage(null);

    // Calculate effective permutation space
    const activeSkus = candidateSkus.filter((s) => !s.isExcluded);
    const lockedCount = activeSkus.filter((s) => s.isLockedInPosition).length;
    const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
    const effectivePermutations = factorial(Math.max(1, activeSkus.length - lockedCount));
    setPermutationsCount(effectivePermutations);

    const interval = setInterval(() => {
      setOptimizingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          setActiveStage('outputs');
          triggerToast(
            `Optimization converged in 0.8s! Evaluated ${effectivePermutations.toLocaleString()} permutations. Changeover reduction: 21.4%, Throughput: +8.2%.`
          );
          return 100;
        }
        const step = prev + 20;
        setEvaluatedCount(Math.min(effectivePermutations, Math.round((step / 100) * effectivePermutations)));
        return step;
      });
    }, 160);
  };

  // Format hours to "Xh Ym"
  const formatHours = (h: number) => {
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Unique list of candidate SKU codes for N x N matrix
  const skuCodes = useMemo(() => {
    return candidateSkus.map((s) => s.skuCode);
  }, [candidateSkus]);

  // Lookup changeover time in matrix
  const getChangeoverEntry = (fromCode: string, toCode: string): FactChangeoverMatrixEntry | undefined => {
    if (fromCode === toCode) {
      return {
        fromSku: fromCode,
        fromSkuName: '',
        toSku: toCode,
        toSkuName: '',
        lineId: selectedLineId,
        avgChangeoverHours: 0.0,
        changeoverType: 'minor',
        cleaningRequiredFlag: false,
        solventLitersEstimate: 0,
      };
    }
    return FACT_CHANGEOVER_MATRIX.find(
      (m) => (m.fromSku === fromCode && m.toSku === toCode) || (m.fromSku === toCode && m.toSku === fromCode)
    );
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-lg bg-[#002B66] text-white px-4 py-3 rounded-xl shadow-2xl border border-sky-400 flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-white">Sequencing Optimization Engine</p>
            <p className="text-slate-200 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header Banner: Workflow Definition */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
              <span>The Estée Lauder Companies</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-sky-800">{currentPlantObj.name}</span>
              <span aria-hidden="true">·</span>
              <span>PULSE Module 3 BRD Architecture</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
              <span>Production Scheduling &amp; Sequencing Engine</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                Gurobi 11.0 MILP
              </span>
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              End-to-end mathematical optimization pipeline evaluating sequence permutations to minimize changeover loss, maximize throughput, and enforce Gold Standard speed adherence.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-all cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export Sequence</span>
              </button>
            )}

            <button
              onClick={handleRunOptimization}
              disabled={isOptimizing}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg shadow-sm text-white transition-all cursor-pointer ${
                isOptimizing
                  ? 'bg-sky-500 cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              <Play className={`w-4 h-4 fill-current ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Evaluating Permutations...' : 'Run Optimization Algorithm'}</span>
            </button>
          </div>
        </div>

        {/* 3-Stage Pipeline Stepper */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Stage 1: Input */}
          <button
            onClick={() => setActiveStage('inputs')}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              activeStage === 'inputs'
                ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-400'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              <span>Stage 1: Input Pipeline</span>
              <span className="text-sky-700 font-mono">5 Sources</span>
            </div>
            <div className="text-xs font-bold text-slate-900 truncate">
              SKU List → Line Capability → CO Matrix → Readiness → Constraints
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
              <span>{candidateSkus.filter((s) => !s.isExcluded).length} SKUs staged</span>
              <span>·</span>
              <span>{candidateSkus.filter((s) => s.isLockedInPosition).length} position locked</span>
            </div>
          </button>

          {/* Stage 2: Processing */}
          <button
            onClick={() => setActiveStage('processing')}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              activeStage === 'processing'
                ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-400'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              <span>Stage 2: Processing</span>
              <span className="text-emerald-700 font-mono">OR / ML Solver</span>
            </div>
            <div className="text-xs font-bold text-slate-900 truncate">
              Optimization Algorithm (OR/ML) &amp; Permutation Scoring
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
              <span>{permutationsCount.toLocaleString()} permutations</span>
              <span>·</span>
              <span>4-term objective function</span>
            </div>
          </button>

          {/* Stage 3: Output */}
          <button
            onClick={() => setActiveStage('outputs')}
            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
              activeStage === 'outputs'
                ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-400'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              <span>Stage 3: Output</span>
              <span className="text-purple-700 font-mono">Decision Ready</span>
            </div>
            <div className="text-xs font-bold text-slate-900 truncate">
              Optimal Sequence, Scenario Alternatives &amp; Gantt
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
              <span>Option A (Gurobi)</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">-21.4% changeover loss</span>
            </div>
          </button>

        </div>
      </div>

      {/* Solving Overlay Banner */}
      {isOptimizing && (
        <div className="bg-[#002B66] text-white p-5 rounded-xl border border-sky-400 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-sky-300 animate-spin" />
              <div>
                <span className="font-bold text-white text-sm">Evaluating Sequence Permutations via Gurobi MILP Engine</span>
                <p className="text-slate-300 text-[11px]">Evaluating combinatorial branch-and-cut tree against Changeover Matrix &amp; Gold Standard bounds</p>
              </div>
            </div>
            <span className="font-mono font-bold text-sky-300 text-sm">
              {evaluatedCount.toLocaleString()} / {permutationsCount.toLocaleString()} ({optimizingProgress}%)
            </span>
          </div>

          <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-400 to-emerald-400 h-2.5 rounded-full transition-all duration-150"
              style={{ width: `${optimizingProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-3 text-[11px] text-slate-300 pt-1">
            <div>
              <span className="text-slate-400 block">Current Objective:</span>
              <span className="font-mono text-emerald-300 font-bold">94.8 Score</span>
            </div>
            <div>
              <span className="text-slate-400 block">Best Makespan:</span>
              <span className="font-mono text-sky-300 font-bold">114.5 Hours</span>
            </div>
            <div>
              <span className="text-slate-400 block">Washdown Reduction:</span>
              <span className="font-mono text-emerald-300 font-bold">-21.4% vs Baseline</span>
            </div>
            <div>
              <span className="text-slate-400 block">MIP Relative Gap:</span>
              <span className="font-mono text-white font-bold">0.00% (Proven Optimal)</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 1: INPUT PIPELINE (SKU List -> Line Capability -> CO Matrix -> Material Readiness -> Constraints)
          ======================================================== */}
      {activeStage === 'inputs' && (
        <div className="space-y-4">
          {/* Sub-tab selection */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveInputTab('skus')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeInputTab === 'skus'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                1. SKU List &amp; Candidate Orders ({candidateSkus.length})
              </button>
              <button
                onClick={() => setActiveInputTab('line_capability')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeInputTab === 'line_capability'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                2. Line Capability &amp; Asset Limits
              </button>
              <button
                onClick={() => setActiveInputTab('co_matrix')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeInputTab === 'co_matrix'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                3. Pairwise CO Matrix
              </button>
              <button
                onClick={() => setActiveInputTab('readiness')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeInputTab === 'readiness'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                4. Material Readiness (SAP MSEG/RESB)
              </button>
              <button
                onClick={() => setActiveInputTab('constraints')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeInputTab === 'constraints'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                5. Operational Constraints
              </button>
            </div>

            <button
              onClick={() => setActiveStage('processing')}
              className="flex items-center space-x-1 text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
            >
              <span>Proceed to Processing</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-Tab 1: SKU Candidate List */}
          {activeInputTab === 'skus' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Candidate Production Orders for Horizon (SAP PPDS AUFNR Extract)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Planners can lock specific SKUs into preferred sequence positions or exclude delayed orders from the combinatorial optimization pool.
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  <span>Permutations: </span>
                  <strong className="text-slate-900 font-mono">
                    {candidateSkus.filter((s) => s.isLockedInPosition).length > 0
                      ? `Locked subset active`
                      : `40,320 full permutations`}
                  </strong>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Order AUFNR</th>
                      <th className="py-2.5 px-3 text-left">SKU &amp; Formulation</th>
                      <th className="py-2.5 px-3 text-left">Pack Size</th>
                      <th className="py-2.5 px-3 text-right">Planned Units</th>
                      <th className="py-2.5 px-3 text-right">Planned Weight</th>
                      <th className="py-2.5 px-3 text-right">Gold Standard</th>
                      <th className="py-2.5 px-3 text-center">Material Ready</th>
                      <th className="py-2.5 px-3 text-center">Priority</th>
                      <th className="py-2.5 px-3 text-center">Lock Position</th>
                      <th className="py-2.5 px-3 text-center">Exclude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {candidateSkus.map((sku, idx) => (
                      <tr 
                        key={sku.id} 
                        className={`hover:bg-slate-50 transition-colors ${
                          sku.isExcluded ? 'opacity-40 bg-slate-50/80 line-through' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {sku.orderNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300 shadow-2xs"
                              style={{ backgroundColor: sku.color }}
                            />
                            <div>
                              <div className="font-bold text-slate-900">{sku.skuDescription}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{sku.skuCode} ({sku.shadeName})</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{sku.packSize}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium tabular-nums text-slate-900">
                          {sku.plannedUnits.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                          {sku.plannedKg.toLocaleString()} kg
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                          <span className="font-bold text-sky-800">{sku.goldStandardSpeedUpm}</span> UPM
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                            sku.materialReadinessPercent === 100
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {sku.materialStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          P{sku.priorityWeight}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => toggleLockSku(sku.id, idx + 1)}
                            className={`p-1.5 rounded transition-all cursor-pointer ${
                              sku.isLockedInPosition
                                ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title={sku.isLockedInPosition ? `Locked at Pos ${sku.lockedPosition}` : 'Click to lock in current sequence position'}
                          >
                            {sku.isLockedInPosition ? (
                              <div className="flex items-center space-x-1 text-[10px]">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Pos {sku.lockedPosition}</span>
                              </div>
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => toggleExcludeSku(sku.id)}
                            className={`p-1.5 rounded transition-all cursor-pointer ${
                              sku.isExcluded
                                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title={sku.isExcluded ? 'Include back in optimization' : 'Exclude from this schedule'}
                          >
                            {sku.isExcluded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Line Capability */}
          {activeInputTab === 'line_capability' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Line Selection</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Operational</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Line 1: High-Speed Rotary Lipstick</h3>
                <p className="text-xs text-slate-600">
                  Primary high-volume color cosmetics line equipped with chilled silicone molding carousel, flame-polishing tunnel, and automatic cartoner.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gold Standard Speed:</span>
                    <strong className="text-slate-900 font-mono">90 UPM (5,400 units/hr)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Rated Capacity:</span>
                    <strong className="text-slate-900 font-mono">120,000 units / 24h</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tooling Flexibility:</span>
                    <strong className="text-slate-900">3.5g Tube &amp; 4.2g Stick</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Line Selection</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Operational</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Line 2: Heated Piston Balm Dispenser</h3>
                <p className="text-xs text-slate-600">
                  Hot-pour medicated balms and menthol formulations with inline cooling tunnel and tamper-evident bander.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gold Standard Speed:</span>
                    <strong className="text-slate-900 font-mono">80 UPM (4,800 units/hr)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Rated Capacity:</span>
                    <strong className="text-slate-900 font-mono">110,000 units / 24h</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tooling Flexibility:</span>
                    <strong className="text-slate-900">4.2g Stick &amp; 15ml Squeeze</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Line Selection</span>
                  <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">Sterile Cleanroom</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Line 3: Medical Ointment &amp; Salve</h3>
                <p className="text-xs text-slate-600">
                  ISO Class 7 cleanroom packaging line for clinical barrier creams and zinc oxide suspensions.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gold Standard Speed:</span>
                    <strong className="text-slate-900 font-mono">75 UPM (4,500 units/hr)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Rated Capacity:</span>
                    <strong className="text-slate-900 font-mono">95,000 units / 24h</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tooling Flexibility:</span>
                    <strong className="text-slate-900">10g Tube &amp; 50g Jar</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Pairwise Changeover Matrix */}
          {activeInputTab === 'co_matrix' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Sequence-Dependent Pairwise Changeover Matrix (Hours &amp; Class)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transition penalty from Preceding SKU to Following SKU based on color spectrum, flavor cross-contamination, and tooling changes.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-600 font-semibold">
                  {FACT_CHANGEOVER_MATRIX.length} pairwise transitions loaded
                </span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 text-left">From SKU</th>
                      <th className="py-2.5 px-3 text-center">Transition</th>
                      <th className="py-2.5 px-3 text-left">To SKU</th>
                      <th className="py-2.5 px-3 text-right">CO Duration</th>
                      <th className="py-2.5 px-3 text-center">Classification</th>
                      <th className="py-2.5 px-3 text-center">Washdown Required</th>
                      <th className="py-2.5 px-3 text-right">Solvent Estimate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {FACT_CHANGEOVER_MATRIX.slice(0, 15).map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {entry.fromSkuName} <span className="text-[10px] text-slate-400 font-mono">({entry.fromSku})</span>
                        </td>
                        <td className="py-2 px-3 text-center text-slate-400">
                          <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {entry.toSkuName} <span className="text-[10px] text-slate-400 font-mono">({entry.toSku})</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                          <span className={entry.avgChangeoverHours > 4 ? 'text-rose-600' : 'text-emerald-700'}>
                            {entry.avgChangeoverHours.toFixed(1)} hrs
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            entry.changeoverType === 'minor'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : entry.changeoverType === 'format'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : entry.changeoverType === 'wash'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {entry.changeoverType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {entry.cleaningRequiredFlag ? (
                            <span className="text-amber-600 font-bold flex items-center justify-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Required</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">Not required</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600 tabular-nums">
                          {entry.solventLitersEstimate} L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Material Readiness */}
          {activeInputTab === 'readiness' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  SAP MSEG / RESB Material Component Readiness Feeder
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time stock checks for primary packaging components, active pharmaceutical ingredients (APIs), pigments, and hot-melt wax binders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between text-emerald-800 font-bold mb-1">
                    <span>Bulk Wax Base</span>
                    <span>100% Ready</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">84,000 kg available across Vessels 1 &amp; 2</p>
                </div>

                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between text-emerald-800 font-bold mb-1">
                    <span>Dye Concentrates</span>
                    <span>100% Ready</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">All 8 shade color pigments staged</p>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between text-amber-800 font-bold mb-1">
                    <span>Cherry Tubes</span>
                    <span>88% Staged</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">Inbound shipment arriving 14:00 today</p>
                </div>

                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between text-emerald-800 font-bold mb-1">
                    <span>Sanitation Solvents</span>
                    <span>100% Ready</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">4,500 L sterile IPA rinse verified</p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 5: Constraints */}
          {activeInputTab === 'constraints' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Operational &amp; Regulatory Constraints (Hard &amp; Soft)
                </h3>
                <p className="text-xs text-slate-500">
                  Enforces FDA Title 21 cGMP sanitation cleanout cycles, shift handovers, and labor staffing limits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <span className="font-bold text-slate-900 block">Shift Duration</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShiftDurationHours(8)}
                      className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                        shiftDurationHours === 8 ? 'bg-[#002B66] text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      8-Hour 3-Shift
                    </button>
                    <button
                      onClick={() => setShiftDurationHours(12)}
                      className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                        shiftDurationHours === 12 ? 'bg-[#002B66] text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      12-Hour Continuous
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">Standard 8h day, swing, and graveyard shifts with 30m handover.</p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <span className="font-bold text-slate-900 block">Crew Size per Line</span>
                  <div className="flex items-center space-x-2">
                    {[3, 4, 5].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCrewSize(c)}
                        className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                          crewSize === c ? 'bg-[#002B66] text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c} Operators
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">Minimum 4 operators required for format changeover speed.</p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                  <span className="font-bold text-slate-900 block">FDA cGMP Mandatory Cleanout</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">36 Hours</span>
                    <span className="text-[10px] text-slate-500">Max continuous run before CIP</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Hard constraint: Solver inserts a 4.0h full sanitization break if run exceeds 36h.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          STAGE 2: PROCESSING (Optimization Algorithm OR/ML & Permutation Evaluator)
          ======================================================== */}
      {activeStage === 'processing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Optimization Algorithm (OR/ML) Scoring Function &amp; Weights
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluate thousands of sequence permutations against multi-objective mathematical criteria.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunOptimization}
                  disabled={isOptimizing}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Gurobi Engine</span>
                </button>
              </div>
            </div>

            {/* Objective Equation Display */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 flex items-center justify-between overflow-x-auto">
              <div>
                <span className="text-slate-400 font-sans text-[11px] uppercase tracking-wider block font-bold mb-1">
                  Active Mathematical Formulation:
                </span>
                <span className="font-bold text-sky-900">Maximize:</span>{' '}
                <span className="text-emerald-700 font-bold">({weights.throughput.toFixed(1)} × Throughput)</span> -{' '}
                <span className="text-rose-700 font-bold">({weights.changeoverTime.toFixed(1)} × ChangeoverLoss)</span> -{' '}
                <span className="text-purple-700 font-bold">({weights.gsAdherence.toFixed(1)} × GSDeviationPenalty)</span> -{' '}
                <span className="text-amber-700 font-bold">({weights.resourceAvailability.toFixed(1)} × ResourceIdle)</span>
              </div>
              <div className="text-right text-[11px] font-sans text-slate-500 shrink-0 ml-4">
                <span>MILP Branch-and-Bound</span>
                <div className="font-mono text-slate-700 font-bold">Runtime &lt; 1.0s</div>
              </div>
            </div>

            {/* Interactive Weight Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Slider 1: Changeover Loss */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Changeover Time Penalty</span>
                  <span className="font-mono font-bold text-rose-700">{weights.changeoverTime.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={weights.changeoverTime}
                  onChange={(e) => setWeights({ ...weights, changeoverTime: parseFloat(e.target.value) })}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Penalizes long shade flushes and solvent consumption.</p>
              </div>

              {/* Slider 2: Throughput */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Throughput Maximization</span>
                  <span className="font-mono font-bold text-emerald-700">{weights.throughput.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={weights.throughput}
                  onChange={(e) => setWeights({ ...weights, throughput: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Rewards higher gross units produced per machine hour.</p>
              </div>

              {/* Slider 3: GS Adherence */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">GS Speed Adherence</span>
                  <span className="font-mono font-bold text-purple-700">{weights.gsAdherence.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={weights.gsAdherence}
                  onChange={(e) => setWeights({ ...weights, gsAdherence: parseFloat(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Minimizes deviation from Gold Standard speed parameters.</p>
              </div>

              {/* Slider 4: Resource Availability */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Resource Availability</span>
                  <span className="font-mono font-bold text-amber-700">{weights.resourceAvailability.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={weights.resourceAvailability}
                  onChange={(e) => setWeights({ ...weights, resourceAvailability: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">Prioritizes orders with 100% material staging ready.</p>
              </div>

            </div>

            {/* Permutation Search Space Metrics */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-900">Permutations Evaluated:</span>
                <span className="font-mono font-bold text-slate-900">{permutationsCount.toLocaleString()}</span>
                <span>(8 candidate SKUs with {candidateSkus.filter((s) => s.isLockedInPosition).length} locked positions)</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setWeights({
                      changeoverTime: 15.0,
                      throughput: 2.5,
                      gsAdherence: 8.0,
                      resourceAvailability: 5.0,
                    });
                    triggerToast('Reset weights to Balanced Gurobi defaults.');
                  }}
                  className="text-slate-500 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
                <button
                  onClick={() => setActiveStage('outputs')}
                  className="text-sky-700 hover:text-sky-900 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Optimal Sequence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 3: OUTPUT (Optimal Sequence, Scenario Alternatives, Gantt Visualization, CO Heatmap)
          ======================================================== */}
      {activeStage === 'outputs' && (
        <div className="space-y-4">
          
          {/* Top Quantified Business Benefits Banner (PULSE BRD AC-SEQ-02 & AC-SEQ-03 Compliant) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* KPI 1: Changeover Reduction */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Changeover Reduction</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                  Target &ge;10%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                -{currentScenario.changeoverReductionVsBaselinePercent}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>
                  <strong>{currentScenario.totalChangeoverHours}h</strong> total (was 7.0h baseline)
                </span>
              </div>
            </div>

            {/* KPI 2: Throughput Improvement */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Throughput Improvement</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                  Target &ge;5%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                +{currentScenario.throughputImprovementVsBaselinePercent}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>
                  <strong>{(currentScenario.totalThroughputUnits / 1000).toFixed(0)}k</strong> total units scheduled
                </span>
              </div>
            </div>

            {/* KPI 3: Gold Standard Adherence */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Gold Standard Adherence</span>
                <span className="font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded text-[10px]">
                  Quality Gate
                </span>
              </div>
              <div className="text-2xl font-extrabold text-sky-700 font-mono">
                {currentScenario.goldStandardAdherencePercent}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                <span>Zero speed degradation</span>
              </div>
            </div>

            {/* KPI 4: Financial Cost Savings */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Financial Benefit</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                  Per Horizon
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                ${currentScenario.costSavingsUsd.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span>Wash solvent + recovered labor</span>
              </div>
            </div>

          </div>

          {/* Output Sub-Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveOutputTab('optimal_sequence')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeOutputTab === 'optimal_sequence'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Optimal Sequence Table</span>
              </button>
              
              <button
                onClick={() => setActiveOutputTab('gantt')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeOutputTab === 'gantt'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Dynamic Gantt Visualization</span>
              </button>

              <button
                onClick={() => setActiveOutputTab('scenarios')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeOutputTab === 'scenarios'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Scenario Alternatives (A vs B vs C)</span>
              </button>

              <button
                onClick={() => setActiveOutputTab('co_heatmap')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeOutputTab === 'co_heatmap'
                    ? 'bg-[#002B66] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Changeover Heatmap Matrix</span>
              </button>
            </div>

            {/* Active Scenario Selector Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Scenario:</span>
              <select
                value={activeScenarioId}
                onChange={(e) => setActiveScenarioId(e.target.value)}
                className="text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ========================================================
              OUTPUT TAB 1: OPTIMAL SEQUENCE POSITION TABLE
              ======================================================== */}
          {activeOutputTab === 'optimal_sequence' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentScenario.name} — Sequence Dispatch Queue (Line 1 Rotary)
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentScenario.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Total Makespan:</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {currentScenario.sequence[currentScenario.sequence.length - 1]?.endHour || 114.5} hrs
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 text-center">Seq #</th>
                      <th className="py-2.5 px-3 text-left">Order AUFNR</th>
                      <th className="py-2.5 px-3 text-left">SKU Formulation</th>
                      <th className="py-2.5 px-3 text-right">Start Hour</th>
                      <th className="py-2.5 px-3 text-right">Run Duration</th>
                      <th className="py-2.5 px-3 text-right">End Hour</th>
                      <th className="py-2.5 px-3 text-center">Preceding CO</th>
                      <th className="py-2.5 px-3 text-center">CO Type</th>
                      <th className="py-2.5 px-3 text-right">Units</th>
                      <th className="py-2.5 px-3 text-right">GS Deviation</th>
                      <th className="py-2.5 px-3 text-right">Exp. OEE</th>
                      <th className="py-2.5 px-3 text-center">Lock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentScenario.sequence.map((pos) => (
                      <tr key={pos.position} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          <span className="w-5 h-5 rounded-full bg-slate-100 inline-flex items-center justify-center text-slate-800 text-xs">
                            {pos.position}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {pos.sku.orderNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300"
                              style={{ backgroundColor: pos.sku.color }}
                            />
                            <div>
                              <div className="font-bold text-slate-900">{pos.sku.skuDescription}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{pos.sku.skuCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                          {pos.startHour.toFixed(1)}h
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                          {formatHours(pos.durationHours)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                          {pos.endHour.toFixed(1)}h
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold tabular-nums">
                          {pos.changeoverHoursFromPrev === 0 ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <span className={pos.changeoverHoursFromPrev > 3 ? 'text-rose-600' : 'text-emerald-700'}>
                              {pos.changeoverHoursFromPrev.toFixed(1)}h
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            pos.changeoverType === 'minor'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : pos.changeoverType === 'format'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : pos.changeoverType === 'wash'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {pos.changeoverType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                          {pos.expectedThroughputUnits.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          <span className={pos.goldStandardDeviationUpm < -2 ? 'text-amber-600' : 'text-emerald-700'}>
                            {pos.goldStandardDeviationUpm === 0 ? '0 UPM' : `${pos.goldStandardDeviationUpm} UPM`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {pos.expectedOeePercent.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => toggleLockSku(pos.sku.id, pos.position)}
                            className={`p-1 rounded cursor-pointer ${
                              pos.sku.isLockedInPosition ? 'text-amber-600 font-bold' : 'text-slate-300 hover:text-slate-600'
                            }`}
                            title="Lock this SKU in position"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              OUTPUT TAB 2: DYNAMIC GANTT VISUALIZATION
              ======================================================== */}
          {activeOutputTab === 'gantt' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Multi-Shift Gantt Schedule Visualization (0.0h to 120.0h)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visualizes continuous production runs and preceding changeover/washdown gaps with shift demarcations (8h shifts).
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-slate-800" />
                    <span>Run Block</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-amber-400" />
                    <span>Changeover Gap</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded bg-rose-500" />
                    <span>CIP Sanitation</span>
                  </div>
                </div>
              </div>

              {/* Gantt Timeline Container */}
              <div className="overflow-x-auto pb-4">
                <div className="min-w-[900px] space-y-3">
                  
                  {/* Timeline Header (Hour Ticks) */}
                  <div className="relative h-6 border-b border-slate-200 text-[10px] font-mono text-slate-400">
                    {[0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map((hour) => {
                      const leftPercent = (hour / 120) * 100;
                      return (
                        <div
                          key={hour}
                          className="absolute transform -translate-x-1/2 flex flex-col items-center"
                          style={{ left: `${leftPercent}%` }}
                        >
                          <span>{hour}h</span>
                          <span className="w-px h-2 bg-slate-300" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Machine Line Track */}
                  <div className="relative bg-slate-100/70 rounded-lg p-2 h-24 border border-slate-200 flex items-center">
                    
                    {/* Shift Vertical Gridlines */}
                    {[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112].map((shiftHour) => (
                      <div
                        key={shiftHour}
                        className="absolute top-0 bottom-0 w-px border-r border-slate-300/60 pointer-events-none"
                        style={{ left: `${(shiftHour / 120) * 100}%` }}
                      />
                    ))}

                    {/* Schedule Position Blocks */}
                    {currentScenario.sequence.map((pos) => {
                      const runStartPercent = (pos.startHour / 120) * 100;
                      const runWidthPercent = (pos.durationHours / 120) * 100;
                      const coDuration = pos.changeoverHoursFromPrev;
                      const coStartPercent = Math.max(0, ((pos.startHour - coDuration) / 120) * 100);
                      const coWidthPercent = (coDuration / 120) * 100;

                      return (
                        <React.Fragment key={pos.position}>
                          {/* Preceding Changeover Block (if any) */}
                          {coDuration > 0 && (
                            <div
                              className="absolute h-14 rounded-l bg-amber-400/90 border-r border-amber-500 shadow-2xs flex items-center justify-center text-[10px] font-mono text-amber-950 px-1 truncate cursor-help"
                              style={{
                                left: `${coStartPercent}%`,
                                width: `${coWidthPercent}%`,
                              }}
                              title={`Changeover: ${coDuration}h (${pos.changeoverType}) to ${pos.sku.skuDescription}`}
                            >
                              <span>{coDuration}h</span>
                            </div>
                          )}

                          {/* Production Run Block */}
                          <div
                            className="absolute h-16 rounded shadow-xs border border-slate-700/30 text-white p-2 flex flex-col justify-between truncate transition-all hover:ring-2 hover:ring-sky-400 cursor-pointer"
                            style={{
                              left: `${runStartPercent}%`,
                              width: `${runWidthPercent}%`,
                              backgroundColor: pos.sku.color || '#002B66',
                            }}
                            title={`${pos.sku.skuDescription} | Start: ${pos.startHour}h, End: ${pos.endHour}h | ${pos.expectedThroughputUnits.toLocaleString()} units`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="truncate">#{pos.position} {pos.sku.shadeName}</span>
                              <span className="font-mono text-[9px] opacity-90">{pos.durationHours}h</span>
                            </div>
                            <div className="text-[9px] opacity-80 font-mono truncate">
                              {pos.sku.orderNumber} · {(pos.expectedThroughputUnits / 1000).toFixed(0)}k pcs
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}

                  </div>

                  {/* Shift Label Track */}
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 px-1">
                    <span>Shift 1 (Day)</span>
                    <span>Shift 2 (Swing)</span>
                    <span>Shift 3 (Graveyard)</span>
                    <span>Shift 1 (Day 2)</span>
                    <span>Shift 2 (Swing 2)</span>
                    <span>Shift 3 (Graveyard 2)</span>
                    <span>Shift 1 (Day 3)</span>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              OUTPUT TAB 3: SCENARIO ALTERNATIVES COMPARISON (OPTION A vs B vs C)
              ======================================================== */}
          {activeOutputTab === 'scenarios' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((sc) => {
                const isSelected = sc.id === activeScenarioId;
                return (
                  <div
                    key={sc.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-sky-500 ring-2 ring-sky-400'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                          {sc.badge}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {sc.name}
                      </h3>

                      <p className="text-xs text-slate-600">
                        {sc.description}
                      </p>

                      <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-100">
                        <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
                          Objective Focus:
                        </span>
                        {sc.objectiveFocus}
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Changeover Time:</span>
                          <strong className="text-emerald-700 font-mono">
                            {sc.totalChangeoverHours}h (-{sc.changeoverReductionVsBaselinePercent}%)
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Throughput:</span>
                          <strong className="text-slate-900 font-mono">
                            {(sc.totalThroughputUnits / 1000).toFixed(0)}k units (+{sc.throughputImprovementVsBaselinePercent}%)
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">GS Speed Adherence:</span>
                          <strong className="text-sky-800 font-mono">{sc.goldStandardAdherencePercent}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Financial Savings:</span>
                          <strong className="text-emerald-700 font-mono">${sc.costSavingsUsd.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setActiveScenarioId(sc.id);
                          triggerToast(`Switched active scenario to ${sc.name}.`);
                        }}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-[#002B66] text-white hover:bg-[#001D45]'
                        }`}
                      >
                        {isSelected ? 'Currently Selected' : 'Select Scenario'}
                      </button>

                      {onApplyToCockpit && (
                        <button
                          onClick={() => {
                            onApplyToCockpit(sc.id);
                            triggerToast(`Promoted ${sc.name} to Production Master Schedule.`);
                          }}
                          className="px-3 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer"
                          title="Apply this scenario to live Gantt schedule"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================
              OUTPUT TAB 4: CHANGEOVER HEATMAP MATRIX (FROM -> TO)
              ======================================================== */}
          {activeOutputTab === 'co_heatmap' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    N × N Changeover Duration Heatmap (Preceding SKU vs Following SKU)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Matrix visualizes the setup and cleanout transition penalty (hours). Cells shaded green (0h–1.5h) indicate minor transition, whereas red/crimson (6h–10h) represent major color flushes or allergen sanitization.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[10px] text-slate-400">Low CO (0-1h)</span>
                  <div className="w-16 h-3 rounded bg-gradient-to-r from-emerald-100 via-amber-200 to-rose-400" />
                  <span className="text-[10px] text-slate-400">High CO (8-10h)</span>
                </div>
              </div>

              {/* Heatmap Grid Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-200 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">
                        From \ To
                      </th>
                      {candidateSkus.map((toSku) => (
                        <th
                          key={toSku.id}
                          className="p-2 border border-slate-200 bg-slate-50 text-slate-800 font-semibold text-[11px] min-w-[70px] text-center"
                        >
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block mr-1"
                            style={{ backgroundColor: toSku.color }}
                          />
                          <span>{toSku.shadeName.split(' ')[0]}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {candidateSkus.map((fromSku) => (
                      <tr key={fromSku.id}>
                        <td className="p-2 border border-slate-200 bg-slate-50 font-bold text-slate-800 text-[11px] whitespace-nowrap">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block mr-1.5"
                            style={{ backgroundColor: fromSku.color }}
                          />
                          <span>{fromSku.shadeName.split(' ')[0]}</span>
                        </td>
                        {candidateSkus.map((toSku) => {
                          const entry = getChangeoverEntry(fromSku.skuCode, toSku.skuCode);
                          const hours = entry ? entry.avgChangeoverHours : (fromSku.id === toSku.id ? 0 : 4.0);

                          let cellBg = 'bg-white';
                          let cellText = 'text-slate-800';

                          if (hours === 0) {
                            cellBg = 'bg-slate-100/60';
                            cellText = 'text-slate-400';
                          } else if (hours <= 1.5) {
                            cellBg = 'bg-emerald-100 text-emerald-900';
                          } else if (hours <= 3.5) {
                            cellBg = 'bg-amber-100 text-amber-900';
                          } else if (hours <= 6.0) {
                            cellBg = 'bg-orange-200 text-orange-950 font-semibold';
                          } else {
                            cellBg = 'bg-rose-200 text-rose-950 font-bold';
                          }

                          return (
                            <td
                              key={toSku.id}
                              className={`p-2 border border-slate-200 text-center font-mono text-[11px] tabular-nums transition-colors ${cellBg}`}
                              title={`${fromSku.shadeName} → ${toSku.shadeName}: ${hours.toFixed(1)}h (${entry?.changeoverType || 'standard'})`}
                            >
                              {hours === 0 ? '—' : `${hours.toFixed(1)}h`}
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

        </div>
      )}

    </div>
  );
};
