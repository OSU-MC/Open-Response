import {
  STAGE_QUESTION_IN_LECTURE,
  UNSTAGE_QUESTION_IN_LECTURE,
  ADD_STAGED_QUESTION,
  ADD_LECTURE_QUESTIONS,
  TOGGLE_PUBLISHED_FOR_QUESTION_IN_LECTURE,
} from "../actions";

function questionsInLectureReducer(state = {}, action) {
  switch (action.type) {
    case ADD_LECTURE_QUESTIONS:
      let newLectureQuestions = {};
      newLectureQuestions[action.lectureId] = {
        staged: {},
        questions: action.questions,
      };
      return {
        ...state,
        ...newLectureQuestions,
      };
    case STAGE_QUESTION_IN_LECTURE:
      let addedStaged = {};
      addedStaged[action.lectureId] = {
        staged: {
          ...(state[action.lectureId] ? state[action.lectureId].staged : {}),
        },
        questions: [
          ...(state[action.lectureId] ? state[action.lectureId].questions : []),
        ],
      };
      addedStaged[action.lectureId].staged[action.question.id] =
        action.question;
      return {
        ...state,
        ...addedStaged,
      };
    case UNSTAGE_QUESTION_IN_LECTURE:
      let removedStaged = {};
      removedStaged[action.lectureId] = {
        staged: { ...state[action.lectureId].staged } || {},
        questions: [...state[action.lectureId].questions] || [],
      };
      delete removedStaged[action.lectureId].staged[action.question.id];
      return {
        ...state,
        ...removedStaged,
      };
    case ADD_STAGED_QUESTION:
      let updatedQuestions = {};
      const stagedQuestions = { ...state[action.lectureId].staged };
      const questionToAdd = { ...stagedQuestions[action.questionId] };
      delete stagedQuestions[action.questionId];
      updatedQuestions[action.lectureId] = {
        staged: { ...stagedQuestions },
        questions: [
          ...(state[action.lectureId] ? state[action.lectureId].questions : []),
        ],
      };
      updatedQuestions[action.lectureId].questions.push(questionToAdd);
      return {
        ...state,
        ...updatedQuestions,
      };
    case TOGGLE_PUBLISHED_FOR_QUESTION_IN_LECTURE:
      let newQuestions = state[action.lectureId].questions.map((question) => {
        if (question.id === action.questionId) {
          return {
            ...question,
            published: question.published === 1 ? 0 : 1,
          };
        } else {
          return question;
        }
      });
      return {
        ...state,
        [action.lectureId]: {
          ...state[action.lectureId],
          questions: newQuestions,
        },
      };
    default:
      return state;
  }
}

export default questionsInLectureReducer;
