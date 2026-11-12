import React, { useState } from 'react';
import { 
  FileDown, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  X, 
  Sparkles,
  Download,
  Building,
  Eye,
  Check
} from 'lucide-react';
import { PlantId, ScheduledJob, OptimizationScenario, ScenarioKPIs } from '../types/ppds';
import { PLANTS, BENCHMARK_JOBS, OPTIMIZATION_SCENARIOS } from '../data/mockData';
import { 
  exportProductionSchedulePdf, 
  exportProductionScheduleCsv, 
  exportScenarioAnalysisPdf, 
  exportScenarioAnalysisCsv 
} from '../utils/exportPdf';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlant: PlantId;
  selectedWeek?: number;
  scheduledJobs?: ScheduledJob[];
  scenarios?: OptimizationScenario[];
  activeKpis?: ScenarioKPIs;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  selectedPlant,
  selectedWeek = 18,
  scheduledJobs = BENCHMARK_JOBS,
  scenarios = OPTIMIZATION_SCENARIOS,
  activeKpis = OPTIMIZATION_SCENARIOS[0].kpis,
}) => {
  const [reportType, setReportType] = useState<'schedule' | 'scenario' | 'combined'>('schedule');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selectedPlantState, setSelectedPlantState] = useState<PlantId>(selectedPlant);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessToast, setExportSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlantObj = PLANTS.find((p) => p.id === selectedPlantState) || PLANTS[0];

  const handleExecuteExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);

      if (reportType === 'schedule') {
        if (reportFormat === 'pdf') {
          exportProductionSchedulePdf(scheduledJobs, currentPlantObj.name, selectedWeek, activeKpis);
          setExportSuccessToast(`Production Schedule PDF generated for ${currentPlantObj.name}`);
        } else {
          exportProductionScheduleCsv(scheduledJobs, currentPlantObj.name, selectedWeek);
          setExportSuccessToast(`Production Schedule CSV downloaded successfully`);
        }
      } else if (reportType === 'scenario') {
        if (reportFormat === 'pdf') {
          exportScenarioAnalysisPdf(scenarios, currentPlantObj.name);
          setExportSuccessToast(`Scenario Analysis Report PDF generated successfully`);
        } else {
          exportScenarioAnalysisCsv(scenarios);
          setExportSuccessToast(`Scenario Analysis CSV downloaded successfully`);
        }
      } else {
        // Combined dossier
        if (reportFormat === 'pdf') {
          exportProductionSchedulePdf(scheduledJobs, currentPlantObj.name, selectedWeek, activeKpis);
          setTimeout(() => {
            exportScenarioAnalysisPdf(scenarios, currentPlantObj.name);
          }, 400);
          setExportSuccessToast(`Combined Executive Dossier PDFs generated!`);
        } else {
          exportProductionScheduleCsv(scheduledJobs, currentPlantObj.name, selectedWeek);
          setTimeout(() => {
            exportScenarioAnalysisCsv(scenarios);
          }, 400);
          setExportSuccessToast(`Combined CSV datasets downloaded!`);
        }
      }

      setTimeout(() => setExportSuccessToast(null), 4000);
    }, 500);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#002B66] text-white flex items-center justify-center shadow-xs shrink-0">
              <FileDown className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Stakeholder Report &amp; Data Export Center
                </h3>
                <img 
                  src="/assets/aistudio/image_848583f4.png" 
                  alt="KC" 
                  className="h-5 bg-slate-50 px-1.5 py-0.5 rounded object-contain border border-slate-200" 
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate presentation-ready executive PDFs and raw CSV datasets for leadership and shop-floor reviews.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Toast */}
        {exportSuccessToast && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessToast}</span>
          </div>
        )}

        <div className="space-y-5 mt-5 text-xs">
          
          {/* Step 1: Select Report Scope */}
          <div>
            <label className="font-bold text-slate-700 block mb-2 uppercase text-[10px] tracking-wider">
              1. Select Report Dossier Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <button
                type="button"
                onClick={() => setReportType('schedule')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  reportType === 'schedule'
                    ? 'border-[#002B66] bg-sky-50/50 ring-2 ring-[#002B66]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Calendar className="w-4 h-4 text-[#002B66]" />
                  {reportType === 'schedule' && <Check className="w-3.5 h-3.5 text-[#002B66]" />}
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Production Schedule</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Work orders, station sequence, start/end hours, washdowns, and FDA cGMP compliance.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('scenario')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  reportType === 'scenario'
                    ? 'border-[#002B66] bg-sky-50/50 ring-2 ring-[#002B66]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  {reportType === 'scenario' && <Check className="w-3.5 h-3.5 text-[#002B66]" />}
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Scenario Analysis</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Candidate strategies comparison, solver objective weights, trade-off matrix &amp; What-If findings.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('combined')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  reportType === 'combined'
                    ? 'border-[#002B66] bg-sky-50/50 ring-2 ring-[#002B66]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {reportType === 'combined' && <Check className="w-3.5 h-3.5 text-[#002B66]" />}
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Executive Combined</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Full dual dossier containing both operational dispatch and multi-scenario strategic comparisons.
                </p>
              </button>

            </div>
          </div>

          {/* Step 2: Select Format */}
          <div>
            <label className="font-bold text-slate-700 block mb-2 uppercase text-[10px] tracking-wider">
              2. Choose Output Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              <button
                type="button"
                onClick={() => setReportFormat('pdf')}
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                  reportFormat === 'pdf'
                    ? 'border-[#002B66] bg-sky-50/50 ring-2 ring-[#002B66]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-900 block">PDF Presentation Document</span>
                  <span className="text-[11px] text-slate-500 block">Formatted with Estée Lauder prestige branding &amp; sign-off</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportFormat('csv')}
                className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                  reportFormat === 'csv'
                    ? 'border-[#002B66] bg-sky-50/50 ring-2 ring-[#002B66]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-900 block">CSV Spreadsheet Data</span>
                  <span className="text-[11px] text-slate-500 block">Raw table ready for Excel, PowerBI, or MES ERP</span>
                </div>
              </button>

            </div>
          </div>

          {/* Step 3: Facility & Week Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Manufacturing Facility
              </label>
              <select
                value={selectedPlantState}
                onChange={(e) => setSelectedPlantState(e.target.value as PlantId)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-[#002B66]"
              >
                {PLANTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city}, {p.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Target Production Week
              </label>
              <input
                type="text"
                readOnly
                value={`Week ${selectedWeek} (Standard 168h Horizon)`}
                className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
              />
            </div>
          </div>

          {/* Report Live Preview Card */}
          <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <span className="flex items-center space-x-1.5 text-sky-400">
                <Eye className="w-3.5 h-3.5" />
                <span>Document Contents Preview</span>
              </span>
              <span>Electronic Validation #KC-NA-2026</span>
            </div>

            <div className="space-y-1 text-slate-300">
              <p className="font-bold text-white text-xs">
                {reportType === 'schedule'
                  ? `Estée Lauder Week ${selectedWeek} Production Dispatch Schedule`
                  : reportType === 'scenario'
                  ? `Estée Lauder Multi-Scenario MILP Optimization Dossier`
                  : `The Estée Lauder Companies Executive Comprehensive PPDS Dossier`}
              </p>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                <div>
                  <span>Target Plant: </span>
                  <strong className="text-white">{currentPlantObj.city}</strong>
                </div>
                <div>
                  <span>Orders Included: </span>
                  <strong className="text-emerald-400">{scheduledJobs.length} Jobs</strong>
                </div>
                <div>
                  <span>OTIF Benchmark: </span>
                  <strong className="text-sky-300">{activeKpis.serviceLevelOtifPercent}%</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-200 mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrintDocument}
            className="flex items-center space-x-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="flex items-center space-x-2 px-5 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>
                {isExporting 
                  ? 'Generating Report...' 
                  : `Download ${reportFormat.toUpperCase()} Document`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
