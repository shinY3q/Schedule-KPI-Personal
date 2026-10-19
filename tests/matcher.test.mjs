import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// Both services only import types, so they can run without a browser or a new test dependency.
async function importService(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

const { filterAndProcessSchedule } = await importService('../src/services/matcher.ts');
const {
  CONFERENCE_LINKS_STORAGE_KEY,
  getSubjectConferenceKey,
  getSubjectConferenceLinks,
  getConferenceLinkFromSet,
} = await importService('../src/services/conferenceLinks.ts');

const vrName = 'Розроблення VR/AR застосунків';
const roboticsName = 'Інтелектуальні технологій в робототехніці';
const englishName = 'Практичний курс іноземної мови професійного спрямування. Частина 2';
const systemsName = 'Управління технічними системами';

const subject = (name, number, category = 'normative') => ({
  id: `test-subject-${number}`, number, name, cleanName: name, category,
  department: 'ІСТ', semester: 7, credits: 0, hours: 0, lectures: 0,
  practices: 0, labs: 0, selfStudy: 0, control: '',
});

const inp = {
  studentName: '', group: 'ІК-31', academicYear: '2026/2027', course: 4,
  faculty: '', department: '', educationForm: '', educationLevel: '',
  specialty: '', studyProgram: '', totalCredits: 0, fileName: '', uploadDate: '',
  subjects: [subject(vrName, 1, 'selective'), subject(roboticsName, 2),
    subject(englishName, 3), subject(systemsName, 4)],
};

const lesson = (name, time, dates = [], type = 'Лек', lecturerId = 'test-lecturer') => ({
  name, time, dates, type, location: null,
  tag: type === 'Прак' ? 'prac' : type === 'Лаб' ? 'lab' : 'lec',
  lecturer: { id: lecturerId, name: '' },
});

// Public API structure observed for group 3672: date fragments share a name/time/type.
const schedule = () => ({
  groupCode: '3672',
  scheduleFirstWeek: [],
  scheduleSecondWeek: [
    { day: 'Пн', pairs: [
      lesson(vrName, '14:15:00', ['2026-10-05', '2026-10-19']),
      lesson(vrName, '14:15:00', ['2026-11-02', '2026-11-16']),
    ] },
    { day: 'Вв', pairs: [
      lesson(roboticsName, '08:30:00', ['2026-10-20']),
      lesson(roboticsName, '08:30:00', ['2026-11-03']),
      lesson(roboticsName, '08:30:00', ['2026-11-17']),
    ] },
    { day: 'Ср', pairs: [
      lesson(englishName, '10:25:00', [], 'Прак'),
      lesson(systemsName, '12:20:00', [], 'Прак'),
    ] },
  ],
});

const process = (raw) => filterAndProcessSchedule(raw, inp, 7).week2;

test('date fragments produce one lesson with all original dates, without mutating the cache', () => {
  const raw = schedule();
  const before = JSON.stringify(raw);
  const week = process(raw);
  assert.equal(week.days[0].lessons.length, 1);
  assert.deepEqual(week.days[0].lessons[0].rawLesson.dates,
    ['2026-10-05', '2026-10-19', '2026-11-02', '2026-11-16']);
  assert.equal(week.days[1].lessons.length, 1);
  assert.deepEqual(week.days[1].lessons[0].rawLesson.dates,
    ['2026-10-20', '2026-11-03', '2026-11-17']);
  assert.equal(JSON.stringify(raw), before);
});

test('Wednesday contains exactly the two official lessons in chronological order', () => {
  const day = process(schedule()).days.find((day) => day.dayCode === 'wed');
  assert.deepEqual(day.lessons.map(({ subjectName, pairNumber }) => ({ subjectName, pairNumber })), [
    { subjectName: englishName, pairNumber: 2 },
    { subjectName: systemsName, pairNumber: 3 },
  ]);
});

test('a type, teacher, or room difference represents a separate lesson with a unique key', () => {
  const raw = schedule();
  raw.scheduleSecondWeek[0].pairs = [
    lesson(vrName, '14:15:00'),
    lesson(vrName, '14:15:00', [], 'Прак'),
    lesson(vrName, '14:15:00', [], 'Лек', 'another-teacher'),
    { ...lesson(vrName, '14:15:00'), location: '101' },
  ];
  const lessons = process(raw).days[0].lessons;
  assert.equal(lessons.length, 4);
  assert.equal(new Set(lessons.map(({ id }) => id)).size, 4);
});

test('lesson keys remain stable after a refresh reorders API date fragments', () => {
  const raw = schedule();
  const ids = process(raw).days.flatMap(({ lessons }) => lessons.map(({ id }) => id));
  raw.scheduleSecondWeek.forEach(({ pairs }) => pairs.reverse());
  const refreshedIds = process(raw).days.flatMap(({ lessons }) => lessons.map(({ id }) => id));
  assert.deepEqual(refreshedIds.sort(), ids.sort());
  assert.equal(new Set(ids).size, ids.length);
});

test('an undated recurring lesson is not narrowed to a duplicate dated fragment', () => {
  const raw = schedule();
  raw.scheduleSecondWeek[0].pairs.push(lesson(vrName, '14:15:00'));
  const lessons = process(raw).days[0].lessons;
  assert.equal(lessons.length, 1);
  assert.deepEqual(lessons[0].rawLesson.dates, []);
});

test('reprocessing retains INP subjects and existing shared and separate conference link keys', () => {
  const inpBefore = JSON.stringify(inp);
  const storedLinks = {
    '7|іст|розроблення vr/ar застосунків': { mode: 'shared', shared: 'https://zoom.us/j/123456789' },
    '7|іст|інтелектуальні технологій в робототехніці': {
      mode: 'separate', lecture: 'https://zoom.us/j/234567891', practice: 'https://zoom.us/j/345678912',
    },
  };
  const linksBefore = JSON.stringify(storedLinks);
  const week = process(schedule());
  const vrSubject = week.days[0].lessons[0].matchedSubject;
  const roboticsSubject = week.days[1].lessons[0].matchedSubject;
  assert.strictEqual(vrSubject, inp.subjects[0]);
  assert.equal(CONFERENCE_LINKS_STORAGE_KEY, 'kpi_subject_conference_links');
  assert.equal(getSubjectConferenceKey(vrSubject), '7|іст|розроблення vr/ar застосунків');
  assert.equal(getConferenceLinkFromSet(getSubjectConferenceLinks(storedLinks, vrSubject), 'lecture'),
    storedLinks[getSubjectConferenceKey(vrSubject)].shared);
  for (const type of ['lecture', 'practice']) {
    assert.equal(getConferenceLinkFromSet(getSubjectConferenceLinks(storedLinks, roboticsSubject), type),
      storedLinks[getSubjectConferenceKey(roboticsSubject)][type]);
  }
  assert.equal(JSON.stringify(inp), inpBefore);
  assert.equal(JSON.stringify(storedLinks), linksBefore);
});
