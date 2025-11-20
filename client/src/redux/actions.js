/*
    USER ACTIONS
*/

export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const SET_USER = "SET_USER";

export function login(user, status) {
  return { type: LOGIN, user, status };
}

export function logout() {
  return { type: LOGOUT };
}

export function setUser(user) {
  return { type: SET_USER, user };
}

/*
    COURSES ACTIONS
*/

export const SET_COURSES = "SET_COURSES";
export const CREATE_COURSE = "CREATE_COURSE";
export const DELETE_COURSE = "DELETE_COURSE";
export const UPDATE_COURSE = "UPDATE_COURSE";
export const JOIN_COURSE = "JOIN_COURSE";
export const ADD_ENROLLMENTS = "ADD_ENROLLMENTS";
export const ADD_SECTIONS = "ADD_SECTIONS";
export const ADD_SECTION = "ADD_SECTION";
export const ADD_LECTURES = "ADD_LECTURES";
export const ADD_QUESTIONS = "ADD_QUESTIONS";
export const ADD_LECTURES_IN_SECTION = "ADD_LECTURES_IN_SECTION";
export const PUBLISH_LECTURE_IN_SECTION = "PUBLISH_LECTURE_IN_SECTION";
export const ADD_QUESTION = "ADD_QUESTION";
export const UPDATE_QUESTION_IN_LECTURE = "UPDATE_QUESTION_IN_LECTURE";

export function setCourses(studentCourses, teacherCourses) {
  return { type: SET_COURSES, studentCourses, teacherCourses };
}

export function createCourse(course) {
  return { type: CREATE_COURSE, course };
}

export function deleteCourse(id) {
  return { type: DELETE_COURSE, id };
}

export function updateCourse(course, id) {
  return { type: UPDATE_COURSE, course, id };
}

export function joinCourse(course) {
  return { type: JOIN_COURSE, course };
}

export function addEnrollments(courseId, enrollments) {
  return { type: ADD_ENROLLMENTS, courseId, enrollments };
}

export function addSections(courseId, sections) {
  return { type: ADD_SECTIONS, courseId, sections };
}

export function addSection(courseId, section) {
  return { type: ADD_SECTION, courseId, section };
}

export function addLectures(courseId, lectures) {
  return { type: ADD_LECTURES, courseId, lectures };
}

export function togglePublishedLecture(courseId, lectureId) {
  return { type: TOGGLE_PUBLISHED_STATE_FOR_LECTURE, courseId, lectureId };
}

export function addQuestions(courseId, questions) {
  return { type: ADD_QUESTIONS, courseId, questions };
}

export function addLecturesInSection(sectionId, lectures) {
  return { type: ADD_LECTURES_IN_SECTION, sectionId, lectures };
}

export function publishLectureInSection(sectionId, lectureId) {
  return { type: PUBLISH_LECTURE_IN_SECTION, sectionId, lectureId };
}

export function addQuestion(courseId, question) {
  return { type: ADD_QUESTION, courseId, question };
}

export const STAGE_QUESTION_IN_LECTURE = "STAGE_QUESTION_IN_LECTURE";
export const UNSTAGE_QUESTION_IN_LECTURE = "UNSTAGE_QUESTION_IN_LECTURE";
export const ADD_STAGED_QUESTION = "ADD_STAGED_QUESTION";
export const ADD_LECTURE_QUESTIONS = "ADD_LECTURE_QUESTIONS";
export const TOGGLE_PUBLISHED_FOR_QUESTION_IN_LECTURE =
  "TOGGLE_PUBLISHED_FOR_QUESTION_IN_LECTURE";

export function updateQuestionInLecture(questionId, question) {
  return { type: UPDATE_QUESTION_IN_LECTURE, questionId, question };
}

export function stageQuestionInLecture(lectureId, question) {
  return { type: STAGE_QUESTION_IN_LECTURE, lectureId, question };
}

export function unstageQuestionInLecture(lectureId, question) {
  return { type: UNSTAGE_QUESTION_IN_LECTURE, lectureId, question };
}

export function addStagedQuestion(lectureId, questionId) {
  return { type: ADD_STAGED_QUESTION, lectureId, questionId };
}

export function addLectureQuestions(lectureId, questions) {
  return { type: ADD_LECTURE_QUESTIONS, lectureId, questions };
}

export function togglePublishedForQuestionInLecture(lectureId, questionId) {
  return {
    type: TOGGLE_PUBLISHED_FOR_QUESTION_IN_LECTURE,
    lectureId,
    questionId,
  };
}
