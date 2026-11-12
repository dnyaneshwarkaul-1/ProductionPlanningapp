import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Play, 
  Check, 
  Table as TableIcon,
  FileText
} from 'lucide-react';
import { REQUIRED_DATASETS } from '../data/mockData';
import { RequiredDataset } from '../types/ppds';

export const DataRequirementsView: React.FC = () => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(REQUIRED_DATASETS[0].id);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<{
    status: 'success' | 'warning' | null;
    totalRows: number;
    passedChecks: number;
    warnings: string[];
  } | null>(null);

  const selectedDataset: RequiredDataset = 
    REQUIRED_DATASETS.find((d) => d.id === selectedDatasetId) || REQUIRED_DATASETS[0];

  const downloadCsvTemplate = (dataset: RequiredDataset) => {
    const headers = dataset.fields.map((f) => f.name).join(',');
    const sampleRows = dataset.sampleRows
      .map((row) => dataset.fields.map((f) => `"${row[f.name] ?? ''}"`).join(','))
      .join('\n');
    
    const csvContent = `${headers}\n${sampleRows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataset.code}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(dataset.id);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const runValidationCheck = () => {
    setIsValidating(true);
    setValidationReport(null);

    setTimeout(() => {
      setIsValidating(false);
      setValidationReport({
        status: 'success',
        totalRows: selectedDataset.sampleRows.length,
        passedChecks: selectedDataset.fields.length * selectedDataset.sampleRows.length,
        warnings: [
          'All finished good material codes verified against SAP S/4HANA catalog.',
          'Pigment washdown matrix verified against QA spectrophotometer database.',
          'Machine speeds conform to Line 1 Rotary Molder 5,200 units/h boundary.',
        ],
      });
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#001E38] border border-[#C5A059]/30 text-xs font-semibold mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>The Estée Lauder Companies Ingestion</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Data Requirements &amp; Schema Dictionary
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              7 core enterprise datasets required to initialize and run the PPDS optimization solver across personal care, lipstick, and healthcare lines.
            </p>
          </div>
          <button
            onClick={() => downloadCsvTemplate(selectedDataset)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 transition-colors"
          >
            {downloadSuccess === selectedDataset.id ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Downloaded {selectedDataset.code}.csv</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Sample CSV Template</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dataset List */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
            7 Required Datasets
          </h3>
          {REQUIRED_DATASETS.map((dataset, idx) => {
            const isSelected = dataset.id === selectedDatasetId;
            return (
              <button
                key={dataset.id}
                onClick={() => {
                  setSelectedDatasetId(dataset.id);
                  setValidationReport(null);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  isSelected
                    ? 'border-[#002B66] bg-sky-50 ring-2 ring-[#002B66]/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-[#002B66]' : 'text-slate-500'}`}>
                    {dataset.code}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {dataset.updateFrequency.split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{idx + 1}. {dataset.title}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{dataset.businessImpact}</p>
              </button>
            );
          })}
        </div>

        {/* Dataset Detail */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#002B66] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {selectedDataset.code}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedDataset.title}</h2>
              </div>
              <button
                onClick={runValidationCheck}
                disabled={isValidating}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <Play className={`w-3.5 h-3.5 text-[#002B66] ${isValidating ? 'animate-spin' : ''}`} />
                <span>{isValidating ? 'Validating...' : 'Simulate Schema Validation'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">{selectedDataset.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Cadence:</span>
                <span className="font-bold text-slate-900">{selectedDataset.updateFrequency}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Primary Key:</span>
                <span className="font-mono font-bold text-[#002B66]">{selectedDataset.primaryKey}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Impact:</span>
                <span className="font-medium text-slate-800">{selectedDataset.businessImpact}</span>
              </div>
            </div>

            {validationReport && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs animate-in fade-in duration-200">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Validation Passed: All constraints and foreign keys verified across {validationReport.totalRows} sample rows</span>
                </div>
                <ul className="list-disc list-inside text-emerald-700 text-[11px] space-y-0.5 ml-1">
                  {validationReport.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Dictionary Table */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <TableIcon className="w-4 h-4 text-[#002B66]" />
              <span>Field-Level Data Dictionary ({selectedDataset.fields.length} Columns)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50 font-sans">
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Column</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Type</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Rule</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700">Sample</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedDataset.fields.map((f) => (
                    <tr key={f.name} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{f.name}</td>
                      <td className="py-2.5 px-3 text-[#002B66] font-semibold">{f.type}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px]">{f.validationRule}</td>
                      <td className="py-2.5 px-3 text-slate-700">{f.sampleValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
