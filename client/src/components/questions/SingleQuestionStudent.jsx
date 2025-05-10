import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom';
import { TailSpin } from  'react-loader-spinner'
import Notice from '../Notice'
import { Button, Card } from "react-bootstrap"
import apiUtil from '../../utils/apiUtil'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'

function SingleQuestionStudent(props) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const content = (props.question.content) ? Object.values(props.question.content.options) : []
    const answers = (props.question.answers) ? Object.values(props.question.answers) : []
    const [ radioOptionSelected, setRadioOptionSelected ] = useState([false, false, false, false])
    const [ radioChecked, setRadioChecked ] = useState()
    const [ checkboxOptionsSelected, setCheckboxOptionsSelected ] = useState([false, false, false, false])
    const [ submissionError, setSubmissionError ] = useState()

    const createResponse = async (e) => {
        e.preventDefault()
        if (props.question.type === 'multiple choice' && radioChecked == null) {
            alert("Please select an answer to the question before submitting")
        }
        else {
            let response = await apiUtil("post", `courses/${props.courseId}/lectures/${props.lectureId}/questions/${props.question.id}/responses`, { dispatch: dispatch, navigate: navigate}, { answers: (props.question.type === 'multiple choice') ? radioOptionSelected : checkboxOptionsSelected })
            if (response.status != 201) {
                setSubmissionError(response.message)
            }
            window.location.reload(false);
        }
    }

    const onValueChangeRadio = (e) => {
        const nextRadioOptionSelected = radioOptionSelected.map((option, index) => e.target.value == content[index])
        setRadioOptionSelected(nextRadioOptionSelected)
        setRadioChecked(e.target.value)
    }

    const onValueChangeCheckbox = (e) => {
        const nextCheckboxOptionsSelected = checkboxOptionsSelected.map((option, index) => (e.target.value == content[index]) ? e.target.checked : option)
        setCheckboxOptionsSelected(nextCheckboxOptionsSelected)
    }

    return (
        <div className='student-question-wrapper'>
            {
                (!props.response) ? 
                <>
                    <h1 className='question-stem'>
                        { props.question.stem }
                    </h1>
                    <form className='student-question-response-form'>
                        {content.map( (option, index) =>
                            <div key={index} className='student-question-answer-option'>
                                {(props.question.type == 'multiple choice') ? 
                                    <>
                                        <input className='student-question-radio' type="radio" id={index} value={option} checked={radioChecked == option.toString()} onChange={onValueChangeRadio}></input>
                                        <label className='student-question-option-label' htmlFor={index}>{option}</label>
                                    </> :
                                    (props.question.type == 'multiple answer') ?
                                        <>
                                            <input className='student-question-radio' type="checkbox" id={index} key={index} value={option} onChange={onValueChangeCheckbox}></input>
                                            <label className='student-question-option-label' htmlFor={index}>{option}</label>
                                        </> :
                                        <Notice error={false} key={index} message={"Only multiple choice and multiple answer are supported"}/>
                                }
                            </div>
                        )}
                    </form>
                    <Link to={`/${props.courseId}/lectures/${props.lectureId}/questions/${props.questionId}`}>
                        <button className="btn btn-primary student-question-response-submit-button" onClick={((e) => createResponse(e))}>Submit</button>
                    </Link>
                </> : 
                <>
                    <h1 className="question-stem">
                        { props.question.stem }
                    </h1>
                    <ul className='student-question-response-form'>
                        {content.map( (option, index) =>
                            (answers[index] === true && props.response.submission[index] === true) ? <li className='right-answer student-question-li' key={index}>{option} Correct!</li> : (answers[index] === true) ? <li className='unselected-right-answer student-question-li' key={index}>{option} Unselected Correct Answer</li> : (props.response.submission[index] === true) ? <li className='wrong-answer student-question-li' key={index}>{option} Incorrect</li> : <li className='student-question-li' key={index}>{option}</li>
                        )}
                    </ul>
                    <h2 className='student-question-score'>
                        Score: { props.response.score }
                    </h2>
                </>
            }
        </div>
    )
}

export default SingleQuestionStudent