export interface INPSubject {
  id: string;
  number: number;
  name: string;
  cleanName: string;
  category: 'normative' | 'selective'; // 'Нормативні' | 'Обрані'
  department: string;
  semester: number;
  credits: number;
  hours: number;
  lectures: number;
  practices: number;
  labs: number;
  selfStudy: number;
  control: string; // 'Залік', 'Екзамен', 'Захист'
  mkr?: number | string;
  individualTask?: string;
}

export interface INPData {
  studentName: string;
  group: string;
  academicYear: string;
  course: number;
  faculty: string;
  department: string;
  educationForm: string;
  educationLevel: string;
  specialty: string;
  studyProgram: string;
  totalCredits: number;
  subjects: INPSubject[];
  fileName: string;
  uploadDate: string;
}
