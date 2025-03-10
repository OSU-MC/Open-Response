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
            const response = await apiUtil("get", `courses/${courseId}/sections/${sectionId}/grades/all`, { dispatch, navigate });
            setLoading(false);
            setMessage(response.message);
            setError(response.error);
            if (response.status === 200) {
                setGrades(response.data);
            } else {
                console.error('Unexpected API Response:', response.data); // Log unexpected response
                setMessage(response.data.error || 'Unexpected response from server');
                setError(true);
            }
        }

        fetchGrades();
    }, [courseId, sectionId, dispatch, navigate]);

    return [grades, message, error, loading];
}

export default useGrades;
