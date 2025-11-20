import { React, useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  stageQuestionInLecture,
  unstageQuestionInLecture,
  addStagedQuestion,
} from "../../redux/actions";

function QuestionListItem(props) {
  const checkRef = useRef("");
  const { lectureId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.selectable) checkRef.current.checked = props.staged;
  }, [props.staged]);

  const handleCheck = () => {
    if (checkRef.current.checked)
      dispatch(stageQuestionInLecture(lectureId, props.question));
    else dispatch(unstageQuestionInLecture(lectureId, props.question));
  };

  return (
    <div className="questionListItem">
      <div className="checkboxContainer">
        {props.selectable && (
          <input
            className="checkbox"
            ref={checkRef}
            type="checkbox"
            onChange={handleCheck}
          />
        )}
      </div>
      <div
        className="basicLink questionListItemInformation"
        onClick={(e) => {
          e.preventDefault();
          props.onClick();
        }}
      >
        <div className="questionStem">{props.question.stem}</div>
        <div className="questionType">{props.question.type}</div>
      </div>
    </div>
  );
}

export default QuestionListItem;
