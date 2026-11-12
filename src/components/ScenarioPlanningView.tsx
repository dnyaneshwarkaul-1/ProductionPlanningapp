import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  Lock, 
  Unlock,
  FileCheck, 
  AlertCircle, 
  Clock, 
  User, 
  Play, 
  Send, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Sliders,
  Layers,
  Scale,
  BarChart3,
  Eye,
  Archive,
  RotateCcw,
  Download,
  Zap,
  DollarSign,
  Flame,
  Check,
  X,
  Radio,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Factory,
  Cpu,
  FileDown,
  Activity
} from 'lucide-react';
import { OptimizationScenario, ScenarioStatus, UserRole, ScenarioAuditLog, MachineId } from '../types/ppds';
import { OPTIMIZATION_SCENARIOS, USER_PROFILES, MACHINES, SHADES_FORMULATIONS } from '../data/mockData';
import { ExportReportModal } from './ExportReportModal';
import { SensitivityAnalysisModule } from './SensitivityAnalysisModule';

interface ScenarioPlanningViewProps {
  currentRole: UserRole;
}

type ScenarioSubTab = 'hub' | 'compare' | 'what_if' | 'sensitivity';

export const ScenarioPlanningView: React.FC<ScenarioPlanningViewProps> = ({ currentRole }) => {
  const [activeSubTab, setActiveSubTab] = useState<ScenarioSubTab>('hub');
  const [scenarios, setScenarios] = useState<OptimizationScenario[]>(OPTIMIZATION_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('min_changeover');
  
  // Multi-scenario compare selection (max 4)
  const [comparedScenarioIds, setComparedScenarioIds] = useState<string[]>([
    'min_changeover',
    'max_throughput',
    'balanced_cost'
  ]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Form State for Create / Edit
  const [formScenarioId, setFormScenarioId] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formBadge, setFormBadge] = useState<string>('');
  const [formTagline, setFormTagline] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formVersion, setFormVersion] = useState<string>('v1.0');
  const [formTargetOtif, setFormTargetOtif] = useState<number>(98.5);
  const [formMaxHorizon, setFormMaxHorizon] = useState<number>(144.0);
  const [formMakespanWeight, setFormMakespanWeight] = useState<number>(2.0);
  const [formChangeoverWeight, setFormChangeoverWeight] = useState<number>(15.0);
  const [formOtifWeight, setFormOtifWeight] = useState<number>(30.0);
  const [formEnergyWeight, setFormEnergyWeight] = useState<number>(8.0);
  const [formPro1, setFormPro1] = useState<string>('');
  const [formPro2, setFormPro2] = useState<string>('');
  const [formCon1, setFormCon1] = useState<string>('');

  // Publish Modal State
  const [targetMesLine, setTargetMesLine] = useState<string>('Line 1 - High-Speed Pure Color Envy Molding (Melville)');
  const [publishShift, setPublishShift] = useState<string>('Shift 1 - Day (07:00 - 15:30) Monday');
  const [publishNotes, setPublishNotes] = useState<string>('Validated for FDA cGMP 36h cleanout windows and solvent scrap threshold.');

  // What-If Simulator Levers
  const [whatIfDemandSurge, setWhatIfDemandSurge] = useState<number>(15);
  const [whatIfTargetShade, setWhatIfTargetShade] = useState<string>('ALL');
  const [whatIfDowntimeHours, setWhatIfDowntimeHours] = useState<number>(0);
  const [whatIfDowntimeMachine, setWhatIfDowntimeMachine] = useState<string>('Machine1');
  const [whatIfSolventInflation, setWhatIfSolventInflation] = useState<number>(0);
  const [whatIfOvertimeCap, setWhatIfOvertimeCap] = useState<number>(4);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedResults, setSimulatedResults] = useState<{
    scenarioId: string;
    makespan: number;
    washdown: number;
    otif: number;
    cost: number;
    oee: number;
    feasibility: 'FEASIBLE' | 'WARNING' | 'CRITICAL';
    bottleneckMessage: string;
  } | null>(null);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Filtered Scenarios List
  const filteredScenarios = useMemo(() => {
    return scenarios.filter((sc) => {
      const matchesSearch = 
        sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.badge.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || sc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [scenarios, searchQuery, statusFilter]);

  // Handle Multi-Scenario Compare Toggle
  const toggleScenarioInCompare = (id: string) => {
    if (comparedScenarioIds.includes(id)) {
      if (comparedScenarioIds.length <= 2) {
        showToast('At least 2 scenarios must be selected for comparison', 'warning');
        return;
      }
      setComparedScenarioIds((prev) => prev.filter((item) => item !== id));
    } else {
      if (comparedScenarioIds.length >= 4) {
        showToast('Maximum 4 scenarios can be compared simultaneously', 'info');
        return;
      }
      setComparedScenarioIds((prev) => [...prev, id]);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = (preset?: Partial<OptimizationScenario>) => {
    setFormScenarioId(`sc_${Date.now()}`);
    setFormTitle(preset?.title || 'Custom Shift & Pigment Strategy');
    setFormBadge(preset?.badge || 'Custom Heuristic');
    setFormTagline(preset?.tagline || 'Customized weight balancing for The Estée Lauder Companies prestige lines.');
    setFormDescription(preset?.description || 'Formulated with customized Gurobi 11.0 weights for customer OTIF and solvent reduction.');
    setFormVersion('v1.0-RC');
    setFormTargetOtif(preset?.targetOtifPercent || 98.5);
    setFormMaxHorizon(preset?.maxHorizonHours || 144.0);
    setFormMakespanWeight(preset?.weights?.makespan || 3.0);
    setFormChangeoverWeight(preset?.weights?.changeover || 18.0);
    setFormOtifWeight(preset?.weights?.otif || 35.0);
    setFormEnergyWeight(preset?.weights?.energy || 6.0);
    setFormPro1('Optimized for specific product line mix');
    setFormPro2('Under 8-hour total washdown duration');
    setFormCon1('Requires monitoring on Sunday shift buffer');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (scenario: OptimizationScenario) => {
    setFormScenarioId(scenario.id);
    setFormTitle(scenario.title);
    setFormBadge(scenario.badge);
    setFormTagline(scenario.tagline);
    setFormDescription(scenario.description);
    setFormVersion(scenario.version);
    setFormTargetOtif(scenario.targetOtifPercent || scenario.kpis.serviceLevelOtifPercent);
    setFormMaxHorizon(scenario.maxHorizonHours || 144.0);
    setFormMakespanWeight(scenario.weights?.makespan || 2.0);
    setFormChangeoverWeight(scenario.weights?.changeover || 15.0);
    setFormOtifWeight(scenario.weights?.otif || 30.0);
    setFormEnergyWeight(scenario.weights?.energy || 8.0);
    setFormPro1(scenario.tradeOffHighlights.pros[0] || 'High efficiency');
    setFormPro2(scenario.tradeOffHighlights.pros[1] || 'Controlled solvent scrap');
    setFormCon1(scenario.tradeOffHighlights.cons[0] || 'Requires setup precision');
    setIsEditModalOpen(true);
  };

  // Submit Create Scenario
  const handleSaveNewScenario = (e: React.FormEvent) => {
    e.preventDefault();
    const newWeights = {
      makespan: formMakespanWeight,
      changeover: formChangeoverWeight,
      otif: formOtifWeight,
      energy: formEnergyWeight,
    };

    // Calculate simulated KPIs based on weights
    const estimatedMakespan = Number((140 + (formChangeoverWeight < 10 ? 16 : 4) - (formMakespanWeight * 1.5)).toFixed(1));
    const estimatedWashdown = Number((6.0 + (30 - formChangeoverWeight) * 0.4).toFixed(1));
    const estimatedOtif = Number((94.0 + (formOtifWeight * 0.14)).toFixed(1));
    const estimatedCost = Math.round(12000 + estimatedWashdown * 950);

    const newScenario: OptimizationScenario = {
      id: formScenarioId,
      title: formTitle,
      badge: formBadge,
      tagline: formTagline,
      description: formDescription,
      solverStrategy: `Min: ${formChangeoverWeight} * Washdown_Hours + ${formMakespanWeight} * Makespan + ${formOtifWeight} * Demand_Slack + ${formEnergyWeight} * Peak_Tariff`,
      status: 'Draft',
      version: formVersion,
      author: currentRole.split(' ')[0] + ' ' + currentRole.split(' ')[1],
      lastUpdated: 'Just now',
      targetOtifPercent: formTargetOtif,
      maxHorizonHours: formMaxHorizon,
      weights: newWeights,
      kpis: {
        totalMakespanHours: Math.max(130, estimatedMakespan),
        changeoverWashHours: Math.max(5.0, estimatedWashdown),
        demandVsActualGapPercent: Number(((estimatedOtif - 99.0) * 0.5).toFixed(2)),
        serviceLevelOtifPercent: Math.min(99.9, estimatedOtif),
        totalJobsCount: 50,
        totalMachinesCount: 6,
        totalSetupChanges: Math.round(estimatedWashdown * 1.4),
        oeePercent: Number((91.0 + (formMakespanWeight * 0.6)).toFixed(1)),
        solventScrapCostUsd: estimatedCost,
        energyConsumptionKwh: 49000,
        sanitationHours: 4.0,
        scheduledWeek: 18,
      },
      tradeOffHighlights: {
        pros: [formPro1, formPro2].filter(Boolean),
        cons: [formCon1].filter(Boolean),
      },
      auditTrail: [
        {
          id: `audit_${Date.now()}`,
          action: 'Created',
          user: currentRole,
          role: currentRole,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: `Created new draft scenario with OTIF weight ${formOtifWeight} and Changeover weight ${formChangeoverWeight}.`,
        },
      ],
    };

    setScenarios((prev) => [newScenario, ...prev]);
    setSelectedScenarioId(newScenario.id);
    setIsCreateModalOpen(false);
    showToast(`Scenario "${formTitle}" created successfully as DRAFT.`);
  };

  // Submit Edit Scenario
  const handleUpdateScenario = (e: React.FormEvent) => {
    e.preventDefault();
    setScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id !== formScenarioId) return sc;
        const newWeights = {
          makespan: formMakespanWeight,
          changeover: formChangeoverWeight,
          otif: formOtifWeight,
          energy: formEnergyWeight,
        };
        const updatedAudit: ScenarioAuditLog = {
          id: `audit_${Date.now()}`,
          action: 'Edited',
          user: currentRole,
          role: currentRole,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: `Updated solver parameters: Washdown weight ${formChangeoverWeight}, OTIF weight ${formOtifWeight}.`,
        };

        return {
          ...sc,
          title: formTitle,
          badge: formBadge,
          tagline: formTagline,
          description: formDescription,
          targetOtifPercent: formTargetOtif,
          maxHorizonHours: formMaxHorizon,
          weights: newWeights,
          solverStrategy: `Min: ${formChangeoverWeight} * Washdown_Hours + ${formMakespanWeight} * Makespan + ${formOtifWeight} * Demand_Slack + ${formEnergyWeight} * Peak_Tariff`,
          lastUpdated: 'Just now',
          tradeOffHighlights: {
            pros: [formPro1, formPro2].filter(Boolean),
            cons: [formCon1].filter(Boolean),
          },
          auditTrail: [updatedAudit, ...(sc.auditTrail || [])],
        };
      })
    );
    setIsEditModalOpen(false);
    showToast(`Scenario "${formTitle}" updated with new solver parameters.`);
  };

  // Delete Scenario
  const handleDeleteScenario = (id: string, title: string) => {
    if (scenarios.length <= 1) {
      showToast('Cannot delete the only remaining scenario', 'warning');
      return;
    }
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    if (selectedScenarioId === id) {
      const remaining = scenarios.filter((s) => s.id !== id);
      setSelectedScenarioId(remaining[0].id);
    }
    setComparedScenarioIds((prev) => prev.filter((item) => item !== id));
    showToast(`Scenario "${title}" deleted from catalog.`, 'info');
  };

  // Clone Scenario
  const handleCloneScenario = (source: OptimizationScenario) => {
    const clonedId = `${source.id}_clone_${Date.now().toString().slice(-4)}`;
    const cloned: OptimizationScenario = {
      ...source,
      id: clonedId,
      title: `${source.title} (Copy)`,
      badge: `${source.badge} Clone`,
      status: 'Draft',
      version: `${source.version}-copy`,
      author: currentRole.split(' ')[0] + ' ' + currentRole.split(' ')[1],
      lastUpdated: 'Just now',
      auditTrail: [
        {
          id: `audit_${Date.now()}`,
          action: 'Created',
          user: currentRole,
          role: currentRole,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: `Cloned from base scenario "${source.title}".`,
        },
      ],
    };
    setScenarios((prev) => [cloned, ...prev]);
    setSelectedScenarioId(cloned.id);
    showToast(`Cloned "${source.title}" as new Draft scenario.`);
  };

  // Advance Status (Draft -> Under Review -> Approved)
  const handleTransitionStatus = (targetStatus: ScenarioStatus) => {
    setScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id !== activeScenario.id) return sc;
        const auditEntry: ScenarioAuditLog = {
          id: `audit_${Date.now()}`,
          action: targetStatus === 'Approved' ? 'Approved' : 'Reviewed',
          user: currentRole,
          role: currentRole,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: `Stage-gate transition to "${targetStatus}". FDA Title 21 cGMP validation recorded.`,
        };
        return {
          ...sc,
          status: targetStatus,
          lastUpdated: 'Just now',
          auditTrail: [auditEntry, ...(sc.auditTrail || [])],
        };
      })
    );
    showToast(`Scenario "${activeScenario.title}" transitioned to: ${targetStatus.toUpperCase()}`);
  };

  // Publish & Lock for MES Dispatch
  const handlePublishScenario = () => {
    setScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id !== activeScenario.id) return sc;
        const auditEntry: ScenarioAuditLog = {
          id: `audit_${Date.now()}`,
          action: 'Published',
          user: currentRole,
          role: currentRole,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: `Published to shop floor: ${targetMesLine}. Handover shift: ${publishShift}. Notes: ${publishNotes}`,
        };
        return {
          ...sc,
          status: 'Published',
          isPublished: true,
          publishedAt: new Date().toLocaleString(),
          publishedBy: currentRole,
          lastUpdated: 'Just now',
          auditTrail: [auditEntry, ...(sc.auditTrail || [])],
        };
      })
    );
    setIsPublishModalOpen(false);
    showToast(`Scenario "${activeScenario.title}" successfully published & locked for MES dispatch!`);
  };

  // Revert / Rollback Published Scenario
  const handleRevertPublish = () => {
    setScenarios((prev) =>
      prev.map((sc) => {
        if (sc.id !== activeScenario.id) return sc;
        const auditEntry: ScenarioAuditLog = {
          id: `audit_${Date.now()}`,
          action: 'Edited',
          user: currentRole,
          role: currentRole,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          details: `Rollback executed by ${currentRole}. Publication revoked back to Approved state.`,
        };
        return {
          ...sc,
          status: 'Approved',
          isPublished: false,
          publishedAt: undefined,
          publishedBy: undefined,
          auditTrail: [auditEntry, ...(sc.auditTrail || [])],
        };
      })
    );
    showToast(`Publication rolled back. Scenario returned to Approved state.`, 'info');
  };

  // Run What-If Simulation
  const handleRunWhatIfSimulation = () => {
    setIsSimulating(true);
    setSimulatedResults(null);

    setTimeout(() => {
      setIsSimulating(false);
      const baseMakespan = activeScenario.kpis.totalMakespanHours;
      const baseWashdown = activeScenario.kpis.changeoverWashHours;
      const baseOtif = activeScenario.kpis.serviceLevelOtifPercent;
      const baseCost = activeScenario.kpis.solventScrapCostUsd;
      const baseOee = activeScenario.kpis.oeePercent;

      // Mathematical impact calculation
      const surgeImpactHours = (whatIfDemandSurge * 0.42);
      const shadeMultiplier = whatIfTargetShade === 's1' ? 1.3 : whatIfTargetShade === 's6' ? 1.15 : 1.0;
      const addedMakespan = Number(((surgeImpactHours * shadeMultiplier) + whatIfDowntimeHours).toFixed(1));
      const simulatedMakespan = Number((baseMakespan + addedMakespan).toFixed(1));

      const downtimeOtifDrop = whatIfDowntimeHours > 0 ? (whatIfDowntimeHours * 0.75) : 0;
      const surgeOtifDrop = whatIfDemandSurge > 20 ? (whatIfDemandSurge - 20) * 0.15 : 0;
      const simulatedOtif = Number(Math.max(86.5, Math.min(99.9, baseOtif - downtimeOtifDrop - surgeOtifDrop)).toFixed(1));

      const costInflationImpact = baseCost * (whatIfSolventInflation / 100);
      const extraWashdowns = whatIfDowntimeHours > 6 ? 2.5 : 0;
      const simulatedWashdown = Number((baseWashdown + extraWashdowns).toFixed(1));
      const simulatedCost = Math.round(baseCost + costInflationImpact + (extraWashdowns * 850));

      const simulatedOee = Number(Math.max(78.0, baseOee - (whatIfDowntimeHours * 0.6) - (whatIfDemandSurge > 30 ? 1.5 : 0)).toFixed(1));

      let feasibility: 'FEASIBLE' | 'WARNING' | 'CRITICAL' = 'FEASIBLE';
      let bottleneckMsg = 'Schedule fully absorbent within standard shifts. No weekend overtime triggered.';

      if (simulatedMakespan > 156.0 || simulatedOtif < 95.0) {
        feasibility = 'CRITICAL';
        bottleneckMsg = `Critical SLA Breach: Makespan exceeds weekly 168h horizon or OTIF (${simulatedOtif}%) breaches 95% retail SLA. Mandatory Sunday overtime & emergency compounding required.`;
      } else if (simulatedMakespan > 148.0 || whatIfDowntimeHours > 4) {
        feasibility = 'WARNING';
        bottleneckMsg = `Horizon Warning: Makespan pushed to ${simulatedMakespan}h. Absorbs Friday Graveyard shift buffer. Supervisor alert dispatched.`;
      }

      setSimulatedResults({
        scenarioId: activeScenario.id,
        makespan: simulatedMakespan,
        washdown: simulatedWashdown,
        otif: simulatedOtif,
        cost: simulatedCost,
        oee: simulatedOee,
        feasibility,
        bottleneckMessage: bottleneckMsg,
      });

      showToast('What-If stress test simulation completed! Evaluated across Plant × SKU × Line.');
    }, 750);
  };

  // Convert What-If Result into a New Scenario
  const handlePromoteWhatIfToScenario = () => {
    if (!simulatedResults) return;
    handleOpenCreateModal({
      title: `What-If: +${whatIfDemandSurge}% Demand & ${whatIfDowntimeHours}h Stoppage`,
      badge: 'What-If Simulation',
      tagline: `Stress-tested model under ${whatIfTargetShade} surge with ${simulatedResults.feasibility} rating.`,
      description: `Generated from What-If analysis on "${activeScenario.title}". Evaluates ${whatIfDemandSurge}% retail demand spike, ${whatIfDowntimeHours}h stoppage on ${whatIfDowntimeMachine}, and +${whatIfSolventInflation}% solvent inflation.`,
      targetOtifPercent: simulatedResults.otif,
      maxHorizonHours: simulatedResults.makespan,
      weights: {
        makespan: whatIfDemandSurge > 20 ? 4.5 : 2.5,
        changeover: 14.0,
        otif: 40.0,
        energy: 6.0,
      },
    });
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center space-x-3 border animate-in slide-in-from-bottom-2 duration-150 ${
          toastMessage.type === 'success'
            ? 'bg-[#002B66] border-sky-400'
            : toastMessage.type === 'warning'
            ? 'bg-amber-900 border-amber-500'
            : 'bg-slate-900 border-slate-700'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header with View Tabs & Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-[#002B66] text-xs font-bold mb-2">
              <GitBranch className="w-3.5 h-3.5" />
              <span>North America Personal Care &amp; Healthcare PPDS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Scenario Planning, Governance &amp; What-If Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Create custom multi-objective solver models, compare trade-offs across service levels and washdown hours, publish locked schedules for MES dispatch, and stress-test volatile market conditions.
            </p>
          </div>

          {/* Action CTAs: Export, Create Scenario & Audit Log */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-[#002B66] border border-sky-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Download presentation-ready multi-scenario comparison PDF or CSV"
            >
              <FileDown className="w-3.5 h-3.5 text-[#002B66]" />
              <span>Export Dossier</span>
            </button>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Audit Trail</span>
            </button>
            <button
              onClick={() => handleOpenCreateModal()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Scenario</span>
            </button>
          </div>
        </div>

        {/* Sub-View Navigation Pills */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('hub')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'hub'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Scenario Hub &amp; Governance ({scenarios.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('compare')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'compare'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-purple-600" />
            <span>Side-by-Side Comparison Matrix ({comparedScenarioIds.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('what_if')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'what_if'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>What-If Stress Testing Engine</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sensitivity')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'sensitivity'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Sensitivity Analysis (Lead Times &amp; Demand)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-VIEW 1: SCENARIO HUB & GOVERNANCE                   */}
      {/* ======================================================== */}
      {activeSubTab === 'hub' && (
        <div className="space-y-6">
          
          {/* Active Scenario Detail Hero Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#002B66] border border-sky-200 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-[#002B66] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {activeScenario.badge}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      activeScenario.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeScenario.status === 'Published' || activeScenario.status === 'Locked for MES Dispatch'
                        ? 'bg-slate-900 text-white'
                        : activeScenario.status === 'Under Review'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {activeScenario.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{activeScenario.version}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{activeScenario.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{activeScenario.tagline}</p>
                </div>
              </div>

              {/* Quick Actions for Selected Scenario */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <button
                  onClick={() => handleOpenEditModal(activeScenario)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Parameters</span>
                </button>
                <button
                  onClick={() => handleCloneScenario(activeScenario)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Clone</span>
                </button>
                
                {activeScenario.status !== 'Published' && activeScenario.status !== 'Locked for MES Dispatch' ? (
                  <button
                    onClick={() => setIsPublishModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Publish &amp; Lock for MES</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRevertPublish}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    title="Rollback publication to Approved state"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Rollback Publication</span>
                  </button>
                )}
              </div>
            </div>

            {/* Description & Mathematical Objective */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">{activeScenario.description}</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">MILP Solver Objective Function:</span>
                  <span className="text-[#002B66] font-semibold">{activeScenario.solverStrategy}</span>
                </div>
              </div>

              <div className="lg:col-span-4 bg-sky-50/50 p-3 rounded-xl border border-sky-100 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Governance Details</span>
                <div className="flex justify-between text-slate-600">
                  <span>Author:</span>
                  <strong className="text-slate-900">{activeScenario.author}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Last Calibrated:</span>
                  <strong className="text-slate-900">{activeScenario.lastUpdated}</strong>
                </div>
                {activeScenario.isPublished && (
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-sky-200">
                    <span className="text-emerald-700 font-bold">Published By:</span>
                    <strong className="text-emerald-800">{activeScenario.publishedBy}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Live KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Makespan:</span>
                <p className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">{activeScenario.kpis.totalMakespanHours}h</p>
                <span className="text-[10px] text-slate-500 font-medium">Standard 168h week</span>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-600 uppercase font-bold block">Pigment Washdown:</span>
                <p className="text-lg font-extrabold text-purple-900 tabular-nums mt-0.5">{activeScenario.kpis.changeoverWashHours}h</p>
                <span className="text-[10px] text-purple-700 font-medium">{activeScenario.kpis.totalSetupChanges} tooling swaps</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-600 uppercase font-bold block">Customer OTIF:</span>
                <p className="text-lg font-extrabold text-emerald-800 tabular-nums mt-0.5">{activeScenario.kpis.serviceLevelOtifPercent}%</p>
                <span className="text-[10px] text-emerald-600 font-medium">Walmart/Target SLA</span>
              </div>
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200">
                <span className="text-[10px] text-sky-700 uppercase font-bold block">Solvent Scrap:</span>
                <p className="text-lg font-extrabold text-[#002B66] tabular-nums mt-0.5">${activeScenario.kpis.solventScrapCostUsd.toLocaleString()}</p>
                <span className="text-[10px] text-slate-500 font-medium">Chemical flushes</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-700 uppercase font-bold block">Overall OEE:</span>
                <p className="text-lg font-extrabold text-amber-900 tabular-nums mt-0.5">{activeScenario.kpis.oeePercent}%</p>
                <span className="text-[10px] text-amber-700 font-medium">Asset utilization</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Energy Demand:</span>
                <p className="text-lg font-extrabold text-slate-800 tabular-nums mt-0.5">{(activeScenario.kpis.energyConsumptionKwh / 1000).toFixed(1)}k kWh</p>
                <span className="text-[10px] text-slate-500 font-medium">Compounding kettles</span>
              </div>
            </div>

            {/* Stage-Gate Workflow Step Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Stage-Gate Governance Status: <strong className="text-slate-900">{activeScenario.status}</strong>
              </span>

              <div className="flex items-center space-x-2">
                {activeScenario.status === 'Draft' && (
                  <button
                    onClick={() => handleTransitionStatus('Under Review')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for QA Review</span>
                  </button>
                )}

                {activeScenario.status === 'Under Review' && (
                  <button
                    onClick={() => handleTransitionStatus('Approved')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Schedule</span>
                  </button>
                )}

                {activeScenario.status === 'Approved' && (
                  <button
                    onClick={() => setIsPublishModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Publish &amp; Lock for MES</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveSubTab('what_if');
                    setSimulatedResults(null);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#002B66] border border-sky-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Stress Test in What-If</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scenario Catalog Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search scenarios by title, keyword, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#002B66]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#002B66]"
              >
                <option value="ALL">All Statuses ({scenarios.length})</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Published">Published</option>
                <option value="Locked for MES Dispatch">Locked for MES</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              const isInCompare = comparedScenarioIds.includes(sc.id);

              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#002B66] bg-sky-50/30 ring-2 ring-[#002B66]/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Header: Status Pill, Badge, and Compare Checkbox */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sc.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sc.status === 'Published' || sc.status === 'Locked for MES Dispatch'
                            ? 'bg-slate-900 text-white'
                            : sc.status === 'Under Review'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {sc.status}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#002B66] bg-sky-100/60 px-1.5 py-0.5 rounded">
                          {sc.badge}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <label 
                          className="flex items-center space-x-1 text-[11px] font-medium text-slate-500 cursor-pointer select-none"
                          title="Select to compare side-by-side"
                        >
                          <input
                            type="checkbox"
                            checked={isInCompare}
                            onChange={() => toggleScenarioInCompare(sc.id)}
                            className="rounded border-slate-300 text-[#002B66] focus:ring-[#002B66]"
                          />
                          <span>Compare</span>
                        </label>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1">{sc.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{sc.tagline}</p>

                    {/* KPI mini-grid */}
                    <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Makespan</span>
                        <span className="text-xs font-bold text-slate-900 tabular-nums">{sc.kpis.totalMakespanHours}h</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Washdown</span>
                        <span className="text-xs font-bold text-purple-800 tabular-nums">{sc.kpis.changeoverWashHours}h</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">OTIF</span>
                        <span className="text-xs font-bold text-emerald-700 tabular-nums">{sc.kpis.serviceLevelOtifPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">By {sc.author}</span>
                    <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(sc)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                        title="Edit Scenario Parameters"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCloneScenario(sc)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                        title="Clone Scenario"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {sc.id !== 'min_changeover' && sc.id !== 'max_throughput' && (
                        <button
                          onClick={() => handleDeleteScenario(sc.id, sc.title)}
                          className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                          title="Delete Scenario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: SIDE-BY-SIDE COMPARISON MATRIX              */}
      {/* ======================================================== */}
      {activeSubTab === 'compare' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Multi-Scenario Comparative Matrix</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side scorecard comparing {comparedScenarioIds.length} candidate strategies for Plant × SKU sequence dispatch.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Quick selector:</span>
                <button
                  onClick={() => setComparedScenarioIds(['min_changeover', 'max_throughput', 'balanced_cost'])}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  Top 3 Benchmarks
                </button>
                <button
                  onClick={() => setComparedScenarioIds(scenarios.slice(0, 4).map((s) => s.id))}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                  All 4 Primary
                </button>
              </div>
            </div>

            {/* Scorecard Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold bg-slate-50 w-56">Evaluation Criteria</th>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <th key={id} className="py-3 px-4 font-bold text-slate-900 bg-slate-50 min-w-[220px]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#002B66]">{sc.title}</span>
                            <span className="text-[10px] font-mono bg-sky-100 px-1.5 py-0.5 rounded text-[#002B66]">
                              {sc.badge}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* Row: Status & Version */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Status &amp; Version</td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <td key={id} className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded mr-2 ${
                            sc.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sc.status === 'Published' || sc.status === 'Locked for MES Dispatch'
                              ? 'bg-slate-900 text-white'
                              : sc.status === 'Under Review'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {sc.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{sc.version}</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Customer OTIF */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">
                      Customer Service (OTIF %)
                      <span className="block text-[10px] font-normal text-slate-400">Target &gt; 95.0%</span>
                    </td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      const isHigh = sc.kpis.serviceLevelOtifPercent >= 99.0;
                      return (
                        <td key={id} className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-base font-extrabold tabular-nums ${
                              isHigh ? 'text-emerald-700' : 'text-slate-800'
                            }`}>
                              {sc.kpis.serviceLevelOtifPercent}%
                            </span>
                            {isHigh && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                Best SLA
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Pigment Washdown Hours */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">
                      Pigment Washdown &amp; Cleanout
                      <span className="block text-[10px] font-normal text-slate-400">Lower = Less chemical waste</span>
                    </td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      const isLowest = sc.kpis.changeoverWashHours <= 8.0;
                      return (
                        <td key={id} className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-base font-extrabold tabular-nums ${
                              isLowest ? 'text-purple-700' : 'text-slate-800'
                            }`}>
                              {sc.kpis.changeoverWashHours}h
                            </span>
                            {isLowest && (
                              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                                Min Solvent
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Total Makespan */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">
                      Total Makespan (Hours)
                      <span className="block text-[10px] font-normal text-slate-400">Weekly ceiling: 168.0h</span>
                    </td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <td key={id} className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                          {sc.kpis.totalMakespanHours}h
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {(168 - sc.kpis.totalMakespanHours).toFixed(1)}h reserve buffer
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Solvent Scrap Cost */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">
                      Washdown Chemical Cost
                      <span className="block text-[10px] font-normal text-slate-400">Flushes &amp; CIP solvents</span>
                    </td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <td key={id} className="py-3 px-4 font-bold text-[#002B66] tabular-nums">
                          ${sc.kpis.solventScrapCostUsd.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Overall OEE */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Asset Utilization (OEE)</td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <td key={id} className="py-3 px-4 font-bold text-slate-800 tabular-nums">
                          {sc.kpis.oeePercent}%
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Key Pros */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Strategic Advantages</td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <td key={id} className="py-3 px-4">
                          <ul className="space-y-1">
                            {sc.tradeOffHighlights.pros.map((pro, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5 text-[11px] text-emerald-800">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Trade-Off Compromises */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Operational Trade-Offs</td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <td key={id} className="py-3 px-4">
                          <ul className="space-y-1">
                            {sc.tradeOffHighlights.cons.map((con, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5 text-[11px] text-amber-800">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Solver Objective Formula */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Gurobi Solver Objective</td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <td key={id} className="py-3 px-4">
                          <code className="text-[10px] bg-slate-100 p-1.5 rounded block text-slate-700 font-mono break-words">
                            {sc.solverStrategy}
                          </code>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Action Buttons */}
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50">Actions</td>
                    {comparedScenarioIds.map((id) => {
                      const sc = scenarios.find((s) => s.id === id);
                      if (!sc) return null;
                      return (
                        <td key={id} className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedScenarioId(sc.id);
                                setActiveSubTab('hub');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px]"
                            >
                              Select
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(sc)}
                              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#002B66] font-semibold rounded text-[11px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedScenarioId(sc.id);
                                setIsPublishModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-[#002B66] hover:bg-[#001D45] text-white font-bold rounded text-[11px]"
                            >
                              Publish
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 3: ADVANCED WHAT-IF STRESS TESTING STUDIO       */}
      {/* ======================================================== */}
      {activeSubTab === 'what_if' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time What-If Sensitivity Engine</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Dynamic Parameter Perturbation &amp; Feasibility Simulation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulating impact on baseline scenario: <strong className="text-[#002B66]">{activeScenario.title}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunWhatIfSimulation}
                  disabled={isSimulating}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Recalculating Solver...' : 'Run What-If Simulation'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Lever 1: Retail Demand Surge */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">1. Demand Surge</span>
                  <span className="font-mono font-bold text-[#002B66]">+{whatIfDemandSurge}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={whatIfDemandSurge}
                  onChange={(e) => setWhatIfDemandSurge(Number(e.target.value))}
                  className="w-full accent-[#002B66] cursor-pointer"
                />
                
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] text-slate-500 font-semibold block">Target Shade Focus:</label>
                  <select
                    value={whatIfTargetShade}
                    onChange={(e) => setWhatIfTargetShade(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-[#002B66]"
                  >
                    <option value="ALL">All Product Lines &amp; Shades</option>
                    <option value="s1">s1 - Ruby Red (Promo Spike)</option>
                    <option value="s6">s6 - Medicated Lip Balm (Flu Spike)</option>
                    <option value="s7">s7 - Clinical Zinc Ointment (Hospital)</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400">Simulate flash promotional ordering from Target or Walmart.</p>
              </div>

              {/* Lever 2: Injected Line Breakdown */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">2. Unplanned Downtime</span>
                  <span className="font-mono font-bold text-red-600">{whatIfDowntimeHours}h delay</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={whatIfDowntimeHours}
                  onChange={(e) => setWhatIfDowntimeHours(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] text-slate-500 font-semibold block">Injected Machine Bottleneck:</label>
                  <select
                    value={whatIfDowntimeMachine}
                    onChange={(e) => setWhatIfDowntimeMachine(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded p-1.5 focus:ring-1 focus:ring-red-600"
                  >
                    <option value="Machine1">Machine 1 - Rotary Lipstick Molder</option>
                    <option value="Machine2">Machine 2 - Hot-Pour Fill Line</option>
                    <option value="Kettle1">Kettle 1 - Wax Premelt Vessel</option>
                    <option value="Machine3">Machine 3 - Cartoner &amp; Sleever</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400">Simulate hydraulic pump failure or conveyor belt jam.</p>
              </div>

              {/* Lever 3: Solvent Inflation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">3. Solvent Inflation</span>
                  <span className="font-mono font-bold text-amber-700">+{whatIfSolventInflation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={whatIfSolventInflation}
                  onChange={(e) => setWhatIfSolventInflation(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="pt-5 text-[10px] text-slate-500">
                  Feed chemical &amp; CIP detergent tariff fluctuation across North America suppliers.
                </div>
              </div>

              {/* Lever 4: Worker Overtime Cap */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">4. Overtime Limit Cap</span>
                  <span className="font-mono font-bold text-sky-700">{whatIfOvertimeCap}h / shift</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={whatIfOvertimeCap}
                  onChange={(e) => setWhatIfOvertimeCap(Number(e.target.value))}
                  className="w-full accent-[#00A3E0] cursor-pointer"
                />
                <div className="pt-5 text-[10px] text-slate-500">
                  Union labor agreements on maximum continuous shift extension without plant shutoff.
                </div>
              </div>

            </div>

            {/* Simulation Feedback Card */}
            {simulatedResults ? (
              <div className="space-y-4 pt-2">
                
                {/* Feasibility Banner */}
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  simulatedResults.feasibility === 'CRITICAL'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : simulatedResults.feasibility === 'WARNING'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  {simulatedResults.feasibility === 'CRITICAL' ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  ) : simulatedResults.feasibility === 'WARNING' ? (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold uppercase tracking-wider text-[11px]">
                        Status: {simulatedResults.feasibility}
                      </span>
                    </div>
                    <p className="mt-1 leading-relaxed">{simulatedResults.bottleneckMessage}</p>
                  </div>
                </div>

                {/* Comparative Metric Diff Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  
                  {/* Makespan Diff */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recalculated Makespan</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                        {simulatedResults.makespan}h
                      </span>
                      <span className="text-[11px] text-slate-400">
                        (was {activeScenario.kpis.totalMakespanHours}h)
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold flex items-center space-x-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+{(simulatedResults.makespan - activeScenario.kpis.totalMakespanHours).toFixed(1)}h shift variance</span>
                    </span>
                  </div>

                  {/* Customer OTIF Diff */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Simulated Customer OTIF</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className={`text-xl font-extrabold tabular-nums ${
                        simulatedResults.otif >= 95.0 ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {simulatedResults.otif}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        (was {activeScenario.kpis.serviceLevelOtifPercent}%)
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold flex items-center space-x-1 ${
                      simulatedResults.otif >= 95.0 ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {simulatedResults.otif >= 95.0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Meets 95% retail SLA</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>Retail SLA Breached</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Washdown Hours Diff */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Simulated Washdown Hours</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xl font-extrabold text-purple-900 tabular-nums">
                        {simulatedResults.washdown}h
                      </span>
                      <span className="text-[11px] text-slate-400">
                        (was {activeScenario.kpis.changeoverWashHours}h)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Sequence maintained
                    </span>
                  </div>

                  {/* Chemical Cost Diff */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Chemical Flush Cost</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xl font-extrabold text-[#002B66] tabular-nums">
                        ${simulatedResults.cost.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-red-600 font-semibold">
                      +${(simulatedResults.cost - activeScenario.kpis.solventScrapCostUsd).toLocaleString()} variance
                    </span>
                  </div>

                </div>

                {/* Promotion Action */}
                <div className="flex items-center justify-between p-4 bg-sky-50 rounded-xl border border-sky-200">
                  <div className="text-xs">
                    <h4 className="font-bold text-[#002B66]">Like this What-If outcome?</h4>
                    <p className="text-slate-600 mt-0.5">
                      Save this simulated stress-test directly as a new governed production scenario to compare or publish to MES.
                    </p>
                  </div>
                  <button
                    onClick={handlePromoteWhatIfToScenario}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save What-If as New Scenario</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Adjust the levers above and click "Run What-If Simulation"</p>
                <p className="text-[11px] mt-1">Evaluates sequence-dependent MILP feasibility across Melville &amp; Whitman lines in ~0.8s.</p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 4: SENSITIVITY ANALYSIS MODULE                 */}
      {/* ======================================================== */}
      {activeSubTab === 'sensitivity' && (
        <SensitivityAnalysisModule
          activeScenario={activeScenario}
          scenarios={scenarios}
          currentRole={currentRole}
          onPromoteToScenario={handleOpenCreateModal}
          onOpenExport={() => setIsExportModalOpen(true)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE SCENARIO                                */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New Production Scenario</h3>
                <p className="text-xs text-slate-500 mt-0.5">Define multi-objective weights and operational boundaries for Gurobi MILP solver.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewScenario} className="space-y-4 text-xs">
              
              {/* Row 1: Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Scenario Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Q4 Holiday Peak Throughput Model"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Holiday Surge"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                  />
                </div>
              </div>

              {/* Tagline & Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Tagline</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="One sentence summary of business goal..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description &amp; Rationale</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              {/* Solver Objective Weights */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-900 block">
                  Solver Objective Weights (Tuning Multi-Objective Trade-Offs)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Makespan Weight */}
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Makespan Weight:</span>
                      <strong className="font-mono text-[#002B66]">{formMakespanWeight}</strong>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.5"
                      value={formMakespanWeight}
                      onChange={(e) => setFormMakespanWeight(Number(e.target.value))}
                      className="w-full accent-[#002B66]"
                    />
                  </div>

                  {/* Washdown Weight */}
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Changeover &amp; Washdown Weight:</span>
                      <strong className="font-mono text-purple-700">{formChangeoverWeight}</strong>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="30.0"
                      step="1.0"
                      value={formChangeoverWeight}
                      onChange={(e) => setFormChangeoverWeight(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  {/* OTIF Weight */}
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>OTIF Service Level Weight:</span>
                      <strong className="font-mono text-emerald-700">{formOtifWeight}</strong>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="50.0"
                      step="1.0"
                      value={formOtifWeight}
                      onChange={(e) => setFormOtifWeight(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Energy Tariff Weight */}
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Peak Energy Weight:</span>
                      <strong className="font-mono text-amber-700">{formEnergyWeight}</strong>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="15.0"
                      step="0.5"
                      value={formEnergyWeight}
                      onChange={(e) => setFormEnergyWeight(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>

                <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[10px] text-slate-700">
                  <span className="text-slate-400 block">Generated Formulation Preview:</span>
                  Min: {formChangeoverWeight} * Washdown_Hours + {formMakespanWeight} * Makespan + {formOtifWeight} * Unfilled_Slack + {formEnergyWeight} * Peak_Tariff
                </div>
              </div>

              {/* Trade-Off Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">Primary Advantage (Pro):</label>
                  <input
                    type="text"
                    value={formPro1}
                    onChange={(e) => setFormPro1(e.target.value)}
                    placeholder="e.g. Cuts solvent scrap by 35%"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-800 block mb-1">Main Compromise (Con):</label>
                  <input
                    type="text"
                    value={formCon1}
                    onChange={(e) => setFormCon1(e.target.value)}
                    placeholder="e.g. Requires Sunday Graveyard shift buffer"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Scenario as Draft
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT SCENARIO PARAMETERS                       */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Scenario Parameters</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update mathematical weights and targets for "{formTitle}"</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateScenario} className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">Scenario Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              {/* Weights Tuning */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-900 block">Solver Objective Tuning</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Makespan Weight:</span>
                      <strong className="font-mono text-[#002B66]">{formMakespanWeight}</strong>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.5"
                      value={formMakespanWeight}
                      onChange={(e) => setFormMakespanWeight(Number(e.target.value))}
                      className="w-full accent-[#002B66]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Changeover &amp; Washdown Weight:</span>
                      <strong className="font-mono text-purple-700">{formChangeoverWeight}</strong>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="30.0"
                      step="1.0"
                      value={formChangeoverWeight}
                      onChange={(e) => setFormChangeoverWeight(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>OTIF Service Level Weight:</span>
                      <strong className="font-mono text-emerald-700">{formOtifWeight}</strong>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="50.0"
                      step="1.0"
                      value={formOtifWeight}
                      onChange={(e) => setFormOtifWeight(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 mb-1">
                      <span>Peak Energy Weight:</span>
                      <strong className="font-mono text-amber-700">{formEnergyWeight}</strong>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="15.0"
                      step="0.5"
                      value={formEnergyWeight}
                      onChange={(e) => setFormEnergyWeight(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save &amp; Apply Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PUBLISH & LOCK FOR MES DISPATCH                */}
      {/* ======================================================== */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Lock className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Publish &amp; Lock for MES Dispatch</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{activeScenario.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Shop-Floor Hard Lock Notice</span>
                </span>
                <p className="text-[11px] mt-1 text-amber-800 leading-relaxed">
                  Publishing will transmit finalized sequence batches into Siemens Opcenter MES and Rockwell Automation PLCs. Shift operators on Line 1 will be locked to this execution sequence.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Shop-Floor MES System:</label>
                <select
                  value={targetMesLine}
                  onChange={(e) => setTargetMesLine(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                >
                  <option value="Line 1 - High-Speed Pure Color Envy Molding (Melville)">Line 1 - High-Speed Pure Color Envy Molding (Melville)</option>
                  <option value="Line 2 - Prestige Skincare & ANR Filling (Whitman)">Line 2 - Prestige Skincare &amp; ANR Filling (Whitman)</option>
                  <option value="Line 3 - Crystal Balm & Treatment Sticks (Markham)">Line 3 - Crystal Balm &amp; Treatment Sticks (Markham)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Effective Production Shift:</label>
                <input
                  type="text"
                  value={publishShift}
                  onChange={(e) => setPublishShift(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Publisher &amp; Sign-off Notes:</label>
                <textarea
                  rows={2}
                  value={publishNotes}
                  onChange={(e) => setPublishNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishScenario}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center space-x-2 shadow-xs transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Confirm MES Publication</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: AUDIT TRAIL LOG                                */}
      {/* ======================================================== */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Scenario Governance Audit Trail</h3>
                <p className="text-xs text-slate-500 mt-0.5">FDA Title 21 cGMP electronic signature and change tracking</p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              {(activeScenario.auditTrail && activeScenario.auditTrail.length > 0) ? (
                activeScenario.auditTrail.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#002B66] uppercase text-[10px] tracking-wider bg-sky-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-800 mt-1 font-medium">{log.details}</p>
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>By: <strong className="text-slate-700">{log.user}</strong> ({log.role})</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p>Baseline scenario initialized from Gurobi 11.0 benchmark solver.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 text-right mt-3">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stakeholder Scenario Export Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedPlant="NA-NEENAH"
        scenarios={scenarios}
      />

    </div>
  );
};
