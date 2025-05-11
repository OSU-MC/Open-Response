import { test as base } from '@playwright/test';

export const test = base.extend({
    /****************
     * PUBLIC PAGES *
     ****************/
    homePage: async ({ page }, use) => {
        await page.goto('/home');
        await use(page);
    },

    loginPage: async ({ page }, use) => {
        await page.goto('/login');
        await use(page);
    },

    createAccountPage: async ({ page }, use) => {
        await page.goto('/create');
        await use(page);
    },

    resetPage: async ({ page }, use) => {
        await page.goto('/reset');
        await use(page);
    },

    resetPasswordPage: async ({ page }, use) => {
        await page.goto('/reset/password');
        await use(page);
    },

    /*************************
     * AUTHENTICATED SESSION *
     *************************/
    loggedInPageStudent: async ({ page }, use) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'studentuser@open-response.org');
        await page.fill('input[name="rawPassword"]', 'studentstudent');
        await page.click('button[type="submit"][value="Log in"]');
        await page.waitForURL('/');
        await use(page);
    },

    loggedInPageInstructor: async ({ page }, use) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'teacheruser@open-response.org');
        await page.fill('input[name="rawPassword"]', 'teacherteacher');
        await page.click('button[type="submit"][value="Log in"]');
        await page.waitForURL('/');
        await use(page);
    },
    
    rootPage: async ({ loggedInPage }, use) => {
        await loggedInPage.goto('/');
        await use(loggedInPage);
    },

    profilePage: async ({ loggedInPage }, use) => {
        await loggedInPage.goto('/profile');
        await use(loggedInPage);
    },

    confirmPage: async ({ loggedInPage }, use) => {
        await loggedInPage.goto('/confirm');
        await use(loggedInPage);
    },

    createCoursePage: async ({ loggedInPage }, use) => {
        await loggedInPage.goto('/createCourse');
        await use(loggedInPage);
    },

    /****************************************
     * AUTHENTICATED SESSION - DYNAMIC URLS *
     ****************************************/
    coursePage: async ({ loggedInPage }, use) => {
        await use(loggedInPage); // navigated to /:courseId
    },

    courseQuestionsPage: async ({ coursePage }, use) => {
        await use(coursePage); // navigated to /:courseId/questions
    },

    questionDetailPage: async ({ courseQuestionsPage }, use) => {
        await use(courseQuestionsPage); // navigated to /:courseId/questions/:questionId
    },

    questionAddPage: async ({ courseQuestionsPage }, use) => {
        await use(courseQuestionsPage); // navigated to /:courseId/questions/add
    },

    courseLecturesPage: async ({ coursePage }, use) => {
        await use(coursePage); // navigated to /:courseId/lectures
    },

    lectureDetailPage: async ({ courseLecturesPage }, use) => {
        await use(courseLecturesPage); // navigated to /:courseId/lectures/:lectureId
    },

    lectureQuestionsPage: async ({ lectureDetailPage }, use) => {
        await use(lectureDetailPage); // navigated to /:courseId/lectures/:lectureId/questions
    },

    lectureQuestionAddPage: async ({ lectureDetailPage }, use) => {
        await use(lectureDetailPage); // navigated to /:courseId/lectures/:lectureId/questions/add
    },

    lectureQuestionDetailPage: async ({ lectureQuestionsPage }, use) => {
        await use(lectureQuestionsPage); // navigated to /:courseId/lectures/:lectureId/questions/:questionId
    },

    courseRosterPage: async ({ coursePage }, use) => {
        await use(coursePage); // navigated to /:courseId/roster
    },

    sectionDetailPage: async ({ courseRosterPage }, use) => {
        await use(courseRosterPage); // navigated to /:courseId/roster/:sectionId
    },

    createLecturePage: async ({ coursePage }, use) => {
        await use(coursePage); // navigated to /:courseId/createLecture
    },

    courseSectionsPage: async ({ coursePage }, use) => {
        await use(coursePage); // navigated to /:courseId/sections
    },

    sectionPage: async ({ courseSectionsPage }, use) => {
        await use(courseSectionsPage); // navigated to /:courseId/sections/:sectionId
    },

    sectionLecturePage: async ({ sectionPage }, use) => {
        await use(sectionPage); // navigated to /:courseId/sections/:sectionId/lectures/:lectureId
    },
});
