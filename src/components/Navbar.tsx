import React from 'react';
import { 
  Calendar, 
  Database, 
  FileSpreadsheet, 
  ClipboardCheck, 
  Presentation, 
  Play, 
  MapPin, 
  UserCheck,
  ChevronDown,
  Sliders,
  GitBranch,
  Columns,
  BarChart3,
  TrendingUp,
  FileDown,
  Cpu
} from 'lucide-react';
import { PlantId, UserRole, UserProfile } from '../types/ppds';
import { PLANTS, USER_PROFILES } from '../data/mockData';

import { EsteeLauderLogo } from './EsteeLauderLogo';

export type NavTab = 
  | 'sequencing_engine'
  | 'cockpit' 
  | 'demand_tracking'
  | 'walkthrough' 
  | 'analytics'
  | 'constraints'
  | 'scenarios'
  | 'architecture' 
  | 'datasets' 
  | 'tasks';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  selectedPlant: PlantId;
  onSelectPlant: (plant: PlantId) => void;
  currentRole: UserRole;
  userProfiles?: UserProfile[];
  onOpenProfile: () => void;
  onOpenExport?: () => void;
  onRunSolver: () => void;
  isSolving: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  selectedPlant,
  onSelectPlant,
  currentRole,
  userProfiles = USER_PROFILES,
  onOpenProfile,
  onOpenExport,
  onRunSolver,
  isSolving,
}) => {
  const activePlantObj = PLANTS.find((p) => p.id === selectedPlant) || PLANTS[0];
  const activeUser = userProfiles.find((u) => u.role === currentRole) || userProfiles[0];

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'sequencing_engine', label: 'Sequencing Engine', icon: <Cpu className="w-4 h-4 text-[#D4AF37]" /> },
    { id: 'cockpit', label: 'Scheduling Cockpit', icon: <Calendar className="w-4 h-4" /> },
    { id: 'demand_tracking', label: 'Demand vs Production', icon: <TrendingUp className="w-4 h-4 text-emerald-300" /> },
    { id: 'analytics', label: 'Historical KPIs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'scenarios', label: 'What-If & Approvals', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'constraints', label: 'Constraint Studio', icon: <Sliders className="w-4 h-4" /> },
    { id: 'walkthrough', label: 'Executive Brief', icon: <Presentation className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture & DB', icon: <Database className="w-4 h-4" /> },
    { id: 'datasets', label: 'Data Requirements', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'tasks', label: 'Shift Operations', icon: <ClipboardCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#001E38] text-white border-b border-[#001426] shadow-md">
      
      {/* Top Utility & Breadcrumb Bar */}
      <div className="bg-[#001224] px-4 sm:px-6 lg:px-8 py-1 border-b border-black/40 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="font-serif tracking-wider font-semibold text-[#D4AF37] uppercase">Estée Lauder</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-200 font-medium">Global Prestige Beauty &amp; Luxury Skincare Supply Chain</span>
          <span className="text-slate-500">/</span>
          <span className="text-white font-semibold">{activePlantObj.name}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-[11px]">
          <span className="text-slate-400">Gurobi MILP Engine: <strong className="text-emerald-400">Online v11.0</strong></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Cosmetics cGMP &amp; ISO 22716: <strong className="text-[#D4AF37]">Compliant</strong></span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          
          {/* Brand Wordmark & Title with Official Estee Lauder Monogram */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center pr-3 border-r border-[#002D54]">
              <EsteeLauderLogo theme="navy" />
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                    isActive
                      ? 'bg-[#002B54] text-white shadow-xs ring-1 ring-[#C5A059]'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Facility Selector, Solver CTA, & User Persona */}
          <div className="flex items-center space-x-2.5">
            
            {/* Plant Facility Selector */}
            <div className="relative hidden sm:flex items-center">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] absolute left-2.5 pointer-events-none" />
              <select
                value={selectedPlant}
                onChange={(e) => onSelectPlant(e.target.value as PlantId)}
                aria-label="Select Estée Lauder manufacturing plant"
                className="text-xs font-semibold text-white bg-[#001426] border border-[#C5A059]/40 rounded-md pl-7 pr-7 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#C5A059] appearance-none cursor-pointer"
              >
                {PLANTS.filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i).map((plant) => (
                  <option key={plant.id} value={plant.id} className="text-slate-900 bg-white">
                    {plant.city}, {plant.state} ({plant.code.split('-')[1]})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Export Dossier CTA */}
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-[#0051A5] hover:bg-[#003882] text-white border border-sky-400/40 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Download presentation-ready PDF reports or raw CSV datasets"
              >
                <FileDown className="w-3.5 h-3.5 text-sky-200" />
                <span className="hidden md:inline">Export Dossier</span>
              </button>
            )}

            {/* Run Solver CTA */}
            <button
              onClick={onRunSolver}
              disabled={isSolving}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-md shadow-xs transition-all cursor-pointer ${
                isSolving
                  ? 'bg-sky-400 text-white cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
              }`}
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isSolving ? 'animate-spin' : ''}`} />
              <span>{isSolving ? 'Optimizing...' : 'Run Solver'}</span>
            </button>

            {/* User Profile / North America Persona Switcher */}
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-2 p-1 pl-2 pr-2.5 rounded-md hover:bg-white/10 border border-[#003882] transition-colors"
              title="Click to switch persona or inspect RBAC permissions"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs border border-white/20"
                style={{ backgroundColor: activeUser.avatarBg }}
              >
                {activeUser.name.charAt(0)}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">{activeUser.name}</p>
                <p className="text-[10px] text-sky-200 leading-tight">{activeUser.role.split(' ')[0]}</p>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-sky-300" />
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Nav Strip */}
      <div className="lg:hidden border-t border-[#001D45] bg-[#001A3E] px-2 py-1.5 flex overflow-x-auto space-x-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              currentTab === item.id
                ? 'bg-[#0051A5] text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
