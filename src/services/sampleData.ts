import type { INPData } from '../types/inp';
import type { GroupScheduleRaw } from '../types/schedule';

export const SAMPLE_INP_DANIIL: INPData = {
  studentName: "Ганзіна Данііл Геннадійович",
  group: "ІК-31",
  academicYear: "2026/2027",
  course: 4,
  faculty: "Факультет інформатики та обчислювальної техніки",
  department: "Кафедра інформаційних систем та технологій",
  educationForm: "Очна (денна)",
  educationLevel: "Бакалавр",
  specialty: "126 - Інформаційні системи та технології",
  studyProgram: "Інформаційне забезпечення робототехнічних систем (ЄДЕБО ID: 28546)",
  totalCredits: 60.5,
  fileName: "ІНП_ІК-31_2026.pdf",
  uploadDate: "25.05.2026",
  subjects: [
    {
      id: "s-1",
      number: 1,
      name: "Економіка і підприємництво",
      cleanName: "Економіка і підприємництво",
      category: "normative",
      department: "ЕК",
      semester: 7,
      credits: 3.0,
      hours: 90,
      lectures: 18,
      practices: 18,
      labs: 0,
      selfStudy: 54,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-2",
      number: 2,
      name: "Проєктування інформаційних систем",
      cleanName: "Проєктування інформаційних систем",
      category: "normative",
      department: "ІСТ",
      semester: 7,
      credits: 5.0,
      hours: 150,
      lectures: 36,
      practices: 36,
      labs: 0,
      selfStudy: 78,
      control: "Екзамен",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-3",
      number: 3,
      name: "Інтелектуальні технологій в робототехніці. Курсова робота",
      cleanName: "Інтелектуальні технологій в робототехніці",
      category: "normative",
      department: "ІСТ",
      semester: 7,
      credits: 1.0,
      hours: 30,
      lectures: 0,
      practices: 0,
      labs: 0,
      selfStudy: 30,
      control: "Залік",
      mkr: "-",
      individualTask: "КР"
    },
    {
      id: "s-4",
      number: 4,
      name: "Практичний курс іноземної мови професійного спрямування. Частина 2",
      cleanName: "Практичний курс іноземної мови професійного спрямування",
      category: "normative",
      department: "АМГС3",
      semester: 7,
      credits: 1.5,
      hours: 45,
      lectures: 0,
      practices: 36,
      labs: 0,
      selfStudy: 9,
      control: "-",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-5",
      number: 5,
      name: "Управління технічними системами",
      cleanName: "Управління технічними системами",
      category: "normative",
      department: "ІСТ",
      semester: 7,
      credits: 4.0,
      hours: 120,
      lectures: 36,
      practices: 18,
      labs: 0,
      selfStudy: 66,
      control: "Екзамен",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-6",
      number: 6,
      name: "Інтелектуальні технологій в робототехніці",
      cleanName: "Інтелектуальні технологій в робототехніці",
      category: "normative",
      department: "ІСТ",
      semester: 7,
      credits: 3.5,
      hours: 105,
      lectures: 36,
      practices: 18,
      labs: 0,
      selfStudy: 51,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-12",
      number: 12,
      name: "Менеджмент в продуктовому ІТ (Ф11 Б ІЗР)",
      cleanName: "Менеджмент в продуктовому ІТ",
      category: "selective",
      department: "ІПІ",
      semester: 7,
      credits: 4.0,
      hours: 120,
      lectures: 36,
      practices: 0,
      labs: 18,
      selfStudy: 66,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-13",
      number: 13,
      name: "Розроблення VR/AR застосунків (Ф10 Б ІЗР)",
      cleanName: "Розроблення VR/AR застосунків",
      category: "selective",
      department: "ІСТ",
      semester: 7,
      credits: 4.0,
      hours: 120,
      lectures: 36,
      practices: 0,
      labs: 18,
      selfStudy: 66,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-14",
      number: 14,
      name: "Основи WEB – технологій (Ф9 Б ІЗР)",
      cleanName: "Основи WEB – технологій",
      category: "selective",
      department: "ІСТ",
      semester: 7,
      credits: 4.0,
      hours: 120,
      lectures: 36,
      practices: 0,
      labs: 18,
      selfStudy: 66,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-7",
      number: 7,
      name: "Екологічна та природно-техногенна безпека",
      cleanName: "Екологічна та природно-техногенна безпека",
      category: "normative",
      department: "ОПЦБ",
      semester: 8,
      credits: 2.0,
      hours: 60,
      lectures: 18,
      practices: 18,
      labs: 0,
      selfStudy: 24,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-8",
      number: 8,
      name: "Управління проєктами",
      cleanName: "Управління проєктами",
      category: "normative",
      department: "ІСТ",
      semester: 8,
      credits: 3.0,
      hours: 90,
      lectures: 18,
      practices: 18,
      labs: 0,
      selfStudy: 54,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-9",
      number: 9,
      name: "Практичний курс іноземної мови професійного спрямування. Частина 2",
      cleanName: "Практичний курс іноземної мови професійного спрямування",
      category: "normative",
      department: "АМГС3",
      semester: 8,
      credits: 1.5,
      hours: 45,
      lectures: 0,
      practices: 18,
      labs: 0,
      selfStudy: 27,
      control: "Екзамен",
      mkr: "-",
      individualTask: "-"
    },
    {
      id: "s-10",
      number: 10,
      name: "Переддипломна практика",
      cleanName: "Переддипломна практика",
      category: "normative",
      department: "ІСТ",
      semester: 8,
      credits: 6.0,
      hours: 180,
      lectures: 0,
      practices: 0,
      labs: 0,
      selfStudy: 180,
      control: "Залік",
      mkr: "-",
      individualTask: "-"
    },
    {
      id: "s-11",
      number: 11,
      name: "Дипломне проектування",
      cleanName: "Дипломне проектування",
      category: "normative",
      department: "ІСТ",
      semester: 8,
      credits: 6.0,
      hours: 180,
      lectures: 0,
      practices: 0,
      labs: 0,
      selfStudy: 180,
      control: "Захист",
      mkr: "-",
      individualTask: "-"
    },
    {
      id: "s-15",
      number: 15,
      name: "Сучасні технології розробки програмного забезпечення (Авторський курс компанії SoftServe) (Ф14 Б ІЗР)",
      cleanName: "Сучасні технології розробки програмного забезпечення",
      category: "selective",
      department: "ОТ",
      semester: 8,
      credits: 4.0,
      hours: 120,
      lectures: 36,
      practices: 0,
      labs: 18,
      selfStudy: 66,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-16",
      number: 16,
      name: "Технології штучного інтелекту (Ф13 Б ІЗР)",
      cleanName: "Технології штучного інтелекту",
      category: "selective",
      department: "ІСТ",
      semester: 8,
      credits: 4.0,
      hours: 120,
      lectures: 36,
      practices: 0,
      labs: 18,
      selfStudy: 66,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    },
    {
      id: "s-17",
      number: 17,
      name: "Програмування комп'ютерної графіки (Ф12 Б ІЗР)",
      cleanName: "Програмування комп'ютерної графіки",
      category: "selective",
      department: "ОТ",
      semester: 8,
      credits: 4.0,
      hours: 120,
      lectures: 36,
      practices: 0,
      labs: 18,
      selfStudy: 66,
      control: "Залік",
      mkr: 1,
      individualTask: "-"
    }
  ]
};

export const RAW_SCHEDULE_IK31: GroupScheduleRaw = {
  groupCode: "3672",
  scheduleFirstWeek: [
    {
      day: "Пн",
      pairs: [
        {
          name: "Інженерна комп'ютерна графіка",
          type: "Лек",
          time: "08:30:00",
          location: "Корпус 18, ауд. 420",
          tag: "lec",
          lecturer: { id: "p1", name: "Поліщук Михайло Миколайович" },
          dates: []
        },
        {
          name: "Основи WEB – технологій",
          type: "Лек",
          time: "08:30:00",
          location: "Корпус 18, ауд. 422",
          tag: "lec",
          lecturer: { id: "p2", name: "Коваль Олександр Сергійович" },
          dates: []
        },
        {
          name: "Основи комп’ютерного моделювання",
          type: "Лек",
          time: "08:30:00",
          location: "Корпус 18, ауд. 312",
          tag: "lec",
          lecturer: { id: "p3", name: "Селіванов Віктор Левович" },
          dates: []
        },
        {
          name: "Системи управління мережами",
          type: "Лек",
          time: "08:30:00",
          location: "Корпус 18, ауд. 205",
          tag: "lec",
          lecturer: { id: "p4", name: "Жураковський Богдан Юрійович" },
          dates: []
        },
        {
          name: "Тестування та контроль якості (QA) вбудованих систем",
          type: "Лек",
          time: "08:30:00",
          location: "Корпус 18, ауд. 104",
          tag: "lec",
          lecturer: { id: "p5", name: "Сертифікатна програма ESI&IoT" },
          dates: []
        },
        {
          name: "Інфраструктура програмного забезпечення вебзастосунків",
          type: "Лек",
          time: "10:25:00",
          location: "Корпус 18, ауд. 502",
          tag: "lec",
          lecturer: { id: "p6", name: "Дорошенко Анатолій Юхимович" },
          dates: []
        },
        {
          name: "Менеджмент в продуктовому ІТ",
          type: "Лек",
          time: "10:25:00",
          location: "Корпус 18, ауд. 418",
          tag: "lec",
          lecturer: { id: "p7", name: "Левіщенко Марія Сергіївна" },
          dates: []
        },
        {
          name: "Методи та інструменти продуктової аналітики (Genesis)",
          type: "Лек",
          time: "10:25:00",
          location: "Корпус 18, ауд. 401",
          tag: "lec",
          lecturer: { id: "p8", name: "Генезіс Тім" },
          dates: []
        },
        {
          name: "Проектування мікропроцесорних систем на базі Arduino та Raspberry Pi",
          type: "Лек",
          time: "10:25:00",
          location: "Корпус 18, ауд. 210",
          tag: "lec",
          lecturer: { id: "p9", name: "Гриша Борис Олександрович" },
          dates: []
        },
        {
          name: "Розроблення VR/AR застосунків",
          type: "Лек",
          time: "12:20:00",
          location: "Корпус 18, ауд. 415",
          tag: "lec",
          lecturer: { id: "p10", name: "Тимошенко Дмитро Валерійович" },
          dates: []
        },
        {
          name: "Крос-платформна розробка мобільних додатків",
          type: "Лек",
          time: "12:20:00",
          location: "Корпус 18, ауд. 318",
          tag: "lec",
          lecturer: { id: "p11", name: "Кравець Петро Іванович" },
          dates: []
        }
      ]
    },
    {
      day: "Вт",
      pairs: [
        {
          name: "Інженерна комп'ютерна графіка",
          type: "Лаб",
          time: "10:25:00",
          location: "Корпус 18, ауд. 420",
          tag: "lab",
          lecturer: { id: "p1", name: "Поліщук Михайло Миколайович" },
          dates: []
        },
        {
          name: "Основи WEB – технологій",
          type: "Лаб",
          time: "10:25:00",
          location: "Корпус 18, ауд. 422",
          tag: "lab",
          lecturer: { id: "p2", name: "Коваль Олександр Сергійович" },
          dates: []
        },
        {
          name: "Основи комп’ютерного моделювання",
          type: "Лаб",
          time: "10:25:00",
          location: "Корпус 18, ауд. 312",
          tag: "lab",
          lecturer: { id: "p3", name: "Селіванов Віктор Левович" },
          dates: []
        },
        {
          name: "Менеджмент в продуктовому ІТ",
          type: "Лаб",
          time: "12:20:00",
          location: "Корпус 18, ауд. 418",
          tag: "lab",
          lecturer: { id: "p7", name: "Левіщенко Марія Сергіївна" },
          dates: []
        },
        {
          name: "Розробка мобільних сервісів",
          type: "Лаб",
          time: "12:20:00",
          location: "Корпус 18, ауд. 405",
          tag: "lab",
          lecturer: { id: "p12", name: "Іваненко Іван Іванович" },
          dates: []
        }
      ]
    },
    {
      day: "Ср",
      pairs: [
        {
          name: "Проєктування інформаційних систем",
          type: "Прак",
          time: "08:30:00",
          location: "Корпус 18, ауд. 409",
          tag: "prac",
          lecturer: { id: "p13", name: "Коваль Олександр Сергійович" },
          dates: []
        },
        {
          name: "Практичний курс іноземної мови професійного спрямування. Частина 2",
          type: "Прак",
          time: "10:25:00",
          location: "Корпус 18, ауд. 305",
          tag: "prac",
          lecturer: { id: "p14", name: "Левіщенко Марія Сергіївна" },
          dates: []
        },
        {
          name: "Управління технічними системами",
          type: "Лек",
          time: "12:20:00",
          location: "Корпус 18, ауд. 412",
          tag: "lec",
          lecturer: { id: "p15", name: "Ролік Олександр Іванович" },
          dates: []
        },
        {
          name: "Економіка і підприємництво",
          type: "Лек",
          time: "14:15:00",
          location: "Корпус 7, ауд. 220",
          tag: "lec",
          lecturer: { id: "p16", name: "Мельник Тетяна Олексіївна" },
          dates: []
        }
      ]
    },
    {
      day: "Чт",
      pairs: [
        {
          name: "Інтелектуальні технологій в робототехніці",
          type: "Лек",
          time: "10:25:00",
          location: "Корпус 18, ауд. 407",
          tag: "lec",
          lecturer: { id: "p17", name: "Олійник Володимир Валентинович" },
          dates: []
        },
        {
          name: "Проєктування інформаційних систем",
          type: "Лек",
          time: "12:20:00",
          location: "Корпус 18, ауд. 409",
          tag: "lec",
          lecturer: { id: "p13", name: "Коваль Олександр Сергійович" },
          dates: []
        },
        {
          name: "Управління технічними системами",
          type: "Прак",
          time: "14:15:00",
          location: "Корпус 18, ауд. 412",
          tag: "prac",
          lecturer: { id: "p15", name: "Ролік Олександр Іванович" },
          dates: []
        }
      ]
    },
    {
      day: "Пт",
      pairs: []
    },
    {
      day: "Сб",
      pairs: []
    }
  ],
  scheduleSecondWeek: [
    {
      day: "Пн",
      pairs: [
        {
          name: "Основи WEB – технологій",
          type: "Лек",
          time: "08:30:00",
          location: "Корпус 18, ауд. 422",
          tag: "lec",
          lecturer: { id: "p2", name: "Коваль Олександр Сергійович" },
          dates: []
        },
        {
          name: "Менеджмент в продуктовому ІТ",
          type: "Лек",
          time: "10:25:00",
          location: "Корпус 18, ауд. 418",
          tag: "lec",
          lecturer: { id: "p7", name: "Левіщенко Марія Сергіївна" },
          dates: []
        },
        {
          name: "Розроблення VR/AR застосунків",
          type: "Лек",
          time: "12:20:00",
          location: "Корпус 18, ауд. 415",
          tag: "lec",
          lecturer: { id: "p10", name: "Тимошенко Дмитро Валерійович" },
          dates: []
        }
      ]
    },
    {
      day: "Вт",
      pairs: [
        {
          name: "Розроблення VR/AR застосунків",
          type: "Лаб",
          time: "10:25:00",
          location: "Корпус 18, ауд. 415",
          tag: "lab",
          lecturer: { id: "p10", name: "Тимошенко Дмитро Валерійович" },
          dates: []
        }
      ]
    },
    {
      day: "Ср",
      pairs: [
        {
          name: "Проєктування інформаційних систем",
          type: "Прак",
          time: "08:30:00",
          location: "Корпус 18, ауд. 409",
          tag: "prac",
          lecturer: { id: "p13", name: "Коваль Олександр Сергійович" },
          dates: []
        },
        {
          name: "Практичний курс іноземної мови професійного спрямування. Частина 2",
          type: "Прак",
          time: "10:25:00",
          location: "Корпус 18, ауд. 305",
          tag: "prac",
          lecturer: { id: "p14", name: "Левіщенко Марія Сергіївна" },
          dates: []
        },
        {
          name: "Економіка і підприємництво",
          type: "Прак",
          time: "12:20:00",
          location: "Корпус 7, ауд. 220",
          tag: "prac",
          lecturer: { id: "p16", name: "Мельник Тетяна Олексіївна" },
          dates: []
        }
      ]
    },
    {
      day: "Чт",
      pairs: [
        {
          name: "Інтелектуальні технологій в робототехніці",
          type: "Прак",
          time: "08:30:00",
          location: "Корпус 18, ауд. 407",
          tag: "prac",
          lecturer: { id: "p17", name: "Олійник Володимир Валентинович" },
          dates: []
        },
        {
          name: "Інтелектуальні технологій в робототехніці",
          type: "Лек",
          time: "10:25:00",
          location: "Корпус 18, ауд. 407",
          tag: "lec",
          lecturer: { id: "p17", name: "Олійник Володимир Валентинович" },
          dates: []
        },
        {
          name: "Управління технічними системами",
          type: "Лек",
          time: "12:20:00",
          location: "Корпус 18, ауд. 412",
          tag: "lec",
          lecturer: { id: "p15", name: "Ролік Олександр Іванович" },
          dates: []
        },
        {
          name: "Управління технічними системами",
          type: "Прак",
          time: "14:15:00",
          location: "Корпус 18, ауд. 412",
          tag: "prac",
          lecturer: { id: "p15", name: "Ролік Олександр Іванович" },
          dates: []
        }
      ]
    },
    {
      day: "Пт",
      pairs: []
    },
    {
      day: "Сб",
      pairs: []
    }
  ]
};
