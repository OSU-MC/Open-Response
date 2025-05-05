// src/hooks/useLectureForSectionQuestions.js
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

  useEffect(() => {
    // reset any previous state
    setQuestions([]);
    setError(false);
    setMessage('');
    setLoading(true);

    async function getLectureQuestions() {
      const response = await apiUtil(
        'get',
        `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/questions`,
        { dispatch, navigate }
      );
      if (response.status === 200) {
        setQuestions(response.data.questions);
        dispatch(addLectureQuestions(lectureId, response.data.questions));
      } else {
        setError(response.error);
        setMessage(response.message);
      }
      setLoading(false);
    }

    if (lectureId) {
      getLectureQuestions();
    } else {
      setLoading(false);
    }
  }, [courseId, sectionId, lectureId, dispatch, navigate]);

  return [questions, message, error, loading];
}

export default useLectureForSectionQuestions;
