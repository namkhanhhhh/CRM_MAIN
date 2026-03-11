import * as XLSX from 'xlsx';
import { OpenJob } from '@/types/job';

/**
 * Export jobs to Excel matching the TD Consulting "Job Hunting" sheet format.
 * Yellow columns (HR fills) are left empty; DB columns are pre-filled.
 */
export function exportJobsToExcel(jobs: OpenJob[]) {
  const wb = XLSX.utils.book_new();

  // Header rows
  const headerRow = [
    '', // empty col A
    'Date',
    'Job ID',
    'Client',
    'Ranking',
    'Role',
    'No of headcount',
    'Domain',
    'Level',
    'Range',
    'Estimate Revenue (total)', // yellow - empty
    'Mode',
    'Job requirements', // yellow - empty
    'Min YoE', // yellow - empty
    'JD',
    'Website công ty',
    'Location',
    'Warranty time',
    'BD IN-CHARGE',
    'Note', // yellow - empty
    'Thời gian', // yellow - empty
    'PIC', // yellow - empty
  ];

  const rows: (string | number)[][] = [];

  // Title rows
  rows.push(['', 'JOB HUNTING']);
  rows.push(['', 'TD Consulting - A trusted recruitment partner!']);
  rows.push(['', '*This table and its data are for TDC\'s staff only']);
  rows.push(headerRow);

  // Data rows
  for (const job of jobs) {
    const dateStr = new Date(job.postedAt).toLocaleDateString('en-GB'); // dd/mm/yyyy
    const level = inferLevel(job.salary);
    const mode = job.jobType === 'Full-time' ? 'Office' : job.jobType;

    rows.push([
      '', // col A empty
      dateStr,
      job.code,
      job.clientName,
      '', // Ranking - from customer data, leave for now
      job.title,
      job.candidateCount,
      job.industry,
      level,
      job.salary,
      '', // Estimate Revenue - yellow, empty
      mode,
      '', // Job requirements - yellow, empty
      '', // Min YoE - yellow, empty
      '', // JD link placeholder
      '', // Website placeholder
      job.location,
      `${job.guaranteeDays} ngày`,
      job.ownerName,
      '', // Note - yellow, empty
      '', // Thời gian - yellow, empty
      '', // PIC - yellow, empty
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 3 },   // A
    { wch: 12 },  // Date
    { wch: 14 },  // Job ID
    { wch: 30 },  // Client
    { wch: 10 },  // Ranking
    { wch: 40 },  // Role
    { wch: 14 },  // No of headcount
    { wch: 18 },  // Domain
    { wch: 12 },  // Level
    { wch: 18 },  // Range
    { wch: 22 },  // Estimate Revenue
    { wch: 10 },  // Mode
    { wch: 20 },  // Job requirements
    { wch: 10 },  // Min YoE
    { wch: 15 },  // JD
    { wch: 20 },  // Website
    { wch: 25 },  // Location
    { wch: 15 },  // Warranty
    { wch: 18 },  // BD IN-CHARGE
    { wch: 20 },  // Note
    { wch: 12 },  // Thời gian
    { wch: 12 },  // PIC
  ];

  // Style yellow columns (indices 10, 12, 13, 19, 20, 21) with background
  // XLSX community edition doesn't support styling, but structure is correct

  XLSX.utils.book_append_sheet(wb, ws, 'Job Hunting');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Job_Hunting_TDC_${today}.xlsx`);
}

function inferLevel(salary: string): string {
  // Simple heuristic from salary range
  const num = parseInt(salary.replace(/[^\d]/g, ''));
  if (!num) return '';
  if (num >= 30) return 'Senior';
  if (num >= 15) return 'Mid/Senior';
  if (num >= 8) return 'Middle';
  return 'Junior';
}
