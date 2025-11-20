import {
  ADD_QUESTION,
  PUBLISH_LECTURE_IN_SECTION,
  ADD_LECTURES_IN_SECTION,
  SET_COURSES,
  CREATE_COURSE,
  DELETE_COURSE,
  UPDATE_COURSE,
  JOIN_COURSE,
  ADD_LECTURES,
  ADD_QUESTIONS,
  ADD_SECTIONS,
  ADD_SECTION,
  ADD_ENROLLMENTS,
} from "../actions";

const emptyState = {
  studentCourses: null,
  teacherCourses: null,
  lecturesInSection: {},
  sections: {},
  enrollments: {},
  lectures: {},
  questions: {},
  sections: {},
};

function coursesReducer(state = emptyState, action) {
  switch (action.type) {
    case SET_COURSES: // should be called after API returns course data for a user
      return {
        ...state,
        studentCourses: action.studentCourses,
        teacherCourses: action.teacherCourses,
      };
    case CREATE_COURSE: // should be called after a course has been successfully created
      return {
        ...state,
        teacherCourses: [...state.teacherCourses, action.course],
      };
    case DELETE_COURSE: // should be called after a course has been successfully deleted
      return {
        ...state,
        teacherCourses: state.teacherCourses.map((course) => {
          if (course.id !== action.id) {
            return course;
          }
        }),
      };
    case UPDATE_COURSE:
      return {
        ...state,
        teacherCourses: state.teacherCourses.map((course) => {
          if (course.id === action.id) {
            return action.course;
          } else {
            return course;
          }
        }),
      };
    case JOIN_COURSE: //call when a user joins a course
      //join course always makes the user a student of the course
      return {
        ...state,
        studentCourses: [...state.studentCourses, action.course],
      };
    case ADD_ENROLLMENTS:
      let newEnrollments = {};
      newEnrollments[action.courseId] = action.enrollments;
      return {
        ...state,
        enrollments: {
          ...state.enrollments,
          ...newEnrollments,
        },
      };
    case ADD_SECTIONS:
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.courseId]: action.sections,
        },
      };
    case ADD_SECTION:
      return {
        ...state,
        sections: {
          ...state.sections,
          [action.courseId]: state.sections[action.courseId]
            ? state.sections[action.courseId].concat([action.section])
            : [action.section],
        },
      };
    case ADD_LECTURES: // should be called after API returns course data for a user
      return {
        ...state,
        lectures: {
          ...state.lectures,
          [action.courseId]: action.lectures,
        },
      };
    case ADD_QUESTIONS:
      return {
        ...state,
        questions: {
          ...state.questions,
          [action.courseId]: action.questions,
        },
      };
    case ADD_QUESTION:
      return {
        ...state,
        questions: {
          ...state.questions,
          ...{
            [action.courseId]: {
              ...state.questions[action.courseId],
              [action.question.id]: action.question,
            },
          },
        },
      };
    case ADD_LECTURES_IN_SECTION:
      return {
        ...state,
        lecturesInSection: {
          ...state.lecturesInSection,
          [action.sectionId]: action.lectures,
        },
      };
    case PUBLISH_LECTURE_IN_SECTION:
      let newLecturesInSection = [...state.lecturesInSection[action.sectionId]];
      newLecturesInSection = newLecturesInSection.map((lectureInSection) => {
        if (lectureInSection.id == action.lectureId) {
          return {
            ...lectureInSection,
            published: !lectureInSection.published,
          };
        } else return lectureInSection;
      });
      return {
        ...state,
        lecturesInSection: {
          ...state.lecturesInSection,
          [action.sectionId]: newLecturesInSection,
        },
      };
    default:
      return state;
  }
}

export default coursesReducer;
