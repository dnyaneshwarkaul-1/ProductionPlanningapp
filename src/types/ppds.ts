/**
 * The Estée Lauder Companies
 * Prestige Beauty, Cosmetics & Luxury Skincare PPDS Domain Types
 * Multi-dimensional: Plant × SKU × Line × Month × Day × Shift
 */

export type PlantId = 
  | 'EL-MELVILLE' 
  | 'EL-WHITMAN' 
  | 'EL-MARKHAM' 
  | 'NA-NEENAH' 
  | 'NA-ROSWELL' 
  | 'NA-BEECH';

export interface Plant {
  id: PlantId;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  compoundingCapacityKgHr: number;
  totalLines: number;
  activeLines: string[];
}

export type MachineId = 
  | 'Kettle1' 
  | 'Kettle2' 
  | 'Machine1' 
  | 'Machine2' 
  | 'Machine3' 
  | 'Portion1' 
  | 'Portion2';

export interface Machine {
  id: MachineId;
  name: string;
  category: 'Compounding Vessel' | 'Primary Molding' | 'Hot-Pour Filling' | 'Secondary Cartoner' | 'Bulk Packaging';
  status: 'operational' | 'washdown' | 'sanitation' | 'idle';
  currentSpeedUnitsHr: number;
  maxSpeedUnitsHr: number;
  lineId: string;
}

export type PackSize = 
  | '3.5g Tube' 
  | '4.2g Stick' 
  | '10g Medical Tube' 
  | '15ml Squeeze' 
  | '50g Clinical Jar' 
  | '50ml Luxury Jar'
  | '50ml Serum Dropper'
  | '5kg Bulk Kettle';

export interface ShadeFormulation {
  id: string; // 's1' ... 's9'
  code: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  productType: 'Lipstick' | 'Lip Balm' | 'Medical Ointment' | 'Antiseptic Salve' | 'Luxury Skincare' | 'Sculpting Lipstick';
  washdownClass: 'Standard Clean' | 'Intense Dye Purge' | 'Allergen / Menthol Sanitization' | 'Sterile Medical CIP' | 'Active Botanical Sanitization' | 'Sterile Skincare CIP';
}

export interface SKU {
  materialCode: string;
  shortDescription: string;
  brand: 'Estée Lauder' | 'Clinique' | 'MAC Cosmetics' | 'Bobbi Brown' | 'La Mer' | 'The Estée Lauder Companies' | string;
  shadeId: string;
  packSize: PackSize;
  netWeightGrams: number;
  unitsPerShipperCase: number;
  shelfLifeMonths: number;
  waxToPigmentRatio: number;
  kettleBatchSizeKg: number;
}

export type ShiftType = 
  | 'Shift 1 - Day (07:00 - 15:30)' 
  | 'Shift 2 - Swing (15:30 - 23:30)' 
  | 'Shift 3 - Graveyard (23:30 - 07:00)';

export interface ScheduledJob {
  id: string;
  jobCode: string;
  lineId: string;
  machineId: MachineId;
  shadeId: string;
  packSize: PackSize;
  skuCode: string;
  skuDescription: string;
  startHour: number; // 0.00 to 168.00 within week
  endHour: number;
  durationHours: number;
  productionUnits: number;
  productionKg: number;
  isChangeover?: boolean;
  changeoverFromShade?: string;
  changeoverToShade?: string;
  isSanitationBreak?: boolean;
  sanitationType?: 'FDA cGMP 36H Clean' | 'Hot Solvent Flush' | 'Sterile Swab Rinse';
  shiftAssigned: ShiftType;
  dayAssigned: number; // 1 to 7
  status: 'planned' | 'in_progress' | 'completed' | 'flagged';
  complianceScore: number;
}

export interface DemandRecord {
  shadeId: string;
  shadeName: string;
  packSize: PackSize;
  demandUnits: number;
  actualProductionUnits: number;
  gapUnits: number;
  gapPercent: number;
  serviceLevelOtifPercent: number;
}

export interface ScenarioKPIs {
  totalMakespanHours: number;
  changeoverWashHours: number;
  demandVsActualGapPercent: number;
  serviceLevelOtifPercent: number;
  totalJobsCount: number;
  totalMachinesCount: number;
  totalSetupChanges: number;
  oeePercent: number;
  solventScrapCostUsd: number;
  energyConsumptionKwh: number;
  sanitationHours: number;
  scheduledWeek: number;
}

export interface HistoricalTrendPoint {
  date: string;
  dayLabel: string;
  otifPercent: number;
  makespanHours: number;
  targetOtif: number;
  washdownHours: number;
  solventCostUsd: number;
  solverRunSeconds: number;
  jobsCount: number;
}

export type ScenarioId = 
  | 'min_changeover' 
  | 'max_throughput' 
  | 'balanced_cost' 
  | 'zero_overtime'
  | string;

export type ScenarioStatus = 
  | 'Draft' 
  | 'Under Review' 
  | 'Approved' 
  | 'Published' 
  | 'Locked for MES Dispatch' 
  | 'Archived';

export interface ScenarioAuditLog {
  id: string;
  action: 'Created' | 'Edited' | 'Reviewed' | 'Approved' | 'Published' | 'Locked' | 'Archived' | 'Simulated';
  user: string;
  role: string;
  timestamp: string;
  details: string;
}

export interface OptimizationScenario {
  id: ScenarioId;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  solverStrategy: string;
  status: ScenarioStatus;
  version: string;
  author: string;
  lastUpdated: string;
  targetOtifPercent?: number;
  maxHorizonHours?: number;
  weights?: {
    makespan: number;
    changeover: number;
    otif: number;
    energy: number;
  };
  isPublished?: boolean;
  publishedAt?: string;
  publishedBy?: string;
  kpis: ScenarioKPIs;
  tradeOffHighlights: {
    pros: string[];
    cons: string[];
  };
  auditTrail?: ScenarioAuditLog[];
}

// ==========================================
// CONSTRAINT MANAGEMENT & RULE BUILDER MODEL
// ==========================================
export type ConstraintCategory = 
  | 'Objective Function' 
  | 'Hard Engineering Constraint' 
  | 'Business & Regulatory Rule' 
  | 'Soft Operational Preference';

export type ConstraintScope = 
  | 'All Plants (North America)' 
  | 'Plant-Specific' 
  | 'Line-Specific' 
  | 'SKU-Specific';

export interface ConstraintItem {
  id: string;
  code: string;
  name: string;
  category: ConstraintCategory;
  scope: ConstraintScope;
  targetEntity: string; // e.g. "Line 1 Molding", "Kettle 1 & 2", "All Lipsticks"
  parameterName: string;
  parameterValue: number | string;
  unit: string;
  defaultValue: number | string;
  isEnabled: boolean;
  isEditable: boolean;
  mathematicalExpression: string;
  businessRationale: string;
  penaltyWeightUsd?: number;
}

// ==========================================
// APPROVAL WORKFLOW & TASK MODEL
// ==========================================
export interface ApprovalStep {
  role: string;
  approverName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: string;
  comments?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  plantId: PlantId;
  lineId: string;
  shift: ShiftType;
  day: string;
  assigneeName: string;
  assigneeRole: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  category: 'FDA cGMP Clean' | 'Pigment Flush Washdown' | 'Quality & Microbial Release' | 'Batch Staging' | 'Tooling Setup';
  dueTime: string;
  details: string;
}

export type UserRole = 
  | 'Enterprise Optimization Principal'
  | 'Director of NA Operations'
  | 'Lead Production Optimization Specialist'
  | 'Line Shift Supervisor'
  | 'VP North America Supply Chain'
  | 'Plant Operations Manager'
  | 'QA & Regulatory Specialist'
  | string;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plantId: PlantId;
  facilityName: string;
  department: string;
  avatarBg: string;
  permissions: string[];
  title?: string;
  ssoProvider?: 'Azure AD' | 'Okta SSO' | 'Ping Identity';
  lastLogin?: string;
  mfaStatus?: 'Enforced (FIDO2)' | 'SMS OTP' | 'Hardware Token';
  isCustomPersona?: boolean;
}

export interface DataRequirementField {
  name: string;
  type: 'STRING' | 'INTEGER' | 'FLOAT' | 'DATE' | 'ENUM';
  required: boolean;
  description: string;
  sampleValue: string;
  validationRule: string;
}

export interface RequiredDataset {
  id: string;
  title: string;
  code: string;
  updateFrequency: string;
  primaryKey: string;
  description: string;
  businessImpact: string;
  fields: DataRequirementField[];
  sampleRows: Record<string, string | number>[];
}

export interface HistoricalPerformanceRecord {
  id: string;
  date: string;
  plantId: PlantId;
  plantName: string;
  lineId: string;
  category: 
    | 'Prestige Lipsticks & Color Cosmetics' 
    | 'Lip Treatments & Crystal Balms' 
    | 'Luxury Skincare, Serums & Cremes' 
    | 'Prestige Compounding & Bulk Flacons'
    | 'Lipsticks & Color Cosmetics' 
    | 'Lip Balms & Medicated Sticks' 
    | 'Clinical Ointments & Barrier Jars' 
    | 'Institutional & Bulk Packaging';
  skuCode: string;
  skuDescription: string;
  shadeName: string;
  shift: ShiftType;
  plannedUnits: number;
  actualUnits: number;
  otifPercent: number;
  oeePercent: number;
  oeeAvailability: number;
  oeePerformance: number;
  oeeQuality: number;
  makespanHours: number;
  changeoverWashHours: number;
  changeoverCount: number;
  solventScrapCostUsd: number;
  energyKwh: number;
  cgmpCompliancePercent: number;
  unplannedDowntimeHours: number;
}

export interface CategoryDemandGapRecord {
  shadeId: string;
  shadeName: string;
  category: string;
  color: string;
  demandKg: number;
  actualProdKg: number;
  gapKg: number;
  gapPercent: number;
  demandUnits: number;
  actualProdUnits: number;
  gapUnits: number;
  otifContributionPercent: number;
  assignedLine: string;
  status: 'Target Met' | 'Deficit Backorder' | 'Buffer Build';
  revenueAtRiskUsd: number;
  primaryCustomer: string;
}

export interface SkuDemandGapRecord {
  skuCode: string;
  skuDescription: string;
  shadeId: string;
  shadeName: string;
  category: string;
  packSize: PackSize;
  netWeightGrams: number;
  demandKg: number;
  actualProdKg: number;
  gapKg: number;
  gapPercent: number;
  demandUnits: number;
  actualProdUnits: number;
  gapUnits: number;
  stockCoverageDays: number;
  backorderRisk: 'None' | 'Low Buffer' | 'At Risk' | 'Critical Shortage';
  primaryAccount: string;
  assignedMachine: MachineId;
}

export type PersonaPerspective = 'executive' | 'planner' | 'supervisor' | 'operator';

// ========================================================
// MODULE 3: SEQUENCING OPTIMIZATION ENGINE TYPES (PULSE BRD)
// ========================================================

export interface FactChangeoverMatrixEntry {
  fromSku: string;
  fromSkuName: string;
  toSku: string;
  toSkuName: string;
  lineId: string;
  avgChangeoverHours: number;
  changeoverType: 'minor' | 'major' | 'format' | 'wash';
  cleaningRequiredFlag: boolean;
  solventLitersEstimate?: number;
}

export interface SequencingCandidateSku {
  id: string;
  skuCode: string;
  skuDescription: string;
  orderNumber: string; // SAP AUFNR
  shadeId: string;
  shadeName: string;
  color: string;
  packSize: PackSize;
  plannedUnits: number;
  plannedKg: number;
  goldStandardSpeedUpm: number;
  lineCapabilityUpm: number;
  materialReadinessPercent: number; // SAP MSEG / RESB
  materialStatus: 'Ready (100%)' | 'Partial (88%)' | 'Restricted' | 'Staged';
  isLockedInPosition: boolean;
  lockedPosition?: number;
  isExcluded: boolean;
  priorityWeight: number; // 1 to 5
  dueHour: number;
}

export interface FactSequencePosition {
  position: number;
  sku: SequencingCandidateSku;
  startHour: number;
  endHour: number;
  durationHours: number;
  changeoverHoursFromPrev: number;
  changeoverType: 'start_of_shift' | 'minor' | 'major' | 'format' | 'wash';
  cleaningRequired: boolean;
  expectedThroughputUnits: number;
  goldStandardDeviationUpm: number;
  expectedOeePercent: number;
  scoreContribution: number;
}

export interface SequenceScenarioOption {
  id: 'option_a' | 'option_b' | 'option_c' | string;
  name: string;
  badge: string;
  description: string;
  objectiveFocus: string;
  sequence: FactSequencePosition[];
  totalThroughputUnits: number;
  totalChangeoverHours: number;
  goldStandardAdherencePercent: number;
  expectedOeePercent: number;
  totalObjectiveScore: number;
  throughputImprovementVsBaselinePercent: number;
  changeoverReductionVsBaselinePercent: number;
  costSavingsUsd: number;
  assetUtilizationPercent: number;
  permutationsEvaluated: number;
  weights: {
    changeoverTime: number;
    throughput: number;
    gsAdherence: number;
    resourceAvailability: number;
  };
}
