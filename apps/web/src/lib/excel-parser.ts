import * as XLSX from 'xlsx';

// Raw row from parsed Excel/CSV
export interface RawRow {
  row_number: number;
  office_name: string;
  name: string;
  name_ar?: string;
  nationality: string;
  date_of_birth: string;
  marital_status: string;
  religion: string;
  salary: string;
  experience_years?: string;
  service_type?: string;
  languages?: string;
  whatsapp_number?: string;
  contact_number?: string;
  cv_reference?: string;
  sex?: string;
  education_level?: string;
  has_children?: string;
  job_type?: string;
  package_type?: string;
  cooking_skills?: string;
  baby_sitter?: string;
  office_fees?: string;
  availability?: string;
  bio?: string;
  bio_ar?: string;
}

export interface ParseResult {
  success: boolean;
  rows: RawRow[];
  errors: string[];
  totalRows: number;
}

// Column header mapping - flexible matching
const HEADER_MAPPING: Record<string, string> = {
  // Office
  'office_name': 'office_name',
  'office name': 'office_name',
  'officename': 'office_name',
  'office': 'office_name',

  // Name
  'name': 'name',
  'full name': 'name',
  'full name (english)': 'name',
  'name_en': 'name',
  'english name': 'name',

  // Name Arabic
  'name_ar': 'name_ar',
  'full name (arabic)': 'name_ar',
  'arabic name': 'name_ar',
  'الاسم': 'name_ar',

  // Nationality
  'nationality': 'nationality',
  'country': 'nationality',
  'الجنسية': 'nationality',

  // Date of birth
  'date_of_birth': 'date_of_birth',
  'date of birth': 'date_of_birth',
  'dob': 'date_of_birth',
  'birth date': 'date_of_birth',
  'birthdate': 'date_of_birth',
  'تاريخ الميلاد': 'date_of_birth',

  // Marital status
  'marital_status': 'marital_status',
  'marital status': 'marital_status',
  'status': 'marital_status',
  'الحالة الاجتماعية': 'marital_status',

  // Religion
  'religion': 'religion',
  'الديانة': 'religion',

  // Salary
  'salary': 'salary',
  'salary (aed)': 'salary',
  'monthly salary': 'salary',
  'الراتب': 'salary',

  // Experience
  'experience_years': 'experience_years',
  'experience years': 'experience_years',
  'years of experience': 'experience_years',
  'experience': 'experience_years',
  'سنوات الخبرة': 'experience_years',

  // Service type
  'service_type': 'service_type',
  'service type': 'service_type',
  'type': 'service_type',
  'نوع الخدمة': 'service_type',

  // Languages
  'languages': 'languages',
  'language': 'languages',
  'languages (comma-separated)': 'languages',
  'اللغات': 'languages',

  // WhatsApp
  'whatsapp_number': 'whatsapp_number',
  'whatsapp number': 'whatsapp_number',
  'whatsapp': 'whatsapp_number',
  'واتساب': 'whatsapp_number',

  // Contact
  'contact_number': 'contact_number',
  'contact number': 'contact_number',
  'phone': 'contact_number',
  'phone number': 'contact_number',
  'رقم الهاتف': 'contact_number',

  // CV Reference
  'cv_reference': 'cv_reference',
  'cv reference': 'cv_reference',
  'cv ref': 'cv_reference',
  'reference': 'cv_reference',
  'مرجع السيرة الذاتية': 'cv_reference',

  // Sex
  'sex': 'sex',
  'gender': 'sex',
  'الجنس': 'sex',

  // Education
  'education_level': 'education_level',
  'education level': 'education_level',
  'education': 'education_level',
  'مستوى التعليم': 'education_level',

  // Has children
  'has_children': 'has_children',
  'has children': 'has_children',
  'children': 'has_children',
  'لديها أطفال': 'has_children',

  // Job type
  'job_type': 'job_type',
  'job type': 'job_type',
  'job': 'job_type',
  'نوع الوظيفة': 'job_type',

  // Package type
  'package_type': 'package_type',
  'package type': 'package_type',
  'package': 'package_type',
  'نوع الباقة': 'package_type',

  // Cooking skills
  'cooking_skills': 'cooking_skills',
  'cooking skills': 'cooking_skills',
  'cooking': 'cooking_skills',
  'مهارات الطبخ': 'cooking_skills',

  // Baby sitter
  'baby_sitter': 'baby_sitter',
  'baby sitter': 'baby_sitter',
  'babysitter': 'baby_sitter',
  'جليسة أطفال': 'baby_sitter',

  // Office fees
  'office_fees': 'office_fees',
  'office fees': 'office_fees',
  'office fees (aed)': 'office_fees',
  'fees': 'office_fees',
  'رسوم المكتب': 'office_fees',

  // Availability
  'availability': 'availability',
  'location': 'availability',
  'التوفر': 'availability',

  // Bio
  'bio': 'bio',
  'bio (english)': 'bio',
  'biography': 'bio',
  'description': 'bio',
  'نبذة': 'bio',

  // Bio Arabic
  'bio_ar': 'bio_ar',
  'bio (arabic)': 'bio_ar',
  'arabic bio': 'bio_ar',
  'النبذة بالعربية': 'bio_ar',
};

// Required columns
const REQUIRED_COLUMNS = [
  'office_name',
  'name',
  'nationality',
  'date_of_birth',
  'marital_status',
  'religion',
  'salary',
];

/**
 * Map raw headers to standardized column names
 */
export function mapHeaders(headers: string[]): Map<number, string> {
  const columnMap = new Map<number, string>();

  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim();
    const mapped = HEADER_MAPPING[normalized];
    if (mapped) {
      columnMap.set(index, mapped);
    }
  });

  return columnMap;
}

/**
 * Parse an Excel or CSV file
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const errors: string[] = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, {
      type: 'array',
      cellDates: true,
      dateNF: 'yyyy-mm-dd',
    });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { success: false, rows: [], errors: ['No sheets found in file'], totalRows: 0 };
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      return { success: false, rows: [], errors: ['Could not read sheet'], totalRows: 0 };
    }

    // Convert to array of arrays format
    const rawData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      raw: false,
    }) as (string | number | null | undefined)[][];

    if (rawData.length < 2) {
      return { success: false, rows: [], errors: ['File must have at least a header row and one data row'], totalRows: 0 };
    }

    // First row is headers
    const headers = rawData[0].map(h => String(h || '').trim());
    const columnMap = mapHeaders(headers);

    // Check for required columns
    const mappedColumns = new Set(columnMap.values());
    const missingRequired = REQUIRED_COLUMNS.filter(col => !mappedColumns.has(col));
    if (missingRequired.length > 0) {
      errors.push(`Missing required columns: ${missingRequired.join(', ')}`);
      return { success: false, rows: [], errors, totalRows: 0 };
    }

    // Parse data rows
    const rows: RawRow[] = [];
    const dataRows = rawData.slice(1);

    for (let i = 0; i < dataRows.length; i++) {
      const rowData = dataRows[i];

      // Skip empty rows
      const hasData = rowData.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
      if (!hasData) continue;

      const row: Partial<RawRow> = { row_number: i + 2 }; // +2 for 1-indexed and header row

      columnMap.forEach((colName, colIndex) => {
        const value = rowData[colIndex];
        if (value !== null && value !== undefined) {
          const strValue = formatCellValue(value);
          if (strValue) {
            (row as Record<string, unknown>)[colName] = strValue;
          }
        }
      });

      rows.push(row as RawRow);
    }

    if (rows.length === 0) {
      return { success: false, rows: [], errors: ['No data rows found'], totalRows: 0 };
    }

    if (rows.length > 500) {
      return {
        success: false,
        rows: [],
        errors: [`File contains ${rows.length} rows. Maximum allowed is 500.`],
        totalRows: rows.length
      };
    }

    return { success: true, rows, errors: [], totalRows: rows.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error parsing file';
    return { success: false, rows: [], errors: [message], totalRows: 0 };
  }
}

/**
 * Format cell value to string
 */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '';

  // Handle Date objects
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '';
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Handle numbers (including Excel serial dates)
  if (typeof value === 'number') {
    // Check if it might be an Excel date serial number
    // Excel dates are numbers > 10000 and < 100000 typically
    if (value > 10000 && value < 100000 && !Number.isInteger(value)) {
      // This might be a date serial number
      const date = excelDateToJSDate(value);
      if (date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    return String(value);
  }

  return String(value).trim();
}

/**
 * Convert Excel serial date to JS Date
 */
function excelDateToJSDate(serial: number): Date | null {
  // Excel dates start from 1900-01-01 (serial 1)
  // But Excel has a bug where it thinks 1900 was a leap year
  // So we need to adjust for dates after Feb 28, 1900
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400 * 1000;
  const date = new Date(utcValue);

  // Check if valid date in reasonable range
  const year = date.getFullYear();
  if (year >= 1940 && year <= 2010) {
    return date;
  }
  return null;
}

/**
 * Generate a downloadable Excel template
 */
export function generateTemplate(
  columns: { key: string; header: string; required: boolean; example: string }[]
): Blob {
  const workbook = XLSX.utils.book_new();

  // Create headers and example row
  const headers = columns.map(c => c.header);
  const exampleRow = columns.map(c => c.example);

  // Create worksheet data
  const wsData = [headers, exampleRow];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  worksheet['!cols'] = columns.map(() => ({ wch: 20 }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Maids Import');

  // Generate binary string
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
