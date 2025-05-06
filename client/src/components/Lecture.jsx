import React, { useState } from "react";
import QuestionCard from './QuestionCard';
import { Button, Card } from "react-bootstrap"
import { Switch } from '@mui/material';
import { Link } from 'react-router-dom';
import apiUtil from '../utils/apiUtil'
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { togglePublishedLecture } from "../redux/actions";
import Notice from './Notice'

function Lecture(props){
    const [published, setPublished] = useState(props.published)
    const [sectionId, setSectionId] = useState(props.sectionId)
    const [error, setError] = useState(false)
    const [message, setMessage] = useState("")
    const [ loading, setLoading ] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()



    async function changePublishState(){
        if(sectionId != -1){
            setLoading(true)
            const response = await apiUtil("put", `/courses/${props.courseId}/sections/${props.sectionId}/lectures/${props.lecture.id}`, { dispatch: dispatch, navigate: navigate})
            setLoading(false)
            setError(response.error)
            setMessage(response.message)

            //update the published state in lecture
            if(response.status === 200){
                dispatch(togglePublishedLecture(props.courseId, props.lecture.id))
                setPublished(!published)
            }
        }
        else{
            setMessage("This lecture is not attached to a section.")
        }
    }

    return(
        <div className="lecture-page-container">
            {message ? <Notice error={error ? "error" : ""} message={message}/> : <div className="non-error">
            <div className="lecture-header">
                <Link className='back-btn-lectures' to={`/${props.courseId}/lectures`}>
                    <Button className='back-btn'> 
                        <div id="back-btn-image"/>
                    </Button>
                </Link>
                <p className="lecture-subtitle">{props.lecture.title} Lecture Questions</p>
            </div>

            <hr className="lecture-hr"></hr>

            {/*If Student*/}
            {(props.role == "student" &&
                <div className='lecture-container'>
                    <div className='questions'>
                        {props.questions.questions.map((question) => {
                            return <QuestionCard key={question.id} question={question} view={props.role}/>
                        })}
                    </div>
                </div>
            )}            

            {/*If Teacher*/}
            {(props.role == "teacher" &&
                <div className='lecture-container'>
                    <div className="lecture-header-btns">
                        <Link to={`questions`}>
                            <Button className="btn-add" variant="primary">Add Questions</Button>
                        </Link>

                        <label className="lecture-publish-switch">
                            <span>Publish Lecture</span>
                            {/*TODO: published lectures in lecture for sections*/}
                            <Switch onChange={() => changePublishState()} checked={!!published}/>
                        </label>
                    </div>

                    <div className='questions'>
                        {props.questions.questions.map((question) => {
                            return <QuestionCard key={question.id} question={question} view={props.role}/>
                        })}
                    </div>
                </div>
            )}
        </div>}
        </div>
    )
}

export default Lecture