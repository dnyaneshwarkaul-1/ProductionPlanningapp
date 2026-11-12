/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ClientWalkthrough } from './components/ClientWalkthrough';
import { SchedulingCockpit } from './components/SchedulingCockpit';
import { DemandVsProductionDashboard } from './components/DemandVsProductionDashboard';
import { HistoricalPerformanceDashboard } from './components/HistoricalPerformanceDashboard';
import { ConstraintStudioView } from './components/ConstraintStudioView';
import { ScenarioPlanningView } from './components/ScenarioPlanningView';
import { ArchitectureSchemaView } from './components/ArchitectureSchemaView';
import { DataRequirementsView } from './components/DataRequirementsView';
import { TaskManagementView } from './components/TaskManagementView';
import { UserProfileModal } from './components/UserProfileModal';
import { ExportReportModal } from './components/ExportReportModal';
import { SequencingEngineView } from './components/SequencingEngineView';
import { PlantId, UserRole, UserProfile } from './types/ppds';
import { USER_PROFILES, BENCHMARK_JOBS, OPTIMIZATION_SCENARIOS } from './data/mockData';
import { Sparkles, X } from 'lucide-react';
import { EsteeLauderLogo } from './components/EsteeLauderLogo';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('sequencing_engine');
  const [cockpitSubView, setCockpitSubView] = useState<'timeline' | 'side_by_side' | 'trends'>('timeline');
  const [selectedPlant, setSelectedPlant] = useState<PlantId>('EL-MELVILLE');
  // Default Lead Persona: Dnyaneshwar Kaulwar (Enterprise Optimization Principal)
  const [currentRole, setCurrentRole] = useState<UserRole>('Enterprise Optimization Principal');
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(USER_PROFILES);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  
  const [solverToast, setSolverToast] = useState<{
    show: boolean;
    makespan: number;
    washdown: number;
    otif: number;
  } | null>(null);

  // Trigger solver optimization
  const handleRunSolver = () => {
    setIsSolving(true);
    setSolverToast(null);

    setTimeout(() => {
      setIsSolving(false);
      setSolverToast({
        show: true,
        makespan: 144.1,
        washdown: 7.5,
        otif: 97.8,
      });

      if (currentTab !== 'cockpit') {
        setCurrentTab('cockpit');
      }

      setTimeout(() => {
        setSolverToast(null);
      }, 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      
      {/* Top Menu Bar with Breadcrumbs & Global Controls */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedPlant={selectedPlant}
        onSelectPlant={setSelectedPlant}
        currentRole={currentRole}
        userProfiles={userProfiles}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onRunSolver={handleRunSolver}
        isSolving={isSolving}
      />

      {/* Solver Toast Notification */}
      {solverToast?.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#002B66] text-white rounded-xl p-4 shadow-2xl border border-sky-400 flex items-start space-x-3 animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-white text-sm">Gurobi 11.0 Optimization Succeeded</h4>
            <p className="text-slate-200 mt-0.5">
              Sequence-dependent TSP solver converged in 1.2s. Makespan: <strong className="text-white">{solverToast.makespan}h</strong>, Washdown: <strong className="text-emerald-300">{solverToast.washdown}h</strong>, Customer OTIF: <strong className="text-sky-300">{solverToast.otif}%</strong>.
            </p>
          </div>
          <button
            onClick={() => setSolverToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar on Left + Content Viewport on Right */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsible Enterprise Sidebar with Sub-Menus */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          selectedPlant={selectedPlant}
          currentRole={currentRole}
          cockpitSubView={cockpitSubView}
          onSelectCockpitSubView={(subView) => {
            setCockpitSubView(subView);
            setCurrentTab('cockpit');
          }}
        />

        {/* Dynamic Viewport Container */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {currentTab === 'sequencing_engine' && (
              <SequencingEngineView
                selectedPlant={selectedPlant}
                onSelectPlant={setSelectedPlant}
                currentRole={currentRole}
                onOpenExport={() => setIsExportModalOpen(true)}
                onApplyToCockpit={(scId) => {
                  setCurrentTab('cockpit');
                }}
              />
            )}

            {currentTab === 'walkthrough' && (
              <ClientWalkthrough onNavigate={setCurrentTab} />
            )}

            {currentTab === 'cockpit' && (
              <SchedulingCockpit
                selectedPlant={selectedPlant}
                onSelectPlant={setSelectedPlant}
                activeSubView={cockpitSubView}
                onSubViewChange={setCockpitSubView}
                onNavigateToSequencing={() => setCurrentTab('sequencing_engine')}
              />
            )}

            {currentTab === 'demand_tracking' && (
              <DemandVsProductionDashboard
                selectedPlant={selectedPlant}
                onSelectPlant={setSelectedPlant}
                currentRole={currentRole}
                onOpenExport={() => setIsExportModalOpen(true)}
              />
            )}

            {currentTab === 'analytics' && (
              <HistoricalPerformanceDashboard
                selectedPlant={selectedPlant}
                onSelectPlant={setSelectedPlant}
              />
            )}

            {currentTab === 'constraints' && (
              <ConstraintStudioView />
            )}

            {currentTab === 'scenarios' && (
              <ScenarioPlanningView currentRole={currentRole} />
            )}

            {currentTab === 'architecture' && (
              <ArchitectureSchemaView />
            )}

            {currentTab === 'datasets' && (
              <DataRequirementsView />
            )}

            {currentTab === 'tasks' && (
              <TaskManagementView selectedPlant={selectedPlant} />
            )}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-12">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <EsteeLauderLogo variant="wordmark" theme="light" subtext="Global Supply Chain Operations" />
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium">Prestige Beauty &amp; Luxury Skincare PPDS Platform</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span>Plant × SKU × Line × Month × Day × Shift Optimization</span>
                <span>•</span>
                <span>Cosmetic cGMP &amp; ISO 22716 Validated</span>
              </div>
            </div>
          </footer>
        </div>

      </div>

      {/* User Profiles & RBAC Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentRole={currentRole}
        userProfiles={userProfiles}
        onUpdateUserProfiles={setUserProfiles}
        onSelectRole={(r) => {
          setCurrentRole(r);
          setIsProfileOpen(false);
        }}
        selectedPlant={selectedPlant}
      />

      {/* Stakeholder Export Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedPlant={selectedPlant}
      />

    </div>
  );
}
