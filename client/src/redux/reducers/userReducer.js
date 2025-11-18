import { LOGIN, LOGOUT, SET_USER } from "../actions";

const emptyState = {
  user: {},
  status: "", // contains a message for the user (if there is one necessary) to notify the user of some action needed on their account
};

function userReducer(state = emptyState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        status: action.status,
        user: action.user,
      };
    case SET_USER:
      return {
        ...state,
        user: action.user,
      };
    case LOGOUT:
      return emptyState;
    default:
      return state;
  }
}

export default userReducer;
