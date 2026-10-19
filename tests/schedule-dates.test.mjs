import assert from 'node:assert/strict';
import test from 'node:test';
import { importService } from './helpers/import-service.mjs';

const { getKyivDateKey, hasUpcomingLessonDate, getUpcomingLessonDates } = await importService('../../src/services/scheduleDates.ts');
const { getCurrentWeekInfo } = await importService('../../src/services/kpiApi.ts');

test('the expiry boundary uses the Kyiv calendar, including summer and winter time', () => {
  assert.equal(getKyivDateKey(new Date('2026-10-18T20:59:59Z')), '2026-10-18');
  assert.equal(getKyivDateKey(new Date('2026-10-18T21:00:00Z')), '2026-10-19');
  assert.equal(getKyivDateKey(new Date('2026-12-01T21:59:59Z')), '2026-12-01');
  assert.equal(getKyivDateKey(new Date('2026-12-01T22:00:00Z')), '2026-12-02');
});

test('recurring, current and future series match the official KPI expiry rule', () => {
  assert.equal(hasUpcomingLessonDate([], '2026-10-19'), true);
  assert.equal(hasUpcomingLessonDate(['2026-10-08'], '2026-10-19'), false);
  assert.equal(hasUpcomingLessonDate(['2026-10-19'], '2026-10-19'), true);
  assert.equal(hasUpcomingLessonDate(['2026-10-08', '2026-11-02'], '2026-10-19'), true);
});

test('week selection and lesson expiry share the same Kyiv date boundary', () => {
  assert.equal(getCurrentWeekInfo(new Date('2026-08-31T21:30:00Z')).currentWeek, 1);
  assert.equal(getCurrentWeekInfo(new Date('2026-09-06T21:30:00Z')).currentWeek, 2);
  assert.deepEqual(getCurrentWeekInfo(new Date('2026-10-18T21:30:00Z')),
    { currentWeek: 2, currentDay: 1, currentLesson: 1 });
});

test('the displayed dates are real upcoming occurrences, sorted and without duplicates', () => {
  assert.deepEqual(getUpcomingLessonDates([
    '2026-11-16', '2026-10-05', '2026-10-19', '2026-11-02', '2026-11-02',
  ], '2026-10-19'), ['2026-10-19', '2026-11-02', '2026-11-16']);
});
