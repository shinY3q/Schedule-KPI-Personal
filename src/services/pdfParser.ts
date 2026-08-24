import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { INPData, INPSubject } from '../types/inp';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export async function parsePdfINP(file: File): Promise<INPData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n=== PAGE ${i} ===\n` + pageText;
    }

    return extractDataFromText(fullText, file.name);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return {
      studentName: 'Невідомий студент',
      group: 'Невідома група',
      academicYear: '2026/2027',
      course: 1,
      faculty: '-',
      department: '-',
      educationForm: 'Очна (денна)',
      educationLevel: 'Бакалавр',
      specialty: '-',
      studyProgram: '-',
      totalCredits: 0,
      subjects: [],
      fileName: file.name,
      uploadDate: new Date().toLocaleDateString('uk-UA'),
    };
  }
}

export function extractDataFromText(text: string, fileName: string = 'ІНП.pdf'): INPData {
  const studentMatch = text.match(/Здобувач\s+([А-ЯІЇЄ][а-яіїє'\s]+[А-ЯІЇЄ][а-яіїє'\s]+[А-ЯІЇЄ][а-яіїє'\s]+)/i) ||
    text.match(/Здобувач\s+([^\n\r]+)/i);
  const studentName = studentMatch ? studentMatch[1].trim().split('\n')[0].replace(/Навчальн.*/, '').trim() : 'Невідомий студент';

  const groupMatch = text.match(/Навчальна\s+група\s+([А-ЯІЇЄA-Z0-9\-–]+)/i);
  const group = groupMatch ? groupMatch[1].trim() : 'Невідома група';

  const yearMatch = text.match(/Навчальний\s+рік\s+([0-9]{4}\/[0-9]{4})/i);
  const academicYear = yearMatch ? yearMatch[1].trim() : '2026/2027';

  const courseMatch = text.match(/Курс\s+([0-9]+)/i);
  const course = courseMatch ? parseInt(courseMatch[1], 10) : 4;

  const facultyMatch = text.match(/Факультет\/Інститут\s+([^Кафедра\n\r]+)/i);
  const faculty = facultyMatch ? facultyMatch[1].trim() : 'Факультет інформатики та обчислювальної техніки';

  const departmentMatch = text.match(/Кафедра\s+([^Факультет\n\r]+)/i);
  const department = departmentMatch ? departmentMatch[1].trim() : '-';

  // We ONLY fall back to empty array if we absolutely can't extract subjects.

  const subjects: INPSubject[] = [];
  
  // Skip headers to prevent false matches with year (e.g. 2026/2027)
  const subjectsStartIndex = text.indexOf('Нормативні');
  const textToSearch = subjectsStartIndex !== -1 ? text.substring(subjectsStartIndex) : text;

  // More robust regex: handles newlines in names, correctly extracts MKR and Individual Tasks columns,
  // and allows control/tasks to be dashes (-)
  const subjectRegex = /(?:^|\s)(\d{1,2})\s+([А-ЯІЇЄ][\s\S]+?)\s+([А-ЯІЇЄA-Z0-9]{2,8})\s+(\d)\s+(\d+[\.,]\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([А-ЯІЇЄа-яіїє]+|-)\s+(\d+|-)\s+([А-ЯІЇЄа-яіїєA-Za-z]+|-)/g;
  let match;
  let currentCategory: 'normative' | 'selective' = 'normative';

  while ((match = subjectRegex.exec(textToSearch)) !== null) {
    const num = parseInt(match[1], 10);
    if (num >= 12) {
      currentCategory = 'selective';
    }

    const name = match[2].trim().replace(/\n/g, ' ');
    const dept = match[3].trim();
    const sem = parseInt(match[4], 10);
    const credits = parseFloat(match[5].replace(',', '.'));
    const hours = parseInt(match[6], 10);
    const lek = parseInt(match[7], 10);
    const prak = parseInt(match[8], 10);
    const lab = parseInt(match[9], 10);
    const srs = parseInt(match[10], 10);
    const control = match[11].trim();
    const mkrText = match[12].trim();
    const indTaskText = match[13].trim();

    subjects.push({
      id: `custom-s-${num}`,
      number: num,
      name,
      cleanName: name.replace(/\(ф\d+\s+б\s+[^\)]+\)/i, '').trim(),
      category: currentCategory,
      department: dept,
      semester: sem,
      credits,
      hours,
      lectures: lek,
      practices: prak,
      labs: lab,
      selfStudy: srs,
      control,
      mkr: mkrText === '-' ? 0 : parseInt(mkrText, 10),
      individualTask: indTaskText
    });
  }

  if (subjects.length === 0) {
    return {
      studentName: studentName || 'Невідомий студент',
      group: group || 'Невідома група',
      academicYear: academicYear || '2026/2027',
      course: course || 1,
      faculty: faculty || '-',
      department: department || '-',
      educationForm: 'Очна (денна)',
      educationLevel: 'Бакалавр',
      specialty: '126 - Інформаційні системи та технології',
      studyProgram: 'Інформаційне забезпечення робототехнічних систем',
      totalCredits: 0,
      subjects: [],
      fileName,
      uploadDate: new Date().toLocaleDateString('uk-UA'),
    };
  }

  return {
    studentName,
    group,
    academicYear,
    course,
    faculty,
    department,
    educationForm: 'Очна (денна)',
    educationLevel: 'Бакалавр',
    specialty: '126 - Інформаційні системи та технології',
    studyProgram: 'Інформаційне забезпечення робототехнічних систем',
    totalCredits: subjects.reduce((sum, s) => sum + s.credits, 0),
    subjects,
    fileName,
    uploadDate: new Date().toLocaleDateString('uk-UA'),
  };
}
