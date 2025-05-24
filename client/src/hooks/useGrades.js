import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import apiUtil from '../utils/apiUtil';

function useGrades(courseId, sectionId) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [grades, setGrades] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchGrades() {
            setLoading(true);
            const response = await apiUtil("get", `courses/${courseId}/sections/${sectionId}/grades`, { dispatch, navigate });
            setLoading(false);
            setMessage(response.message);
            setError(response.error);
            let gradesData = [];
            let courseGrades = null;
            if (response.status === 200) {
                gradesData = response.data;
                // Fetch course grade(s) and append
                const courseGradeResp = await apiUtil("get", `courses/${courseId}/sections/${sectionId}/grades/courseGrade`, { dispatch, navigate });
                if (courseGradeResp.status === 200) {
                    courseGrades = courseGradeResp.data;
                }
            } else {
                console.error('Unexpected API Response:', response.data); 
                setMessage(response.data.error || 'Unexpected response from server');
                setError(true);
            }
            // Attach courseGrades to grades object (array or object)
            if (Array.isArray(gradesData)) {
                setGrades({ lectures: gradesData, courseGrades });
            } else {
                setGrades({ ...gradesData, courseGrades });
            }
        }

        fetchGrades();
    }, [courseId, sectionId, dispatch, navigate]);

    return [grades, message, error, loading];
}

export default useGrades;
