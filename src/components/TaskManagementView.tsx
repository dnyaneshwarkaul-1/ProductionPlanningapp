import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Filter, 
  ArrowRight,
  Check,
  Building
} from 'lucide-react';
import { TaskItem, PlantId, ShiftType } from '../types/ppds';
import { INITIAL_TASKS, PLANTS } from '../data/mockData';

interface TaskManagementViewProps {
  selectedPlant: PlantId;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({ selectedPlant }) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskItem['category']>('FDA cGMP Clean');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('High');
  const [newTaskShift, setNewTaskShift] = useState<ShiftType>('Shift 1 - Day (07:00 - 15:30)');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('Sarah Jenkins');
  const [newTaskDetails, setNewTaskDetails] = useState<string>('');

  const activePlantObj = PLANTS.find((p) => p.id === selectedPlant) || PLANTS[0];

  const filteredTasks = tasks.filter((t) => {
    if (selectedShift !== 'all' && !t.shift.includes(selectedShift)) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const updateTaskStatus = (taskId: string, nextStatus: TaskItem['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const created: TaskItem = {
      id: `TSK-NA-${Date.now().toString().slice(-4)}`,
      title: newTaskTitle,
      plantId: selectedPlant,
      lineId: 'Line 1',
      shift: newTaskShift,
      day: 'Day 2',
      assigneeName: newTaskAssignee,
      assigneeRole: 'Operator / Lead',
      priority: newTaskPriority,
      status: 'Pending',
      category: newTaskCategory,
      dueTime: 'Next Shift Window',
      details: newTaskDetails || 'Operational signoff required for Estée Lauder cGMP compliance.',
    };

    setTasks([created, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDetails('');
    setIsModalOpen(false);
  };

  const pendingTasks = filteredTasks.filter((t) => t.status === 'Pending');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-sky-100 text-[#002B66] text-xs font-semibold mb-2">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>North America Shift Operations</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Shop-Floor Execution &amp; Shift Handover Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Shift handover logs, pigment washdown checklists, FDA cGMP 36h sanitation sign-offs, and quality releases for <strong className="text-slate-900">{activePlantObj.name}</strong>.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Shift Handover Task</span>
          </button>
        </div>

        {/* Handover Live Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
            <span className="text-[10px] font-bold text-[#002B66] uppercase">Current Shift:</span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">Shift 1 - Day (07:00 - 15:30)</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Supervisor: Sarah Jenkins • 16 Line Operators</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-900 uppercase">Line 1 Rotary Molder:</span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">Active @ 5,200 units/h</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Ruby Red 3.5g Tube (s1) running smoothly</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <span className="text-[10px] font-bold text-purple-900 uppercase">Sanitation Cycle:</span>
            <p className="text-xs font-extrabold text-slate-900 mt-0.5">FDA cGMP 36H Cleanout</p>
            <p className="text-[11px] text-purple-800 mt-0.5">Due: Shift 3 - Graveyard (01:30)</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Operations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#002B66]"
          >
            <option value="all">All Shifts</option>
            <option value="Shift 1">Shift 1 (Day)</option>
            <option value="Shift 2">Shift 2 (Swing)</option>
            <option value="Shift 3">Shift 3 (Graveyard)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-1 focus:ring-[#002B66]"
          >
            <option value="all">All Categories</option>
            <option value="FDA cGMP Clean">FDA cGMP Clean</option>
            <option value="Pigment Flush Washdown">Pigment Flush Washdown</option>
            <option value="Quality & Microbial Release">Quality &amp; Microbial Release</option>
            <option value="Batch Staging">Batch Staging</option>
            <option value="Tooling Setup">Tooling Setup</option>
          </select>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pending */}
        <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Pending Actions</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {pendingTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {pendingTasks.map((task) => (
              <div key={task.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#002B66] bg-sky-50 px-1.5 py-0.5 rounded">
                    {task.id}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    {task.priority}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{task.details}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{task.shift.split(' - ')[0]}</span>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'In Progress')}
                    className="text-xs font-semibold text-[#002B66] hover:text-sky-700 flex items-center space-x-1"
                  >
                    <span>Start Task</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A3E0] animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">In Progress</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {inProgressTasks.map((task) => (
              <div key={task.id} className="bg-white p-3.5 rounded-lg border-2 border-[#0051A5] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#002B66] bg-sky-50 px-1.5 py-0.5 rounded">
                    {task.id}
                  </span>
                  <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded">
                    {task.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                <p className="text-[11px] text-slate-600">{task.details}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Lead: {task.assigneeName}</span>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'Completed')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Complete &amp; Sign</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Signed Off &amp; Verified</h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {completedTasks.map((task) => (
              <div key={task.id} className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {task.id}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center space-x-1">
                    <Check className="w-3 h-3 inline" />
                    <span>VERIFIED</span>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-through leading-snug">{task.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{task.details}</p>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Signoff: {task.assigneeName}</span>
                  <span>{task.dueTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create Shift Operation Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Description / Checklist Action</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delta-E Spectrophotometer check before s2 Mauve run"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskItem['category'])}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B66]"
                  >
                    <option value="FDA cGMP Clean">FDA cGMP Clean</option>
                    <option value="Pigment Flush Washdown">Pigment Flush Washdown</option>
                    <option value="Quality & Microbial Release">Quality &amp; Microbial Release</option>
                    <option value="Batch Staging">Batch Staging</option>
                    <option value="Tooling Setup">Tooling Setup</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskItem['priority'])}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B66]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Shift</label>
                  <select
                    value={newTaskShift}
                    onChange={(e) => setNewTaskShift(e.target.value as ShiftType)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-[#002B66]"
                  >
                    <option value="Shift 1 - Day (07:00 - 15:30)">Shift 1 - Day</option>
                    <option value="Shift 2 - Swing (15:30 - 23:30)">Shift 2 - Swing</option>
                    <option value="Shift 3 - Graveyard (23:30 - 07:00)">Shift 3 - Graveyard</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assignee</label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Operating Instructions</label>
                <textarea
                  rows={3}
                  value={newTaskDetails}
                  onChange={(e) => setNewTaskDetails(e.target.value)}
                  placeholder="Specify solvent volume, mold inspection checklist, or QA limits..."
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#002B66] hover:bg-[#001D45] text-white font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
