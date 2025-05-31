// useGrades.js
//
// Custom React hook for fetching and managing grades data for a course section.
//
// Arguments:
//   - courseId (string|number): The ID of the course.
//   - sectionId (string|number): The ID of the section.
//
// Returns:
//   [grades, message, error, loading]
//     - grades: An object containing lecture grades and course grades, e.g.
//         {
//           lectures: [...], // array of lecture grade objects
//           courseGrades: {...} // course grade(s) object or array
//         }
//     - message: Status or error message from the API.
//     - error: Boolean indicating if there was an error.
//     - loading: Boolean indicating if the data is being loaded.
//
// Behavior:
//   - Fetches grades for the given course and section from the API on mount or when courseId/sectionId changes.
//   - Fetches course-level grades and attaches them to the result.
//   - Handles loading and error states.
//   - Uses Redux dispatch and React Router navigation for side effects and error handling.
//
// Example usage:
//   const [grades, message, error, loading] = useGrades(courseId, sectionId);

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
