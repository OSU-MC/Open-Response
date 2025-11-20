import { combineReducers } from "redux";

import userReducer from "./reducers/userReducer";
import coursesReducer from "./reducers/coursesReducer";
import questionsInLectureReducer from "./reducers/questionsInLectureReducer";

const rootReducer = combineReducers({
  user: userReducer,
  courses: coursesReducer,
  lectures: questionsInLectureReducer,
});

export default rootReducer;
