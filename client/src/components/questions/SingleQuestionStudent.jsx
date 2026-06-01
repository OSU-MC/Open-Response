import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import Notice from "../Notice";
import { Button, Card } from "react-bootstrap";
import apiUtil from "../../utils/apiUtil";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// Store the answers payload stored in the server.
function SingleQuestionStudent(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const content = props.question.content
    ? Object.values(props.question.content.options)
    : [];
  const answers = props.question.answers
    ? Object.values(props.question.answers)
    : [];

  // Use the content array to determine the length the array needs to be.
  const [radioOptionSelected, setRadioOptionSelected] = useState(
    Array(content.length).fill(false)
  );
  const [checkboxOptionsSelected, setCheckboxOptionsSelected] = useState(
    Array(content.length).fill(false)
  );

  const [radioChecked, setRadioChecked] = useState();
  const [submissionError, setSubmissionError] = useState();
  const [submitted, setSubmitted] = useState(!!props.savedResponse);
  const [submissionResponse, setSubmissionResponse] = useState(
    props.savedResponse || null
  ); // students response

  // Reset state when the question changes (teacher posts a new question)
  useEffect(() => {
    setRadioOptionSelected(Array(content.length).fill(false));
    setCheckboxOptionsSelected(Array(content.length).fill(false));
    setRadioChecked(undefined);
    setSubmissionError(undefined);
    setSubmitted(!!props.savedResponse);
    setSubmissionResponse(props.savedResponse || null);
  }, [props.question.id]);

  // Handle the submission of a question
  const createResponse = async (e) => {
    e.preventDefault();

    if (props.question.type === "multiple choice" && radioChecked == null) {
      alert("Please select an answer to the question before submitting");
      return;
    }

    const selectedAnswers =
      props.question.type === "multiple choice"
        ? radioOptionSelected
        : checkboxOptionsSelected;

    const response = await apiUtil(
      "post",
      `courses/${props.courseId}/lectures/${props.lectureId}/questions/${props.question.id}/responses`,
      { dispatch, navigate },
      { answers: selectedAnswers }
    );

    if (response.status !== 201) {
      setSubmissionError(response.message);
      return;
    }

    setSubmitted(true);
    setSubmissionResponse(response.data.response); // store the full response
    console.log("submission response data:", response.data);

    // Determine if the student's answer was correct
    // A response is fully correct if every selected answer matches the correct answers
    const isCorrect = answers.every(
      (correct, index) => correct === selectedAnswers[index]
    );

    // Notify parent (LiveLecture) so it can update stats via socket
    props.onAnswerSubmitted &&
      props.onAnswerSubmitted(
        props.question,
        isCorrect,
        response.data.response
      );
  };

  const onValueChangeRadio = (e) => {
    const nextRadioOptionSelected = radioOptionSelected.map(
      (option, index) => e.target.value == content[index]
    );
    setRadioOptionSelected(nextRadioOptionSelected);
    setRadioChecked(e.target.value);
  };

  const onValueChangeCheckbox = (e) => {
    const nextCheckboxOptionsSelected = checkboxOptionsSelected.map(
      (option, index) =>
        e.target.value == content[index] ? e.target.checked : option
    );
    setCheckboxOptionsSelected(nextCheckboxOptionsSelected);
  };

  console.log(
    "isClosed:",
    props.isClosed,
    "submitted:",
    submitted,
    "question:",
    props.question.id
  );

  return (
    <div className="student-question-wrapper">
      {!props.response && !submitted ? (
        <>
          <h1 className="question-stem">{props.question.stem}</h1>
          {submissionError && <Notice error={true} message={submissionError} />}
          <form className="student-question-response-form">
            {content.map((option, index) => (
              <div key={index} className="student-question-answer-option">
                {props.question.type == "multiple choice" ? (
                  <>
                    <input
                      className="student-question-radio"
                      type="radio"
                      id={index}
                      value={option}
                      checked={radioChecked == option.toString()}
                      onChange={onValueChangeRadio}
                    />
                    <label
                      className="student-question-option-label"
                      htmlFor={index}
                    >
                      {option}
                    </label>
                  </>
                ) : props.question.type == "multiple answer" ? (
                  <>
                    <input
                      className="student-question-radio"
                      type="checkbox"
                      id={index}
                      // key={index}
                      value={option}
                      onChange={onValueChangeCheckbox}
                    />
                    <label
                      className="student-question-option-label"
                      htmlFor={index}
                    >
                      {option}
                    </label>
                  </>
                ) : (
                  <Notice
                    error={false}
                    key={index}
                    message={
                      "Only multiple choice and multiple answer are supported"
                    }
                  />
                )}
              </div>
            ))}
          </form>

          <button
            className="btn btn-primary student-question-response-submit-button"
            onClick={(e) => createResponse(e)}
          >
            Submit
          </button>
        </>
      ) : (
        <>
          <h1 className="question-stem">{props.question.stem}</h1>

          {submitted && !props.isClosed ? (
            // Show a simple confirmation if we don't have the full response object yet
            <Notice error={false} message="Your answer has been submitted!" />
          ) : submitted && props.isClosed && submissionResponse ? (
            // Show full results if response object is available
            <ul className="student-question-response-form">
              {content.map((option, index) =>
                answers[index] === true &&
                submissionResponse.submission[index] === true ? (
                  <li className="right-answer student-question-li" key={index}>
                    {option} Correct!
                  </li>
                ) : answers[index] === true ? (
                  <li
                    className="unselected-right-answer student-question-li"
                    key={index}
                  >
                    {option} Unselected Correct Answer
                  </li>
                ) : submissionResponse.submission[index] === true ? (
                  <li className="wrong-answer student-question-li" key={index}>
                    {option} Incorrect
                  </li>
                ) : (
                  <li className="student-question-li" key={index}>
                    {option}
                  </li>
                )
              )}
              {submissionResponse && (
                <h2 className="student-question-score">
                  Score: {submissionResponse.score}
                </h2>
              )}
            </ul>
          ) : submitted && props.isClosed && !submissionResponse ? (
            <Notice error={false} message="Question closed." />
          ) : null}
        </>
      )}
    </div>
  );
}

export default SingleQuestionStudent;
