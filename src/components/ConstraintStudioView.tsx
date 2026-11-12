import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  Cpu, 
  RotateCcw, 
  Filter, 
  Search,
  Check,
  Building,
  Target
} from 'lucide-react';
import { ConstraintItem, ConstraintCategory, ConstraintScope } from '../types/ppds';
import { INITIAL_CONSTRAINTS } from '../data/mockData';

export const ConstraintStudioView: React.FC = () => {
  const [constraints, setConstraints] = useState<ConstraintItem[]>(INITIAL_CONSTRAINTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Edit modal state
  const [editingConstraint, setEditingConstraint] = useState<ConstraintItem | null>(null);
  const [editParamValue, setEditParamValue] = useState<string | number>('');

  // New constraint modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<ConstraintCategory>('Hard Engineering Constraint');
  const [newScope, setNewScope] = useState<ConstraintScope>('All Plants (North America)');
  const [newEntity, setNewEntity] = useState<string>('Line 1 Rotary Molder');
  const [newParamName, setNewParamName] = useState<string>('Max_Limit_Value');
  const [newParamValue, setNewParamValue] = useState<string>('5000');
  const [newUnit, setNewUnit] = useState<string>('Units / Hour');
  const [newMathExpr, setNewMathExpr] = useState<string>('Throughput <= Limit');
  const [newRationale, setNewRationale] = useState<string>('Ensures North America cGMP process control.');

  // Notification toast
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Toggle enabled/disabled
  const handleToggleConstraint = (id: string) => {
    setConstraints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = !c.isEnabled;
          showToast(`Constraint "${c.name}" ${updated ? 'activated' : 'deactivated'}. Solver will adjust.`);
          return { ...c, isEnabled: updated };
        }
        return c;
      })
    );
  };

  // Delete constraint
  const handleDeleteConstraint = (id: string) => {
    const target = constraints.find((c) => c.id === id);
    setConstraints((prev) => prev.filter((c) => c.id !== id));
    showToast(`Deleted constraint: ${target?.name || id}`);
  };

  // Open edit modal
  const handleStartEdit = (c: ConstraintItem) => {
    setEditingConstraint(c);
    setEditParamValue(c.parameterValue);
  };

  // Save edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConstraint) return;

    const numericVal = Number(editParamValue);
    const finalVal = isNaN(numericVal) ? editParamValue : numericVal;

    setConstraints((prev) =>
      prev.map((c) =>
        c.id === editingConstraint.id ? { ...c, parameterValue: finalVal } : c
      )
    );

    showToast(`Updated ${editingConstraint.name} parameter to ${finalVal} ${editingConstraint.unit}`);
    setEditingConstraint(null);
  };

  // Handle Add New Constraint
  const handleAddConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const numericVal = Number(newParamValue);
    const finalVal = isNaN(numericVal) ? newParamValue : numericVal;

    const created: ConstraintItem = {
      id: `CST-USR-${Date.now().toString().slice(-4)}`,
      code: `USR_${newName.toUpperCase().replace(/\s+/g, '_').slice(0, 16)}`,
      name: newName,
      category: newCategory,
      scope: newScope,
      targetEntity: newEntity,
      parameterName: newParamName,
      parameterValue: finalVal,
      unit: newUnit,
      defaultValue: finalVal,
      isEnabled: true,
      isEditable: true,
      mathematicalExpression: newMathExpr,
      businessRationale: newRationale,
    };

    setConstraints([created, ...constraints]);
    showToast(`Added new ${newCategory}: "${newName}"`);
    setNewName('');
    setIsAddModalOpen(false);
  };

  // Filter constraints
  const filteredConstraints = constraints.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedScope !== 'all' && c.scope !== selectedScope) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.targetEntity.toLowerCase().includes(q) ||
        c.businessRationale.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast alert */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B66] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center space-x-2 border border-sky-400 animate-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-sky-100 text-[#002B66] text-xs font-semibold mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>North America Optimization Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Constraint Management &amp; Rule Builder Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Inspect, edit parameters, toggle, and add new mathematical rules that govern the Gurobi MILP solver across The Estée Lauder Companies prestige manufacturing facilities.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Constraint / Rule</span>
          </button>
        </div>

        {/* 4 Constraint Classifications Explainer for Client */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          
          <div className="p-3.5 bg-purple-50 rounded-lg border border-purple-100">
            <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">1. Objective Function</span>
            <p className="text-xs font-bold text-slate-900 mt-1">What the solver maximizes/minimizes</p>
            <p className="text-[11px] text-slate-600 mt-1">
              e.g., Minimize makespan, minimize solvent washdown hours, maximize customer OTIF.
            </p>
          </div>

          <div className="p-3.5 bg-red-50 rounded-lg border border-red-100">
            <span className="text-[10px] font-bold text-red-900 uppercase tracking-wider block">2. Hard Constraint</span>
            <p className="text-xs font-bold text-slate-900 mt-1">Non-negotiable physical/FDA laws</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Cannot be violated. e.g., Max molder speed 5,200 units/h, FDA cGMP 36h sanitation cleanout, kettle 125°C ceiling.
            </p>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">3. Business &amp; Regulatory Rule</span>
            <p className="text-xs font-bold text-slate-900 mt-1">Enterprise operating policies</p>
            <p className="text-[11px] text-slate-600 mt-1">
              e.g., 48-Hour demand freeze window, active menthol allergen isolation protocol, max 72h molten wax holding.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">4. Soft Operational Preference</span>
            <p className="text-xs font-bold text-slate-900 mt-1">Desirable operational targets</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Violations incur penalty costs. e.g., Daylight shift preference for QA colorimeter shade releases, worker overtime caps.
            </p>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules, codes, parameters..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B66]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#002B66]"
          >
            <option value="all">All Categories ({constraints.length})</option>
            <option value="Objective Function">Objective Functions</option>
            <option value="Hard Engineering Constraint">Hard Constraints</option>
            <option value="Business & Regulatory Rule">Business Rules</option>
            <option value="Soft Operational Preference">Soft Preferences</option>
          </select>

          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#002B66]"
          >
            <option value="all">All Scopes</option>
            <option value="All Plants (North America)">All NA Plants</option>
            <option value="Plant-Specific">Plant-Specific</option>
            <option value="Line-Specific">Line-Specific</option>
            <option value="SKU-Specific">SKU-Specific</option>
          </select>

          <button
            onClick={() => {
              setConstraints(INITIAL_CONSTRAINTS);
              setSelectedCategory('all');
              setSelectedScope('all');
              setSearchQuery('');
              showToast('Reset all constraints to benchmark factory defaults.');
            }}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
            title="Reset all rules to benchmark defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

        </div>
      </div>

      {/* Constraints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredConstraints.map((c) => {
          const isHard = c.category === 'Hard Engineering Constraint';
          const isObj = c.category === 'Objective Function';
          const isBus = c.category === 'Business & Regulatory Rule';
          
          return (
            <div
              key={c.id}
              className={`bg-white rounded-xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                c.isEnabled
                  ? isHard
                    ? 'border-red-200 ring-1 ring-red-100'
                    : isObj
                    ? 'border-purple-200 ring-1 ring-purple-100'
                    : 'border-slate-200 hover:border-slate-300'
                  : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                {/* Header: Code + Category Badge + Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{c.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isHard 
                        ? 'bg-red-100 text-red-800' 
                        : isObj 
                        ? 'bg-purple-100 text-purple-900' 
                        : isBus 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {c.category.split(' ')[0]}
                    </span>
                  </div>

                  {/* Toggle On/Off */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {c.isEnabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleConstraint(c.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        c.isEnabled ? 'bg-[#002B66]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          c.isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Constraint Name & Target */}
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.scope}
                    </span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium truncate">Target: {c.targetEntity}</span>
                  </div>
                </div>

                {/* Parameter Value Display Box */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Parameter: {c.parameterName}
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                      <span className="text-lg font-extrabold text-[#002B66] tabular-nums font-mono">
                        {typeof c.parameterValue === 'number' ? c.parameterValue.toLocaleString() : c.parameterValue}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{c.unit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartEdit(c)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-[#002B66] bg-white hover:bg-slate-100 border border-slate-300 rounded shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Value</span>
                  </button>
                </div>

                {/* Mathematical Expression & Rationale */}
                <div className="space-y-1.5 text-xs">
                  <div className="font-mono text-[11px] bg-slate-900 text-sky-300 p-2 rounded overflow-x-auto">
                    {c.mathematicalExpression}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    <strong className="text-slate-800">Rationale: </strong>{c.businessRationale}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Default: {c.defaultValue} {c.unit}</span>
                {c.isEditable && (
                  <button
                    onClick={() => handleDeleteConstraint(c.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Delete custom constraint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Parameter Modal */}
      {editingConstraint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Constraint Parameter</h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{editingConstraint.code}</p>
              </div>
              <button
                onClick={() => setEditingConstraint(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Constraint Name</label>
                <p className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-semibold">
                  {editingConstraint.name}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Parameter Value ({editingConstraint.unit})
                </label>
                <input
                  type="text"
                  required
                  value={editParamValue}
                  onChange={(e) => setEditParamValue(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-[#002B66]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Factory default baseline: <strong className="font-mono">{editingConstraint.defaultValue} {editingConstraint.unit}</strong>
                </p>
              </div>

              <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 text-[11px] text-sky-900">
                Changing this parameter will trigger recalculation in the Gurobi optimization solver matrix upon next execution.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingConstraint(null)}
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#002B66] hover:bg-[#001D45] text-white font-semibold shadow-xs"
                >
                  Apply &amp; Re-calibrate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Constraint Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Custom Optimization Rule / Constraint</h3>
                <p className="text-xs text-slate-500">Inject custom engineering boundaries or business rules into the solver.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddConstraint} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rule / Constraint Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Line 2 Hot-Pour Chilling Tunnel Speed Restriction"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Classification</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ConstraintCategory)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B66]"
                  >
                    <option value="Hard Engineering Constraint">Hard Constraint (Non-negotiable)</option>
                    <option value="Objective Function">Objective Function (Goal)</option>
                    <option value="Business & Regulatory Rule">Business &amp; Regulatory Rule</option>
                    <option value="Soft Operational Preference">Soft Operational Preference</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scope</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value as ConstraintScope)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B66]"
                  >
                    <option value="All Plants (North America)">All NA Plants</option>
                    <option value="Plant-Specific">Plant-Specific</option>
                    <option value="Line-Specific">Line-Specific</option>
                    <option value="SKU-Specific">SKU-Specific</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Parameter Name</label>
                  <input
                    type="text"
                    required
                    value={newParamName}
                    onChange={(e) => setNewParamName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Value</label>
                  <input
                    type="text"
                    required
                    value={newParamValue}
                    onChange={(e) => setNewParamValue(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mathematical Formulation</label>
                <input
                  type="text"
                  required
                  value={newMathExpr}
                  onChange={(e) => setNewMathExpr(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md font-mono bg-slate-900 text-sky-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Rationale &amp; Audit Reason</label>
                <textarea
                  rows={2}
                  required
                  value={newRationale}
                  onChange={(e) => setNewRationale(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#002B66] hover:bg-[#001D45] text-white font-semibold"
                >
                  Save &amp; Activate Constraint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
