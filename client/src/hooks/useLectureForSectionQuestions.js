// src/hooks/useLectureForSectionQuestions.js
//
// Custom React hook for fetching and managing questions for a specific lecture in a course section.
//
// Returns:
//   [questions, message, error, loading, reloadQuestions]
//     - questions: Array of question objects for the lecture.
//     - message: Status or error message from the API.
//     - error: Boolean indicating if there was an error.
//     - loading: Boolean indicating if the data is being loaded.
//     - reloadQuestions: Function to manually reload the questions from the API.
//
// Behavior:
//   - Fetches questions for the given course, section, and lecture from the API on mount or when IDs change.
//   - Handles loading and error states.
//   - Dispatches questions to Redux store for global state management.
//   - Uses React Router for navigation and parameter extraction.
//
// Example usage:
//   const [questions, message, error, loading, reloadQuestions] = useLectureForSectionQuestions();

import apiUtil from '../utils/apiUtil';
import { addLectureQuestions } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { getLectureDetails } from '../redux/selectors';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function useLectureForSectionQuestions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lectures = useSelector(getLectureDetails);
  const { courseId, sectionId, lectureId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const reloadQuestions = async () => {
    setQuestions([]);
    setError(false);
    setMessage('');
    setLoading(true);

    const response = await apiUtil(
      'get',
      `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/questions`,
      { dispatch, navigate }
    );

    if (response.status === 200) {
      setQuestions(response.data.questions);
      console.log("questions: ", response);
      dispatch(addLectureQuestions(lectureId, response.data.questions));
    } else {
      setError(response.error);
      setMessage(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (lectureId) {
      reloadQuestions();
    } else {
      setLoading(false);
    }
  }, [courseId, sectionId, lectureId, dispatch, navigate]);

  return [questions, message, error, loading, reloadQuestions];
}

export default useLectureForSectionQuestions;
