import apiUtil from '../utils/apiUtil'
import { addLectureQuestions } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { getLectureDetails } from '../redux/selectors'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function useLectureQuestions() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const lectures = useSelector(getLectureDetails)
    const { courseId, lectureId } = useParams()
    const [ error, setError ] = useState(false)
    const [ message, setMessage ] = useState("")
    const [ loading, setLoading ] = useState(true)
    
    const getLecture = useCallback(async () => {
        setLoading(true)
        console.log(`Fetching lecture ${lectureId} from ${courseId}...`);

        try {
            const response = await apiUtil("get", `courses/${courseId}/lectures/${lectureId}`, { dispatch, navigate });

            console.log("API Response:", response);

            setMessage(response.message)
            setError(response.error)

            if (response.status === 200) {
                console.log("Questions received:", response.data.questions);
                dispatch(addLectureQuestions(lectureId, response.data.questions))
            } else {
                console.log("Failed to fetch lecture questions");
            }
        } catch (err) {
            console.error("API call failed:", err);
        }
        setLoading(false);
    }, [courseId, lectureId, dispatch, navigate]); 

    useEffect(() => {
        if (lectureId && lectures[lectureId] == null) {
            getLecture();
        } else {
            setLoading(false);
        }
    }, [courseId, lectureId, lectures, getLecture]); 

    return [lectures[lectureId] || { staged: {}, questions: [] }, message, error, loading, getLecture];
}
export default useLectureQuestions;