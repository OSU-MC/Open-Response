import apiUtil from '../utils/apiUtil'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LocalConvenienceStoreOutlined } from '@mui/icons-material';

function useResponse(course, role) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [ error, setError ] = useState(false)
    const [ message, setMessage ] = useState("")
    const [ loading, setLoading ] = useState(false)
    const [ responseToReturn, setResponseToReturn ] = useState({})
    const [ question, setQuestion ] = useState({})
    const { courseId, lectureId, questionId } = useParams()

    useEffect(() => {
        async function getResponses() {
            setLoading(true)
            const response = await apiUtil("get", `courses/${courseId}/sections/${course.Sections[0].id}/lectures/${lectureId}/responses`, { dispatch: dispatch, navigate: navigate})
            setMessage(response.message)
            setError(response.error)
            if (response.status === 200) {
                const responseForQuestion = response.data.filter(obj => obj.question.id == questionId)
                setResponseToReturn(responseForQuestion[0].response)
                setQuestion(responseForQuestion[0].question)
            }
            setLoading(false)
        }
        if (course && role === 'student') {
            getResponses()
        }
    }, [ course ])

    return [ question, responseToReturn, message, error, loading ]
}

export default useResponse