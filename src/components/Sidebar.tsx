import React, { useState } from 'react';
import { 
  Calendar, 
  Database, 
  FileSpreadsheet, 
  ClipboardCheck, 
  Presentation, 
  Sliders, 
  GitBranch, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Columns, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Settings, 
  Activity,
  Cpu,
  MapPin,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { NavTab } from './Navbar';
import { PlantId, UserRole } from '../types/ppds';
import { PLANTS, USER_PROFILES } from '../data/mockData';

import { EsteeLauderLogo } from './EsteeLauderLogo';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedPlant: PlantId;
  currentRole: UserRole;
  cockpitSubView?: 'timeline' | 'side_by_side' | 'trends';
  onSelectCockpitSubView?: (subView: 'timeline' | 'side_by_side' | 'trends') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  selectedPlant,
  currentRole,
  cockpitSubView = 'timeline',
  onSelectCockpitSubView,
}) => {
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    scheduling: true,
    rules: true,
  });

  const activePlantObj = PLANTS.find((p) => p.id === selectedPlant) || PLANTS[0];
  const activeUser = USER_PROFILES.find((u) => u.role === currentRole) || USER_PROFILES[0];

  const toggleSubMenu = (menuKey: string) => {
    setOpenSubMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  return (
    <aside
      className={`bg-[#001426] text-slate-200 border-r border-[#001D38] transition-all duration-200 ease-in-out shrink-0 flex flex-col justify-between select-none z-30 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top: Facility Indicator & Quick Collapse Toggle */}
      <div className="p-3 border-b border-[#001D38] flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2.5 truncate">
            <EsteeLauderLogo variant="monogram" theme="navy" />
            <div className="truncate">
              <span className="text-xs font-serif font-bold text-white block truncate leading-tight">
                {activePlantObj.city} Facility
              </span>
              <span className="text-[10px] text-[#D4AF37] font-mono block leading-tight font-medium">
                {activePlantObj.id}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <EsteeLauderLogo variant="monogram" theme="navy" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={isCollapsed ? 'Expand Navigation Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Middle: Navigation Items & Sub-Menus */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        
        {/* Section 1: Core Planning */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Planning &amp; Dispatch
            </p>
          )}

          <div className="space-y-1">
            {/* Sequencing Engine (PULSE Module 3 BRD) */}
            <button
              onClick={() => onSelectTab('sequencing_engine')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'sequencing_engine'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Sequencing Engine Workflow (PULSE Module 3 BRD)"
            >
              <Cpu className="w-4 h-4 shrink-0 text-sky-300" />
              {!isCollapsed && <span className="truncate">Sequencing Engine</span>}
            </button>

            {/* Executive Walkthrough */}
            <button
              onClick={() => onSelectTab('walkthrough')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'walkthrough'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Executive Overview & ROI Walkthrough"
            >
              <Presentation className="w-4 h-4 shrink-0 text-sky-300" />
              {!isCollapsed && <span className="truncate">Executive Brief</span>}
            </button>

            {/* Scheduling Cockpit (with Sub-Menu) */}
            <div>
              <button
                onClick={() => {
                  onSelectTab('cockpit');
                  if (isCollapsed) onToggleCollapse();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'cockpit'
                    ? 'bg-[#0051A5] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="PPDS Scheduling Cockpit & Gantt"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Calendar className="w-4 h-4 shrink-0 text-sky-300" />
                  {!isCollapsed && <span className="truncate">Scheduling Cockpit</span>}
                </div>
                {!isCollapsed && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubMenu('scheduling');
                    }}
                    className="p-0.5 hover:bg-white/20 rounded"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        openSubMenus.scheduling ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                )}
              </button>

              {/* Sub-menu items for Scheduling Cockpit */}
              {!isCollapsed && openSubMenus.scheduling && (
                <div className="ml-5 mt-1 pl-2 border-l border-[#003882] space-y-1 text-[11px]">
                  <button
                    onClick={() => {
                      onSelectTab('cockpit');
                      onSelectCockpitSubView?.('timeline');
                    }}
                    className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center space-x-1.5 ${
                      currentTab === 'cockpit' && cockpitSubView === 'timeline'
                        ? 'text-sky-300 font-bold bg-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span>Gantt Schedule</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('cockpit');
                      onSelectCockpitSubView?.('side_by_side');
                    }}
                    className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center space-x-1.5 ${
                      currentTab === 'cockpit' && cockpitSubView === 'side_by_side'
                        ? 'text-sky-300 font-bold bg-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    <span>Compare Scenarios</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('cockpit');
                      onSelectCockpitSubView?.('trends');
                    }}
                    className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center space-x-1.5 ${
                      currentTab === 'cockpit' && cockpitSubView === 'trends'
                        ? 'text-sky-300 font-bold bg-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>30-Day OTIF Trends</span>
                  </button>
                </div>
              )}
            </div>

            {/* Demand vs Production Tracking KPI Dashboard */}
            <button
              onClick={() => onSelectTab('demand_tracking')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'demand_tracking'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Demand vs Production Tracking KPIs (Category & SKU Gap Analysis)"
            >
              <TrendingUp className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isCollapsed && <span className="truncate">Demand vs Production</span>}
            </button>

            {/* Historical KPI Analytics Dashboard */}
            <button
              onClick={() => onSelectTab('analytics')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'analytics'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Historical KPI Analytics (Plant × Line × Category × SKU)"
            >
              <BarChart3 className="w-4 h-4 shrink-0 text-cyan-300" />
              {!isCollapsed && <span className="truncate">Historical KPIs</span>}
            </button>

            {/* What-If Planning & Approvals */}
            <button
              onClick={() => onSelectTab('scenarios')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'scenarios'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="What-If Stress Testing & Stage-Gate Approvals"
            >
              <GitBranch className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isCollapsed && <span className="truncate">What-If &amp; Approvals</span>}
            </button>
          </div>
        </div>

        {/* Section 2: Mathematical Optimization */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Engine Configuration
            </p>
          )}

          <div className="space-y-1">
            {/* Constraint Studio */}
            <button
              onClick={() => onSelectTab('constraints')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'constraints'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Constraint Studio (Objectives, Hard & Soft Constraints)"
            >
              <Sliders className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed && <span className="truncate">Constraint Studio</span>}
            </button>
          </div>
        </div>

        {/* Section 3: Data & Schema */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Master Data &amp; DB
            </p>
          )}

          <div className="space-y-1">
            {/* Architecture & DB */}
            <button
              onClick={() => onSelectTab('architecture')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'architecture'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="PostgreSQL 15+ Schema & System Architecture"
            >
              <Database className="w-4 h-4 shrink-0 text-sky-400" />
              {!isCollapsed && <span className="truncate">Architecture &amp; DB</span>}
            </button>

            {/* Data Requirements */}
            <button
              onClick={() => onSelectTab('datasets')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'datasets'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="7 Core Required Datasets & CSV Downloads"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0 text-purple-400" />
              {!isCollapsed && <span className="truncate">Data Requirements</span>}
            </button>
          </div>
        </div>

        {/* Section 4: Shop Floor Operations */}
        <div>
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Shop Floor Execution
            </p>
          )}

          <div className="space-y-1">
            {/* Shift Operations */}
            <button
              onClick={() => onSelectTab('tasks')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'tasks'
                  ? 'bg-[#0051A5] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Shift Handover Tasks & FDA cGMP 36h Cleanouts"
            >
              <ClipboardCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isCollapsed && <span className="truncate">Shift Operations</span>}
            </button>
          </div>
        </div>

      </div>

      {/* Bottom: Facility Status Badge */}
      <div className="p-3 border-t border-[#001229] bg-[#001636]">
        {!isCollapsed ? (
          <div className="text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Gurobi Solver:</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>Active v11</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>FDA Monograph:</span>
              <span className="text-sky-300 font-mono">Title 21 cGMP</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Gurobi 11.0 Active • FDA Title 21 Compliant">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>

    </aside>
  );
};
