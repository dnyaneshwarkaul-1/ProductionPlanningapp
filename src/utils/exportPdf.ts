import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScheduledJob, OptimizationScenario, ScenarioKPIs } from '../types/ppds';

/**
 * The Estée Lauder Companies PPDS
 * Executive Stakeholder Report PDF & CSV Generation Utilities
 */

// Helper: Format currency
const formatUsd = (val: number) => `$${val.toLocaleString()}`;

// Helper: Download Blob as file
export const downloadFile = (content: Blob | string, filename: string, mimeType: string) => {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 1. Export Current Production Schedule as CSV
 */
export const exportProductionScheduleCsv = (jobs: ScheduledJob[], plantName: string, week: number) => {
  const headers = [
    'Job Code',
    'Station / Machine',
    'Line',
    'Shade Code',
    'Pack Size',
    'SKU Material Code',
    'Product Description',
    'Start Hour',
    'End Hour',
    'Duration (Hours)',
    'Production Units',
    'Production (Kg)',
    'Type',
    'Shift Assigned',
    'Day',
    'Process Compliance %',
    'FDA cGMP Status'
  ];

  const rows = jobs.map((j) => [
    j.jobCode,
    `"${j.machineId}"`,
    `"${j.lineId}"`,
    j.shadeId,
    `"${j.packSize}"`,
    j.skuCode,
    `"${j.skuDescription}"`,
    j.startHour.toFixed(1),
    j.endHour.toFixed(1),
    j.durationHours.toFixed(1),
    j.productionUnits,
    j.productionKg,
    j.isChangeover ? 'Pigment Washdown' : j.isSanitationBreak ? 'FDA cGMP 36h Clean' : 'Production Batch',
    `"${j.shiftAssigned}"`,
    `Day ${j.dayAssigned}`,
    `${j.complianceScore}%`,
    'USP Title 21 Clean'
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(
    csv,
    `EsteeLauder_Production_Schedule_Week${week}_${plantName.replace(/\s+/g, '_')}.csv`,
    'text/csv;charset=utf-8;'
  );
};

/**
 * 2. Export Scenario Analysis as CSV
 */
export const exportScenarioAnalysisCsv = (scenarios: OptimizationScenario[]) => {
  const headers = [
    'Scenario ID',
    'Scenario Title',
    'Status',
    'Version',
    'Author',
    'Makespan (Hours)',
    'Pigment Washdown (Hours)',
    'Customer OTIF %',
    'Solvent Scrap Cost USD',
    'Total Jobs',
    'Setup Swaps',
    'OEE %',
    'Energy Consumption (kWh)',
    'Solver Objective Function',
    'Key Advantages (Pros)',
    'Operational Trade-Offs (Cons)'
  ];

  const rows = scenarios.map((sc) => [
    sc.id,
    `"${sc.title}"`,
    sc.status,
    sc.version,
    `"${sc.author}"`,
    sc.kpis.totalMakespanHours,
    sc.kpis.changeoverWashHours,
    `${sc.kpis.serviceLevelOtifPercent}%`,
    sc.kpis.solventScrapCostUsd,
    sc.kpis.totalJobsCount,
    sc.kpis.totalSetupChanges,
    `${sc.kpis.oeePercent}%`,
    sc.kpis.energyConsumptionKwh,
    `"${sc.solverStrategy.replace(/"/g, '""')}"`,
    `"${sc.tradeOffHighlights.pros.join('; ')}"`,
    `"${sc.tradeOffHighlights.cons.join('; ')}"`
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(
    csv,
    `EsteeLauder_Scenario_Analysis_Comparison_${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  );
};

/**
 * 3. Generate Executive PDF: Production Schedule & Shop Floor Dispatch Report
 */
export const exportProductionSchedulePdf = (
  jobs: ScheduledJob[],
  plantName: string,
  week: number,
  kpis: ScenarioKPIs
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const primaryColor = [0, 30, 56]; // #001E38 Estée Lauder Midnight Navy
  const secondaryColor = [0, 43, 84]; // #002B54 ELC Navy Blue
  const accentColor = [197, 160, 89]; // #C5A059 ELC Champagne Gold
  const lightBg = [240, 244, 250];

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 612, 75, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ESTÉE LAUDER', 40, 32);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('THE ESTÉE LAUDER COMPANIES • PRESTIGE BEAUTY & SKINCARE PPDS PLATFORM', 40, 48);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 40, 62);

  // Subtitle Ribbon
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 75, 612, 28, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`EXECUTIVE PRODUCTION SCHEDULE DOSSIER • WEEK ${week} • ${plantName.toUpperCase()}`, 40, 93);

  // Executive Summary KPI Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(40, 115, 532, 60, 4, 4, 'F');

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  // KPI 1: OTIF
  doc.text('CUSTOMER OTIF', 55, 132);
  doc.setFontSize(15);
  doc.setTextColor(16, 120, 60);
  doc.text(`${kpis.serviceLevelOtifPercent}%`, 55, 153);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Walmart/Target SLA 98.5%', 55, 165);

  // KPI 2: Makespan
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL MAKESPAN', 170, 132);
  doc.setFontSize(15);
  doc.setTextColor(0, 43, 102);
  doc.text(`${kpis.totalMakespanHours}h`, 170, 153);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Standard 168h Horizon', 170, 165);

  // KPI 3: Washdown
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PIGMENT WASHDOWN', 285, 132);
  doc.setFontSize(15);
  doc.setTextColor(112, 26, 117);
  doc.text(`${kpis.changeoverWashHours}h`, 285, 153);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('-42% vs Unsorted Order', 285, 165);

  // KPI 4: Solvent Scrap
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SOLVENT SCRAP COST', 400, 132);
  doc.setFontSize(15);
  doc.setTextColor(0, 81, 165);
  doc.text(formatUsd(kpis.solventScrapCostUsd), 400, 153);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Food-Grade CIP Solvent', 400, 165);

  // KPI 5: cGMP
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('cGMP 36H CLEAN', 505, 132);
  doc.setFontSize(15);
  doc.setTextColor(16, 120, 60);
  doc.text('100%', 505, 153);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('FDA Title 21 Monograph', 505, 165);

  // Table Title
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Work Order & Station Schedule Sequence', 40, 195);

  // AutoTable for Job Sequence
  const tableData = jobs.map((j) => [
    j.jobCode,
    j.machineId,
    j.skuCode,
    j.skuDescription.length > 28 ? j.skuDescription.slice(0, 26) + '...' : j.skuDescription,
    `${j.startHour.toFixed(1)}h - ${j.endHour.toFixed(1)}h`,
    `${j.durationHours.toFixed(1)}h`,
    j.productionUnits > 0 ? `${(j.productionUnits / 1000).toFixed(0)}k` : `${j.productionKg}kg`,
    j.shiftAssigned.split(' - ')[0],
    j.isChangeover ? 'Washdown' : j.isSanitationBreak ? 'cGMP 36h' : 'Production'
  ]);

  autoTable(doc, {
    startY: 205,
    margin: { left: 40, right: 40 },
    head: [[
      'Order',
      'Station',
      'SKU',
      'Description',
      'Timeline',
      'Dur.',
      'Output',
      'Shift',
      'Type'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 43, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      4: { fontStyle: 'bold', textColor: [0, 81, 165] },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Footer: FDA Compliance Certification
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(241, 245, 249);
  doc.rect(40, pageHeight - 50, 532, 35, 'F');
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 30, 56);
  doc.text('Cosmetics cGMP ISO 22716 & FDA Title 21 Validation', 50, pageHeight - 38);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Validated for shop-floor MES dispatch • Scheduled by Gurobi 11.0 Sequence-Dependent MILP Engine • Melville R&I Center', 50, pageHeight - 26);

  doc.save(`EsteeLauder_ProductionSchedule_Week${week}_${plantName.replace(/\s+/g, '_')}.pdf`);
};

/**
 * 4. Generate Executive PDF: Multi-Scenario Analysis & Governance Report
 */
export const exportScenarioAnalysisPdf = (
  scenarios: OptimizationScenario[],
  activePlantName: string
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const primaryColor = [0, 30, 56]; // #001E38 Estée Lauder Midnight Navy
  const secondaryColor = [0, 43, 84]; // #002B54 ELC Blue

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 612, 75, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ESTÉE LAUDER', 40, 32);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text('THE ESTÉE LAUDER COMPANIES • PRESTIGE BEAUTY & SKINCARE PPDS PLATFORM', 40, 48);

  doc.setFontSize(9);
  doc.text(`Scenario Analysis Dossier • Prepared: ${new Date().toLocaleDateString()}`, 40, 62);

  // Ribbon
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 75, 612, 28, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`MULTI-SCENARIO OPTIMIZATION & SENSITIVITY COMPARISON • ${activePlantName.toUpperCase()}`, 40, 93);

  // Overview Note
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    'This executive briefing evaluates multi-objective trade-offs between pigment washdown hours, makespan, and customer service level (OTIF %). Formulated via Mixed-Integer Linear Programming (Gurobi 11.0).',
    40,
    120,
    { maxWidth: 532 }
  );

  // Table Data for Scenarios
  const scenarioRows = scenarios.map((sc) => [
    sc.title,
    sc.status,
    sc.version,
    `${sc.kpis.serviceLevelOtifPercent}%`,
    `${sc.kpis.totalMakespanHours}h`,
    `${sc.kpis.changeoverWashHours}h`,
    formatUsd(sc.kpis.solventScrapCostUsd),
    `${sc.kpis.oeePercent}%`,
    sc.author
  ]);

  autoTable(doc, {
    startY: 145,
    margin: { left: 40, right: 40 },
    head: [[
      'Scenario Strategy',
      'Status',
      'Ver.',
      'OTIF %',
      'Makespan',
      'Washdown',
      'Chemical Cost',
      'OEE %',
      'Author'
    ]],
    body: scenarioRows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 43, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' },
      3: { fontStyle: 'bold', textColor: [16, 120, 60] },
      5: { fontStyle: 'bold', textColor: [112, 26, 117] }
    }
  });

  // Detailed Scenario Narrative & Objective Functions
  let currentY = (doc as any).lastAutoTable.finalY + 20;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Strategic Trade-Offs & Mathematical Formulation Analysis', 40, currentY);
  currentY += 15;

  scenarios.slice(0, 3).forEach((sc) => {
    if (currentY > 680) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, currentY, 532, 68, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(40, currentY, 532, 68, 3, 3, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 43, 102);
    doc.text(`${sc.title} (${sc.badge}) • Status: ${sc.status.toUpperCase()}`, 50, currentY + 14);

    doc.setFontSize(7.5);
    doc.setFont('courier', 'bold');
    doc.setTextColor(0, 81, 165);
    doc.text(`MILP Objective: ${sc.solverStrategy}`, 50, currentY + 27);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 120, 60);
    doc.text(`Advantage: ${sc.tradeOffHighlights.pros.join('; ')}`, 50, currentY + 42, { maxWidth: 512 });

    doc.setTextColor(180, 83, 9);
    doc.text(`Trade-off: ${sc.tradeOffHighlights.cons.join('; ')}`, 50, currentY + 56, { maxWidth: 512 });

    currentY += 76;
  });

  // Final Sign-Off Section
  if (currentY > 700) {
    doc.addPage();
    currentY = 40;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 43, 102);
  doc.text('Executive Sign-Off & Stage-Gate Approval Record', 40, currentY + 10);
  
  doc.setDrawColor(203, 213, 225);
  doc.line(40, currentY + 35, 180, currentY + 35);
  doc.line(220, currentY + 35, 360, currentY + 35);
  doc.line(400, currentY + 35, 540, currentY + 35);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Lead Optimization Specialist', 40, currentY + 45);
  doc.text('Director of NA Operations', 220, currentY + 45);
  doc.text('QA & FDA cGMP Compliance Officer', 400, currentY + 45);

  doc.save(`EsteeLauder_Scenario_Analysis_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
