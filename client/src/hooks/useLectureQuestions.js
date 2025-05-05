import apiUtil from '../utils/apiUtil'
import { addLectureQuestions } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { getLectureDetails } from '../redux/selectors'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function useLectureQuestions() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const lectures = useSelector(getLectureDetails)
    const { courseId, lectureId } = useParams()
    const [ error, setError ] = useState(false)
    const [ message, setMessage ] = useState("")
    const [ loading, setLoading ] = useState(true)

    useEffect( () => {
        async function getLecture(){
            setLoading(true)
            const response = await apiUtil("get", `courses/${courseId}/lectures/${lectureId}`, { dispatch: dispatch, navigate: navigate} );
            setMessage(response.message)
            setError(response.error)
            if (response.status === 200) {
                dispatch(addLectureQuestions(lectureId, response.data.questions))
            }
            setLoading(false)
        }
        if (lectureId && lectures[lectureId] == null) {
            getLecture()
        }
        else {
            setLoading(false)
        }
    }, [])

    return [lectures[lectureId] || { staged: {}, questions: [] }, message, error, loading]
}

export default useLectureQuestions