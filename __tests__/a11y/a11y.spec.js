import { test } from '../shared/playwright_fixtures.js';
import { analyzePage } from './axeHelper.js';
import { expect } from '@playwright/test';

test.describe('Accessibility checks for all major pages and modals', () => {
  test('Home Page should have no accessibility violations', async ({ homePage }, testInfo) => {
    const results = await analyzePage(homePage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Login Page should have no accessibility violations', async ({ loginPage }, testInfo) => {
    const results = await analyzePage(loginPage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Create Account Page should have no accessibility violations', async ({ createAccountPage }, testInfo) => {
    const results = await analyzePage(createAccountPage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Reset Page should have no accessibility violations', async ({ resetPage }, testInfo) => {
    const results = await analyzePage(resetPage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Reset Password Page should have no accessibility violations', async ({ resetPasswordPage }, testInfo) => {
    const results = await analyzePage(resetPasswordPage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Student Dashboard (loggedInPageStudent) should have no accessibility violations', async ({ loggedInPageStudent }, testInfo) => {
    const results = await analyzePage(loggedInPageStudent, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Instructor Dashboard (loggedInPageInstructor) should have no accessibility violations', async ({ loggedInPageInstructor }, testInfo) => {
    const results = await analyzePage(loggedInPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Profile Page should have no accessibility violations', async ({ profilePage }, testInfo) => {
    const results = await analyzePage(profilePage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Profile Edit Page should have no accessibility violations', async ({ profileEditPage }, testInfo) => {
    const results = await analyzePage(profileEditPage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Confirm Page should have no accessibility violations', async ({ confirmPage }, testInfo) => {
    const results = await analyzePage(confirmPage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Create Course Page (Instructor Only) should have no accessibility violations', async ({ createCoursePage }, testInfo) => {
    const results = await analyzePage(createCoursePage, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Join Course Modal (Student) should have no accessibility violations', async ({ joinCourseModalStudent }, testInfo) => {
    const results = await analyzePage(joinCourseModalStudent, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Course Page (Student) should have no accessibility violations', async ({ coursePageStudent }, testInfo) => {
    const results = await analyzePage(coursePageStudent, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Lecture Page (Student) should have no accessibility violations', async ({ lecturePageStudent }, testInfo) => {
    const results = await analyzePage(lecturePageStudent, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Question-in-Lecture Page (Student) should have no accessibility violations', async ({ questionInLecturePageStudent }, testInfo) => {
    const results = await analyzePage(questionInLecturePageStudent, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Course Page (Instructor) should have no accessibility violations', async ({ coursePageInstructor }, testInfo) => {
    const results = await analyzePage(coursePageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Section Page (Instructor) should have no accessibility violations', async ({ sectionPageInstructor }, testInfo) => {
    const results = await analyzePage(sectionPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Lecture Templates Page (Instructor) should have no accessibility violations', async ({ lectureTemplatesPageInstructor }, testInfo) => {
    const results = await analyzePage(lectureTemplatesPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Course Roster Page (Instructor) should have no accessibility violations', async ({ courseRosterPagesInstructor }, testInfo) => {
    const results = await analyzePage(courseRosterPagesInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Course Settings Page (Instructor) should have no accessibility violations', async ({ courseSettingsPageInstructor }, testInfo) => {
    const results = await analyzePage(courseSettingsPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Create Section Modal (Instructor) should have no accessibility violations', async ({ courseCreateSectionModalInstructor }, testInfo) => {
    const results = await analyzePage(courseCreateSectionModalInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Create Lecture Modal (Instructor) should have no accessibility violations', async ({ courseCreateLectureModalInstructor }, testInfo) => {
    const results = await analyzePage(courseCreateLectureModalInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Section Lecture Page (Instructor) should have no accessibility violations', async ({ sectionLecturePageInstructor }, testInfo) => {
    const results = await analyzePage(sectionLecturePageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Add Lecture to Section Modal (Instructor) should have no accessibility violations', async ({ addLecturetoSectionModalInstructor }, testInfo) => {
    const results = await analyzePage(addLecturetoSectionModalInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Section Gradebook Page (Instructor) should have no accessibility violations', async ({ sectionGradeBookPageInstructor }, testInfo) => {
    const results = await analyzePage(sectionGradeBookPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('View Lecture Page (Instructor) should have no accessibility violations', async ({ viewLecturePageInstructor }, testInfo) => {
    const results = await analyzePage(viewLecturePageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Edit Lecture Template Page (Instructor) should have no accessibility violations', async ({ lectureTemplateEditPageInstructor }, testInfo) => {
    const results = await analyzePage(lectureTemplateEditPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Add Question to Lecture Template Page (Instructor) should have no accessibility violations', async ({ lectureTemplateEditAddQuestionPageInstructor }, testInfo) => {
    const results = await analyzePage(lectureTemplateEditAddQuestionPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Edit Question in Lecture Template Page (Instructor) should have no accessibility violations', async ({ lectureTemplateEditQuestionEditPageInstructor }, testInfo) => {
    const results = await analyzePage(lectureTemplateEditQuestionEditPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });

  test('Section Roster Page (Instructor) should have no accessibility violations', async ({ sectionRosterPageInstructor }, testInfo) => {
    const results = await analyzePage(sectionRosterPageInstructor, testInfo);
    expect(results.violations).toEqual([]);
  });
});
