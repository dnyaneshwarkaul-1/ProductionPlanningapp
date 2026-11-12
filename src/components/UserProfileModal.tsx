import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Key, 
  Check, 
  ShieldCheck, 
  Building,
  Plus,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Radio,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Fingerprint,
  Mail,
  Briefcase,
  X,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { UserRole, PlantId, UserProfile } from '../types/ppds';
import { USER_PROFILES, PLANTS } from '../data/mockData';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  selectedPlant: PlantId;
  userProfiles?: UserProfile[];
  onUpdateUserProfiles?: (profiles: UserProfile[]) => void;
}

type UamTab = 'active_profile' | 'switch_persona' | 'uam_directory' | 'sso_auth';

// Standard Capability Definitions
const ALL_CAPABILITIES = [
  { id: 'view_all', label: 'View All Production Data', category: 'Read Access', desc: 'Can inspect all plant telemetry, lines, and schedules' },
  { id: 'edit_schedule', label: 'Drag & Drop Schedule Editor', category: 'Operational Planning', desc: 'Can reschedule orders, adjust start times, and resize durations' },
  { id: 'run_solver', label: 'Execute Gurobi 11.0 MILP Solver', category: 'Optimization Engine', desc: 'Can trigger mathematical TSP sequence optimization runs' },
  { id: 'modify_constraints', label: 'Constraint Studio CRUD', category: 'Optimization Engine', desc: 'Can create, edit, or disable hard and soft math constraints' },
  { id: 'approve_scenarios', label: 'Stage-Gate Scenario Approval', category: 'Governance', desc: 'Can advance scenario states from Review to Approved' },
  { id: 'lock_mes_dispatch', label: 'Hard Lock to Shop Floor MES', category: 'Shop Floor Execution', desc: 'Can lock work order dispatch to Siemens/Rockwell systems' },
  { id: 'override_constraints', label: 'Emergency Constraint Override', category: 'Governance', desc: 'Can bypass non-critical cGMP sanitation or color rules in emergencies' },
  { id: 'export_sap', label: 'Export PDF & CSV Dossiers', category: 'Data & Reporting', desc: 'Can download executive PDF presentations and raw CSV datasets' },
  { id: 'uam_admin', label: 'User Access Management (UAM)', category: 'Administration', desc: 'Can create, edit, or delete user personas and permissions' },
  { id: 'sso_manage', label: 'Manage Azure AD SSO Config', category: 'Security & Auth', desc: 'Can inspect and re-authenticate SAML/OIDC identity tokens' },
  { id: 'view_all_plants', label: 'Cross-Facility Multi-Plant Access', category: 'Read Access', desc: 'Can toggle freely between Melville, Whitman, and Markham' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  selectedPlant,
  userProfiles = USER_PROFILES,
  onUpdateUserProfiles,
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(userProfiles);
  const [activeTab, setActiveTab] = useState<UamTab>('active_profile');
  
  // Search & Filters in UAM Directory
  const [uamSearch, setUamSearch] = useState<string>('');
  
  // Create / Edit Persona Modal Sub-State
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null); // null = creating new
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('Lead Production Optimization Specialist');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formPlantId, setFormPlantId] = useState<PlantId>('NA-NEENAH');
  const [formDepartment, setFormDepartment] = useState<string>('');
  const [formAvatarBg, setFormAvatarBg] = useState<string>('#002B66');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  // SSO Authentication Simulation State
  const [isSsoAuthenticating, setIsSsoAuthenticating] = useState<boolean>(false);
  const [ssoTokenExpiry, setSsoTokenExpiry] = useState<string>('Valid for 7h 45m');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeUser = profiles.find((u) => u.role === currentRole) || profiles[0];
  const activePlantObj = PLANTS.find((p) => p.id === selectedPlant) || PLANTS[0];

  // Open Add Persona Form
  const handleOpenAddForm = () => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormRole('Lead Production Optimization Specialist');
    setFormTitle('Production Optimization Specialist');
    setFormPlantId('NA-NEENAH');
    setFormDepartment('North America Supply Chain Optimization');
    setFormAvatarBg('#0051A5');
    setFormPermissions(['view_all', 'edit_schedule', 'run_solver', 'export_sap']);
    setIsEditFormOpen(true);
  };

  // Open Edit Persona Form
  const handleOpenEditForm = (profile: UserProfile) => {
    setEditingUserId(profile.id);
    setFormName(profile.name);
    setFormEmail(profile.email);
    setFormRole(profile.role);
    setFormTitle(profile.title || profile.role);
    setFormPlantId(profile.plantId);
    setFormDepartment(profile.department);
    setFormAvatarBg(profile.avatarBg);
    setFormPermissions([...profile.permissions]);
    setIsEditFormOpen(true);
  };

  // Toggle permission in form
  const handleToggleFormPermission = (permId: string) => {
    setFormPermissions((prev) => 
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Save Persona (Create or Update)
  const handleSavePersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Please provide a valid name and email address');
      return;
    }

    const facility = PLANTS.find((p) => p.id === formPlantId)?.name || 'Melville Prestige Manufacturing Campus, NY';

    let updatedList: UserProfile[];
    if (editingUserId) {
      // Update existing
      updatedList = profiles.map((p) => {
        if (p.id !== editingUserId) return p;
        return {
          ...p,
          name: formName,
          email: formEmail,
          role: formRole,
          title: formTitle,
          plantId: formPlantId,
          facilityName: facility,
          department: formDepartment,
          avatarBg: formAvatarBg,
          permissions: formPermissions,
          lastLogin: 'Profile modified just now',
        };
      });
      showToast(`Persona "${formName}" updated successfully.`);
    } else {
      // Add new
      const newProfile: UserProfile = {
        id: `USR-CUSTOM-${Date.now().toString().slice(-4)}`,
        name: formName,
        email: formEmail,
        role: formRole,
        title: formTitle,
        plantId: formPlantId,
        facilityName: facility,
        department: formDepartment,
        avatarBg: formAvatarBg,
        permissions: formPermissions,
        ssoProvider: 'Azure AD',
        lastLogin: 'Active now (Azure AD SSO Validated)',
        mfaStatus: 'Enforced (FIDO2)',
        isCustomPersona: true,
      };
      updatedList = [newProfile, ...profiles];
      showToast(`New Persona "${formName}" added to The Estée Lauder Companies UAM Directory.`);
    }

    setProfiles(updatedList);
    onUpdateUserProfiles?.(updatedList);
    setIsEditFormOpen(false);
  };

  // Delete Persona
  const handleDeletePersona = (id: string, name: string) => {
    if (profiles.length <= 1) {
      showToast('Cannot delete the only remaining persona');
      return;
    }
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    onUpdateUserProfiles?.(updated);
    if (activeUser.id === id) {
      onSelectRole(updated[0].role);
    }
    showToast(`Persona "${name}" removed from directory.`);
  };

  // Simulate Azure AD SSO Authentication Refresh
  const handleSimulateSsoLogin = () => {
    setIsSsoAuthenticating(true);
    setTimeout(() => {
      setIsSsoAuthenticating(false);
      setSsoTokenExpiry('Valid for 8h 00m (Fresh OAuth2 Token)');
      showToast('SSO Token refreshed successfully via The Estée Lauder Companies Azure Active Directory.');
    }, 700);
  };

  // Filtered UAM Directory
  const filteredDirectory = profiles.filter((p) => 
    p.name.toLowerCase().includes(uamSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(uamSearch.toLowerCase()) ||
    p.role.toLowerCase().includes(uamSearch.toLowerCase()) ||
    p.department.toLowerCase().includes(uamSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#001E38] text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  User Access Management (UAM) &amp; Persona Studio
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Azure AD SSO Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage Estée Lauder stakeholder personas, role-based capabilities, and corporate single sign-on authentication.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="my-3 p-3 bg-sky-50 border border-sky-300 text-[#002B66] rounded-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 my-4 border-b border-slate-100 pb-3 shrink-0 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => { setActiveTab('active_profile'); setIsEditFormOpen(false); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'active_profile'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Active Profile</span>
          </button>

          <button
            onClick={() => { setActiveTab('switch_persona'); setIsEditFormOpen(false); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'switch_persona'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Switch Persona ({profiles.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('uam_directory'); setIsEditFormOpen(false); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'uam_directory'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-purple-500" />
            <span>UAM Directory &amp; RBAC</span>
          </button>

          <button
            onClick={() => { setActiveTab('sso_auth'); setIsEditFormOpen(false); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'sso_auth'
                ? 'bg-[#002B66] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-emerald-500" />
            <span>Corporate SSO &amp; MFA</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE PROFILE & CAPABILITIES VIEW */}
        {activeTab === 'active_profile' && (
          <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
            
            {/* Active User Card */}
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-sm shrink-0 border border-white/20"
                  style={{ backgroundColor: activeUser.avatarBg }}
                >
                  {activeUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{activeUser.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#002B66] text-white">
                      CURRENT SESSION
                    </span>
                    {activeUser.name === 'Dnyaneshwar Kaulwar' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Lead Architect</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{activeUser.email}</p>
                  <p className="text-xs font-bold text-[#002B66] mt-0.5">{activeUser.title || activeUser.role}</p>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-sky-200/60 shrink-0">
                <div className="inline-flex items-center space-x-1 text-xs text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-[#002B66]" />
                  <span className="font-bold">{activePlantObj.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{activeUser.department}</p>
                <div className="mt-1 text-[10px] text-emerald-700 font-bold flex items-center sm:justify-end space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{activeUser.lastLogin || 'Azure AD SSO Verified'}</span>
                </div>
              </div>
            </div>

            {/* SSO & Security Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">SSO Identity Provider</span>
                <p className="font-bold text-slate-800 mt-0.5">{activeUser.ssoProvider || 'Azure AD'}</p>
                <span className="text-[10px] text-slate-500">Tenant: esteelauder-global-enterprise</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">MFA Security Policy</span>
                <p className="font-bold text-emerald-700 mt-0.5">{activeUser.mfaStatus || 'Enforced (FIDO2)'}</p>
                <span className="text-[10px] text-slate-500">Hardware token verified</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Session Expiry</span>
                <p className="font-bold text-sky-800 mt-0.5">{ssoTokenExpiry}</p>
                <span className="text-[10px] text-slate-500">JWT Token OAuth 2.0</span>
              </div>
            </div>

            {/* Assigned Capabilities Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-[#002B66]" />
                  <span>Assigned Operational Capabilities ({activeUser.permissions.length} granted)</span>
                </h4>
                <button
                  onClick={() => handleOpenEditForm(activeUser)}
                  className="text-xs font-semibold text-[#002B66] hover:underline flex items-center space-x-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Capabilities</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_CAPABILITIES.map((cap) => {
                  const isGranted = activeUser.permissions.includes(cap.id);
                  return (
                    <div
                      key={cap.id}
                      className={`p-2.5 rounded-lg border flex items-start space-x-2.5 ${
                        isGranted
                          ? 'border-emerald-200 bg-emerald-50/40 text-slate-900'
                          : 'border-slate-200 bg-slate-50/50 text-slate-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isGranted ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-500'
                      }`}>
                        {isGranted ? <Check className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isGranted ? 'text-slate-900' : 'text-slate-400'}`}>
                            {cap.label}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 uppercase">{cap.category}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{cap.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SWITCH PERSONA */}
        {activeTab === 'switch_persona' && (
          <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#002B66]">Multi-Persona Testing Studio:</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Select any stakeholder below to immediately assume their role and simulate how the platform adapts permissions, approvals, and facility views.
                </p>
              </div>
              <button
                onClick={handleOpenAddForm}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg font-bold text-xs shadow-xs shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Persona</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {profiles.map((profile) => {
                const isSelected = profile.role === currentRole;
                return (
                  <div
                    key={profile.id}
                    onClick={() => {
                      onSelectRole(profile.role);
                      showToast(`Switched active session to: ${profile.name} (${profile.role})`);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#002B66] bg-sky-50 ring-2 ring-[#002B66]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0"
                            style={{ backgroundColor: profile.avatarBg }}
                          >
                            {profile.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-xs font-bold text-slate-900">{profile.name}</h4>
                              {profile.name === 'Dnyaneshwar Kaulwar' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                  Architect
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-semibold text-[#002B66]">{profile.role}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#002B66] text-white">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">{profile.department}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{profile.facilityName}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{profile.permissions.length} capabilities granted</span>
                      <div className="flex items-center space-x-1 text-slate-500" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditForm(profile)}
                          className="p-1 hover:text-[#002B66] rounded"
                          title="Edit Persona"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {profile.isCustomPersona && (
                          <button
                            onClick={() => handleDeletePersona(profile.id, profile.name)}
                            className="p-1 hover:text-red-600 rounded"
                            title="Delete Persona"
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

        {/* TAB 3: UAM DIRECTORY & CAPABILITY MATRIX */}
        {activeTab === 'uam_directory' && !isEditFormOpen && (
          <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user by name, email, role..."
                  value={uamSearch}
                  onChange={(e) => setUamSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <button
                onClick={handleOpenAddForm}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create User Persona</span>
              </button>
            </div>

            {/* Directory Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">User Name &amp; Contact</th>
                    <th className="py-2.5 px-3 font-bold">Assigned Role &amp; Title</th>
                    <th className="py-2.5 px-3 font-bold">Assigned Facility</th>
                    <th className="py-2.5 px-3 font-bold text-center">Capabilities</th>
                    <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDirectory.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: profile.avatarBg }}
                          >
                            {profile.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{profile.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">{profile.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#002B66] block leading-tight">{profile.role}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">{profile.department}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium text-[11px]">
                        {profile.facilityName.split(',')[0]}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-[#002B66] font-mono font-bold text-[10px]">
                          {profile.permissions.length} perms
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEditForm(profile)}
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              onSelectRole(profile.role);
                              showToast(`Switched active session to: ${profile.name}`);
                            }}
                            className="px-2 py-1 text-white bg-[#002B66] hover:bg-[#001D45] rounded text-[11px] font-bold"
                          >
                            Switch
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3-SUB: ADD OR EDIT PERSONA FORM */}
        {isEditFormOpen && (
          <form onSubmit={handleSavePersona} className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingUserId ? `Edit User Profile: ${formName}` : 'Create New User Persona'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Back to Directory
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dnyaneshwar Kaulwar"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. dnyaneshwar.kaul@tigeranalytics.com"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66] font-semibold"
                >
                  <option value="Enterprise Optimization Principal">Enterprise Optimization Principal</option>
                  <option value="Director of NA Operations">Director of NA Operations</option>
                  <option value="Lead Production Optimization Specialist">Lead Production Optimization Specialist</option>
                  <option value="Line Shift Supervisor">Line Shift Supervisor</option>
                  <option value="VP North America Supply Chain">VP North America Supply Chain</option>
                  <option value="Plant Operations Manager">Plant Operations Manager</option>
                  <option value="QA & Regulatory Specialist">QA &amp; Regulatory Specialist</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Facility</label>
                <select
                  value={formPlantId}
                  onChange={(e) => setFormPlantId(e.target.value as PlantId)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66] font-semibold"
                >
                  {PLANTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city}, {p.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Department / Organization</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  placeholder="e.g. Advanced Planning & Mathematical Optimization (PPDS)"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#002B66]"
                />
              </div>
            </div>

            {/* Permission Capabilities Matrix Checkbox Grid */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 block">
                  Capability &amp; Access Rights Matrix ({formPermissions.length} selected)
                </span>
                <button
                  type="button"
                  onClick={() => setFormPermissions(ALL_CAPABILITIES.map((c) => c.id))}
                  className="text-[11px] text-[#002B66] font-bold hover:underline"
                >
                  Grant All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {ALL_CAPABILITIES.map((cap) => {
                  const isChecked = formPermissions.includes(cap.id);
                  return (
                    <label
                      key={cap.id}
                      className={`p-2 rounded-lg border flex items-center space-x-2.5 cursor-pointer transition-colors ${
                        isChecked ? 'bg-white border-[#002B66] shadow-xs' : 'bg-slate-100/60 border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleFormPermission(cap.id)}
                        className="rounded border-slate-300 text-[#002B66] focus:ring-[#002B66]"
                      />
                      <div className="truncate">
                        <span className="font-bold text-slate-800 block text-xs truncate">{cap.label}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{cap.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditFormOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
              >
                {editingUserId ? 'Save Profile Changes' : 'Create Persona'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: CORPORATE SSO & MFA MANAGEMENT */}
        {activeTab === 'sso_auth' && (
          <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
            
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">The Estée Lauder Companies Azure Active Directory SSO</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                  CONNECTED &bull; SAML 2.0 / OIDC
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Single Sign-On is federated through The Estée Lauder Companies Global Enterprise Azure AD Tenant (<code>esteelauder.onmicrosoft.com</code>). All authorization tokens inherit cryptographic claims verified by Microsoft Entra ID.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-slate-400">
                <div className="p-2 bg-slate-950/60 rounded">
                  <span className="text-[9px] uppercase text-slate-500 block">Tenant ID:</span>
                  <span className="text-[#D4AF37] truncate block">elc-global-ent-9412</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded">
                  <span className="text-[9px] uppercase text-slate-500 block">Auth Protocol:</span>
                  <span className="text-white block">OAuth 2.0 + SAML</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded">
                  <span className="text-[9px] uppercase text-slate-500 block">MFA Enforcement:</span>
                  <span className="text-emerald-400 block">FIDO2 Biometric</span>
                </div>
                <div className="p-2 bg-slate-950/60 rounded">
                  <span className="text-[9px] uppercase text-slate-500 block">Token Expiry:</span>
                  <span className="text-amber-300 block">{ssoTokenExpiry.split(' ')[2]}</span>
                </div>
              </div>
            </div>

            {/* SSO Action Controls */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">Simulate Identity Provider Operations:</h4>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-slate-600 text-xs">
                  <span className="font-semibold block">Refresh SSO Session Token</span>
                  <span className="text-[11px] text-slate-500">Re-validates identity claims against Estée Lauder enterprise directory.</span>
                </div>
                <button
                  onClick={handleSimulateSsoLogin}
                  disabled={isSsoAuthenticating}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#001E38] hover:bg-[#002D54] text-white rounded-lg font-bold text-xs shadow-xs transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSsoAuthenticating ? 'animate-spin' : ''}`} />
                  <span>{isSsoAuthenticating ? 'Authenticating...' : 'Refresh Azure AD Token'}</span>
                </button>
              </div>
            </div>

            {/* Security Audit Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">FDA Title 21 CFR Part 11 Electronic Records Compliance</span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  All login sessions, schedule dispatches, and Gurobi solver parameter changes are logged with user ID, timestamp, and IP hash for FDA electronic audit trail compliance.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Logged in as: <strong className="text-slate-800">{activeUser.name}</strong> ({activeUser.role})</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#002B66] hover:bg-[#001D45] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
