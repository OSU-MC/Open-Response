import { test as base } from '@playwright/test';

export const test = base.extend({
    /****************
     * PUBLIC PAGES *
     ****************/
    homePage: async ({ page }, use) => {
        await page.goto('/home');
        await page.waitForURL(/\/home/);
        await use(page);
    },

    loginPage: async ({ page }, use) => {
        await page.goto('/login');
        await page.waitForURL(/\/login/);
        await use(page);
    },

    createAccountPage: async ({ page }, use) => {
        await page.goto('/create');
        await page.waitForURL(/\/create/);
        await use(page);
    },

    resetPage: async ({ page }, use) => {
        await page.goto('/reset');
        await page.waitForURL(/\/reset/);
        await use(page);
    },

    resetPasswordPage: async ({ page }, use) => {
        await page.goto('/reset/password');
        await page.waitForURL(/\/reset\/password/);
        await use(page);
    },

    /*************************
     * AUTHENTICATED SESSION *
     *************************/
    loggedInPageStudent: async ({ page }, use) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'studentuser@open-response.org');
        await page.fill('input[name="rawPassword"]', 'studentstudent');
        const log_in_button = page.locator('input[type="submit"][value="Log in"]');
        await log_in_button.click();        
        await page.waitForURL('/');
        await use(page);
    },

    loggedInPageInstructor: async ({ page }, use) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'teacheruser@open-response.org');
        await page.fill('input[name="rawPassword"]', 'teacherteacher');
        const log_in_button = page.locator('input[type="submit"][value="Log in"]');
        await log_in_button.click();
        await page.waitForURL('/');
        await use(page);
    },

    // Does not matter if the user is a student or instructor
    profilePage: async ({ loggedInPageStudent }, use) => {
        await loggedInPageStudent.goto('/profile');
        await loggedInPageStudent.waitForURL(/\/profile/);
        await use(loggedInPageStudent);
    },

    // Does not matter if the user is a student or instructor
    profileEditPage: async ({ profilePage }, use) => {
        const editProfileButton = profilePage.locator('div.profileButton >> button');
        await editProfileButton.click();
        await profilePage.waitForSelector('div.profileButton');
        await profilePage.getByText('Save').click();
        await use(profilePage);
    },

    // Does not matter if the user is a student or instructor
    confirmPage: async ({ loggedInPageStudent }, use) => {
        await loggedInPageStudent.goto('/confirm');
        await loggedInPageStudent.waitForURL(/\/confirm/);
        await use(loggedInPageStudent);
    },

    //! does not matter if the user is a student or instructor - IT SHOULD MATTER
    createCoursePage: async ({ loggedInPageInstructor }, use) => {
        await loggedInPageInstructor.goto('/createCourse');
        await loggedInPageInstructor.waitForURL(/\/createCourse/);
        await use(loggedInPageInstructor);
    },


    joinCourseModalStudent: async ({ loggedInPageStudent }, use) => {
        await loggedInPageStudent.locator('button.join-course').click();
        await loggedInPageStudent.waitForSelector('div.centeredModal');
        await use(loggedInPageStudent);
    },

    /****************************************
     * AUTHENTICATED SESSION - DYNAMIC URLS *
     ****************************************/
    // These assume using the seeded data for the test database, which should be reset berfore the start of each test
    coursePageStudent: async ({ loggedInPageStudent }, use) => {
        const recentCoursesSection = loggedInPageStudent.locator('#courses-page >> .course-section').filter({ 
            has: loggedInPageStudent.locator('h2', { hasText: 'All Courses' }) 
        });
        const courses = recentCoursesSection.locator('div.courses');

        await courses.locator('div.course-card >> a.viewButton').first().click();
        await loggedInPageStudent.waitForURL(/\/\d+\/lectures/);
        await use(loggedInPageStudent); // navigated to /:courseId/lectures
    },

    lecturePageStudent: async ({ coursePageStudent }, use) => {
        const firstLectureCard = coursePageStudent.locator('div.lectures-container >> div.lecture-card').first();
        await firstLectureCard.locator('a.viewLectureBtn').click();
        await coursePageStudent.waitForURL(/\/\d+\/lectures\/\d+/);
        await use(coursePageStudent); // navigated to /:courseId/lectures/:lectureId
    },

    questionInLecturePageStudent: async ({ lecturePageStudent }, use) => {
        const firstQuestionCard = lecturePageStudent.locator('div.question-card-student').first();
        await firstQuestionCard.locator('button.editQuestionBtn').click();
        await lecturePageStudent.waitForURL(/\/\d+\/lectures\/\d+\/questions\/\d+/);
        await use(lecturePageStudent); // navigated to /:courseId/lectures/:lectureId/questions/:questionId
    },

    /***************************
     * INSTRUCTOR DYNAMIC URLS *
     ***************************/
    coursePageInstructor: async ({ loggedInPageInstructor }, use) => {
        const recentCoursesSection = loggedInPageInstructor.locator('#courses-page >> .course-section').filter({ 
            has: loggedInPageInstructor.locator('h2', { hasText: 'Recent Courses' }) 
        });

        const courses = recentCoursesSection.locator('div.courses');

        await courses.locator('div.course-card >> a.viewButton').first().click();
        await loggedInPageInstructor.waitForURL(/\/\d+\/sections/);
        const fullUrl = loggedInPageInstructor.url();
        const baseCourseUrl = fullUrl.replace(/\/sections\/?$/, '');

        // Navigate to the base course page
        await loggedInPageInstructor.goto(baseCourseUrl);
        await loggedInPageInstructor.waitForURL(/\/\d+/);
        await use(loggedInPageInstructor); // navigated to /:courseId/
    },

    sectionPageInstructor: async ({ loggedInPageInstructor }, use) => {
        const recentCoursesSection = loggedInPageInstructor.locator('#courses-page >> .course-section').filter({ 
            has: loggedInPageInstructor.locator('h2', { hasText: 'Recent Courses' }) 
        });

        const courses = recentCoursesSection.locator('div.courses');

        await courses.locator('div.course-card >> a.viewButton').first().click();
        await loggedInPageInstructor.waitForURL(/\/\d+\/sections/);

        await use(loggedInPageInstructor); // navigated to /:courseId/sections
    },

    lectureTemplatesPageInstructor: async ({ sectionPageInstructor }, use) => {
        await sectionPageInstructor.getByText('Lecture Templates').click();
        await sectionPageInstructor.waitForURL(/\/\d+\/lectures/);

        await use(sectionPageInstructor); // navigated to /:courseId/lectures
    },

    courseRosterPagesInstructor: async ({ sectionPageInstructor }, use) => {
        await sectionPageInstructor.getByText('Roster').click();
        await sectionPageInstructor.waitForURL(/\/\d+\/roster/);

        await use(sectionPageInstructor); // navigated to /:courseId/roster
    },

    courseSettingsPageInstructor: async ({ sectionPageInstructor }, use) => {
        await sectionPageInstructor.getByText('Settings').click();
        await sectionPageInstructor.waitForURL(/\/\d+\/settings/);

        await use(sectionPageInstructor); // navigated to /:courseId/settings
    },

    courseCreateSectionModalInstructor: async ({ sectionPageInstructor }, use) => {
        await sectionPageInstructor.getByText('Create Section').click();
        await sectionPageInstructor.waitForSelector('div.popup-container');

        await use(sectionPageInstructor); // navigated to /:courseId/sections
    },

    courseCreateLectureModalInstructor: async ({ lectureTemplatesPageInstructor }, use) => {
        await lectureTemplatesPageInstructor.getByText('Create Lecture').click();
        await lectureTemplatesPageInstructor.waitForSelector('div.popup-container');

        await use(lectureTemplatesPageInstructor); // navigated to /:courseId/lectures
    },

    sectionLecturePageInstructor: async ({ sectionPageInstructor }, use) => {
        const firstSectionCard = sectionPageInstructor.locator('div.section-card').first();
        await firstSectionCard.locator('div.card >> div.card-body').getByText('View Section').click();

        await sectionPageInstructor.waitForURL(/\/\d+\/sections\/\d+/);
        await use(sectionPageInstructor); // navigated to /:courseId/sections/:sectionId
    },

    addLecturetoSectionModalInstructor: async ({ sectionLecturePageInstructor }, use) => {
        await sectionLecturePageInstructor.getByText('Add Lecture').click();
        await sectionLecturePageInstructor.waitForSelector('div.modal-content');

        await use(sectionLecturePageInstructor); // navigated to /:courseId/sections/:sectionId
    },

    sectionGradeBookPageInstructor: async ({ sectionPageInstructor }, use) => {
        const gradebookLink = sectionPageInstructor
            .locator('div.tabs >> a')
            .filter({ has: sectionPageInstructor.locator('span.no-link-style', { hasText: 'Gradebook' }) });

        await gradebookLink.click();
        await sectionPageInstructor.waitForURL(/\/\d+\/sections\/\d+\/grades/);

        await use(sectionPageInstructor); // navigated to /:courseId/grades
    },

    viewLecturePageInstructor: async ({ sectionLecturePageInstructor }, use) => {
        const firstLectureCard = sectionLecturePageInstructor.locator('div.horizontal-flex-container >> div.lecture-card').first().getByText('View Lecture');
        await firstLectureCard.click();

        await sectionLecturePageInstructor.waitForURL(/\/\d+\/sections\/\d+\/lectures\/\d+/);

        await use(sectionLecturePageInstructor); // navigated to /:courseId/sections/:sectionId/lectures/:lectureId
    },

    lectureTemplateEditPageInstructor: async ({ lectureTemplatesPageInstructor }, use) => {
        const editLectureBtn = lectureTemplatesPageInstructor
            .locator('button.viewLectureBtn')
            .filter({ hasText: 'Edit Lecture' });

        await editLectureBtn.first().click();
        await lectureTemplatesPageInstructor.waitForURL(/\/\d+\/lectures\/\d+/);

        await use(lectureTemplatesPageInstructor); // navigated to /:courseId/lectures/:lectureTemplateId
    },

    lectureTemplateEditAddQuestionPageInstructor: async ({ lectureTemplateEditPageInstructor }, use) => {
        const addQuestionsBtn = lectureTemplateEditPageInstructor
            .locator('button.btn-add')
            .filter({ hasText: 'Add Questions' });

        await addQuestionsBtn.click();
        await lectureTemplateEditPageInstructor.waitForURL(/\/\d+\/lectures\/\d+\/questions\/add/);
        await use(lectureTemplateEditPageInstructor); // navigated to /:courseId/lectures/:lectureTemplateId/questions/add
    },

    lectureTemplateEditQuestionEditPageInstructor: async ({ lectureTemplateEditPageInstructor }, use) => {
        const editQuestionBtn = lectureTemplateEditPageInstructor
            .locator('button.editQuestionBtn')
            .filter({ hasText: 'Edit Question' });

        await editQuestionBtn.first().click();
        await lectureTemplateEditPageInstructor.waitForURL(/\/\d+\/lectures\/\d+\/questions\/\d+/);

        await use(lectureTemplateEditPageInstructor); // navigated to /:courseId/lectures/:lectureTemplateId/questions/:questionId
    },

    sectionRosterPageInstructor: async ({ courseRosterPagesInstructor }, use) => {
        const viewStudentsBtn = courseRosterPagesInstructor
            .locator('button.btn')
            .filter({ hasText: 'View students in section' });

        await viewStudentsBtn.first().click();
        await courseRosterPagesInstructor.waitForURL(/\/\d+\/roster\/\d+/);

        await use(courseRosterPagesInstructor); // navigated to /:courseId/roster/:sectionId
    },
});
