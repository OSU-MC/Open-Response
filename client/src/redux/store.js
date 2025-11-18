import { createStore } from "redux";
import rootReducer from "./reducer";

const store = createStore(rootReducer);

const unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

export default store;
