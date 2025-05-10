import apiUtil from '../utils/apiUtil'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import QuestionListItem from '../components/questions/QuestionListItem'
import useQuestions from '../hooks/useQuestions'
import useLectureQuestions from '../hooks/useLectureQuestions'
import Notice from '../components/Notice'
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { TailSpin } from  'react-loader-spinner'
import { useDispatch } from 'react-redux'
import { addStagedQuestion } from '../redux/actions'
import Popup from '../components/Popup'
import SingleQuestionTeacher from '../components/questions/SingleQuestionTeacher'

//URL : :courseId/lectures/:lectureId/questions

function Questions(props) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [ searchParams, setSearchParams ] = useSearchParams()
    const [ questionView, setQuestionView ] = useState(null)
    const [ inputQuery, setInputQuery ] = useState(searchParams.get("search") || "")
    const [ page, setPage ] = useState(parseInt(searchParams.get("page")) || 0)
    const [ questions, nextLink, prevLink, message, error, loading ] = useQuestions()
    const { courseId, lectureId } = useParams()
    const [ submissionLoading, setSubmissionLoading ] = useState(0)
    const [ submissionErrors, setSubmissionErrors ] = useState([])
    const [ submissionPosted, setSubmissionPosted ] = useState(false)
    const [ lecture, lMessage, lError, lLoading ] = useLectureQuestions()

    const nextPage = (() => {
        let next = page + 1
        setPage(next)
        setSearchParams({ search: inputQuery, page: next })
    })

    const prevPage = (() => {
        let prev = page - 1
        setPage(prev)
        setSearchParams({ search: inputQuery, page: prev })
    })

    const addQuestionsToLecture = (e) => {
        e.preventDefault()
        setSubmissionLoading(Object.values(lecture.staged).length)
        let order = lecture.questions[lecture.questions.length - 1]?.order || 0
        Object.values(lecture.staged).forEach(async (question) => {
            order += 1
            question.order = order
            let response = await apiUtil("post", `courses/${courseId}/lectures/${lectureId}/questions/${question.id}`, { dispatch: dispatch, navigate: navigate}, { order: order })
            if (response.status != 201) {
                setSubmissionErrors([...submissionErrors, response.message])
            }
            else {
                dispatch(addStagedQuestion(lectureId, question.id))
            }
            setSubmissionLoading(submissionLoading - 1)
        })
        setSubmissionPosted(true)
    }

    const openQuestion = (question) => {
        setQuestionView(question)
    }

    const closeQuestion = () => {
        setQuestionView(null)
    }

        return(
            <>
                { questionView != null && <Popup close={closeQuestion}><SingleQuestionTeacher question={questionView} editable={true}/></Popup> }
                <div className="contentView">
                    <div className="header">
                        <button className="btn btn-secondary"><NavLink className='basicLink' to={lectureId ? `/${courseId}/lectures/${lectureId}` : `/${courseId}`}>&lt;&lt; Back to {lectureId ? 'Lecture' : 'Course'}</NavLink></button>
                        { (submissionPosted || submissionErrors.length > 0) && <Notice message={submissionErrors.length > 0 ? submissionErrors[0] : "Questions added to lecture"} status={submissionErrors.length > 0 ? "error" : "success"}/>}
                        { lectureId && (submissionLoading > 0 ? <TailSpin visible={true} /> : <button className="btn btn-primary" onClick={((e) => addQuestionsToLecture(e))}>Submit</button>)}
                    </div>
                    <div className="searchBarContainer">
                        <form className="searchForm" onSubmit={ e => {
                            e.preventDefault()
                            setSearchParams({ search: inputQuery })
                        }}>
                            <input className="searchBar" value={inputQuery} placeholder= "Question Stem" onChange={e => setInputQuery(e.target.value)} />
                            <div className="split-space">
                                <button className="dynamic-btn btn btn-primary" type="submit">Search</button>
                                <div>&nbsp;</div>
                                <button className="dynamic-btn btn btn-add" onClick={((event) => event.preventDefault())}><NavLink className='basicLink' to='add'>Create Question</NavLink></button>
                            </div>
                            
                        </form>
                        { message != "" && <Notice message={message} error={error ? "error" : ""} />}
                    </div>
                    <div className="questionsContainer">
                        { loading ? <TailSpin visible={true} /> : !error ? (questions[courseId].length > 0) ? <div className="questionsList">
                            { questions[courseId].map((question) => {
                                return <QuestionListItem key={question.id} question={question} selectable={lectureId} staged={lecture.staged[question.id] != null ? true : false} onClick={(e) => { openQuestion(question) }}/>
                            }) }
                        </div> : <Notice message={"No questions found"} /> : <></>}
                    </div>
                    <div className="footer">
                        <div>
                            { prevLink && <button className="btn btn-primary" onClick={(() => prevPage())}>Prev</button> }
                        </div>
                        <div>
                            { nextLink && <button className="btn btn-primary" onClick={(() => nextPage())}>Next</button> }
                        </div>    
                    </div>
                </div>
            </>
        )
}

export default Questions;