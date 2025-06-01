import { React, useState, useEffect } from 'react';
import { TailSpin } from  'react-loader-spinner'
import Notice from '../Notice'
import apiUtil from '../../utils/apiUtil'
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { addQuestion, stageQuestionInLecture } from '../../redux/actions';

function SingleQuestionTeacher(props) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { courseId, lectureId } = useParams()

    const editable = false // TODO: update to props.editable || false once update API endpoint has been implemented
    const [ message, setMessage ] = useState("")
    const [ error, setError ] = useState(false)
    const [ loading, setLoading ] = useState(false)
    const [ question, setQuestion ] = useState(props.question)
    const [ editing, setEditing ] = useState(props.editing || false)
    const [ stem, setStem ] = useState("")
    const [ type, setType ] = useState("multiple choice")
    const [ options, setOptions ] = useState({
        0: "",
        1: "",
        2: "",
        3: ""
    })
    const [ answers, setAnswers ] = useState(question?.answers || {
        0: false,
        1: false,
        2: false,
        3: false
    })
    const [ points, setPoints ] = useState(question?.points || 1)
    const [ weights, setWeights ] = useState(question?.weights || {
        0: 1,
        1: 1,
        2: 1,
        3: 1
    })

    useEffect(() => {
        setStem(question?.stem || "")
        setType(question?.type || "multiple choice")
        setOptions(question?.content?.options || {
            0: "",
            1: "",
            2: "",
            3: ""
        })
        setAnswers(question?.answers || {
            0: false,
            1: false,
            2: false,
            3: false
        })
        setPoints(question?.points || 1)
        setWeights(question?.weights || {
            0: 1,
            1: 1,
            2: 1,
            3: 1
        })
    }, [ question ])
    
    const setWeightsHandler = (value, index) => {
        setWeights({
            ...weights,
            [index]: value
        })
    }

    const addAnswer = (e) => {
        e.preventDefault()
        setOptions({
            ...options,
            [Object.keys(options).length]: ""
        })
        setAnswers({
            ...answers,
            [Object.keys(answers).length]: false
        })
        setWeights({
            ...weights,
            [Object.keys(weights).length]: 1
        })
    }

    const updateQuestion = async (e) => {
        e.preventDefault()
        setLoading(true)
        const questionBody = {
            stem: stem,
            type: type,
            answers: answers,
            lectureId: lectureId,
            totalPoints: points,
            weights: weights,
            content: {
                options: options
            }
        }
        if (question != null) {
            // TODO: add update functionality once backend has implmented a put route for questions
            setQuestion(questionBody)
            setEditing(false)
        }
        else {
            const response = await apiUtil("post", `courses/${courseId}/questions`, { dispatch: dispatch, navigate: navigate}, questionBody)
            setError(response.error)
            setMessage(response.message)
            setLoading(false)
            if (response.status === 201) {
                // add the question to the course's questions
                // if coming from lectures, add the question to staged
                dispatch(addQuestion(courseId, response.data.question))
                if (lectureId) {
                    dispatch(stageQuestionInLecture(lectureId, response.data.question))
                }
            }
        }
    }

    const updateOptions = (value, index) => {
        setOptions({
            ...options,
            [index]: value
        })
    }

    const updateAnswers = (index) => {
        let newAnswers = {...answers}
        switch(type) {
            case "multiple choice":
                Object.keys(answers).forEach((key) => {
                    newAnswers[key] = false
                })
                newAnswers = {...newAnswers, [index]: true}
                break
            case "multiple answer":
                newAnswers = {...newAnswers, [index]: !answers[index]}
                break
            default:
                throw Error("type is not understood!")
        }
        setAnswers(newAnswers)
    }

    const changeType = (newType) => {
        let newAnswers = {...answers}
        switch(newType) {
            case "multiple choice":
                let answerFound = false
                Object.keys(answers).forEach((key) => {
                    let value = answers[key]
                    if (value == true && !answerFound) {
                        answerFound = true
                        newAnswers[key] = true
                    }
                    else {
                        newAnswers[key] = false
                    }
                })
                setAnswers(newAnswers)
                break
            case "multiple answer":
                break
            default:
                throw Error("type is not understood")
        }
        setType(newType)
    }

    const removeAnswer = (e, index) => {
        e.preventDefault()
        let newAnswers = {}
        Object.keys(answers).forEach((key) => {
            let answer = answers[key]
            if (key < index) {
                newAnswers[key] = answer
            }
            else if (key > index) {
                newAnswers[key - 1] = answer
            }
        })
        let newOptions = {}
        Object.keys(options).forEach((key) => {
            let text = options[key]
            if (key < index) {
                newOptions[key] = text
            }
            else if (key > index) {
                newOptions[key - 1] = text
            }
        })
        let newWeights = {}
        Object.keys(weights).forEach((key) => {
            let w = weights[key]
            if (key < index) {
                newWeights[key] = w
            } else if (key > index) {
                newWeights[key - 1] = w
            }
        })
        setAnswers(newAnswers)
        setOptions(newOptions)
        setWeights(newWeights)
    }

    const moveAnswer = (e, index, value) => {
        e.preventDefault()
        let newAnswers = {...answers}
        let newOptions = {...options}
        let newWeights = {...weights}
        let movedAnswer = newAnswers[parseInt(index)]
        newAnswers[parseInt(index)] = newAnswers[parseInt(index) + value]
        newAnswers[parseInt(index) + value] = movedAnswer
        let movedOptions = newOptions[parseInt(index)]
        newOptions[parseInt(index)] = newOptions[parseInt(index) + value]
        newOptions[parseInt(index) + value] = movedOptions
        let movedWeight = newWeights[parseInt(index)]
        newWeights[parseInt(index)] = newWeights[parseInt(index) + value]
        newWeights[parseInt(index) + value] = movedWeight
        setAnswers(newAnswers)
        setOptions(newOptions)
        setWeights(newWeights)
    }

    // TODO: Create setPoints function. to set the total points for the question
    // TODO: Create setweights function. to set the weight of an answer

    if (editing) {
        return (<div className="vertical-container">
            { message != "" && error && <Notice status={"error"} message={message} /> }
            <form className="question">
                <div className="question-subcontainer">
                    <label>Question Stem:</label>
                    <input className="question-text" type="text" placeholder="What is 1 + 1?" name="stem" id="stem" value={stem} onChange={(e) => setStem(e.target.value)}></input>
                    <label>Points: </label> 
                    <input className="question-points" type="number" placeholder="1" name="points" id="points" value={points} onChange={(e) => setPoints(Number(e.target.value))}></input>
                </div>
                <div className="question-subcontainer">
                    <label>Question Type:</label>
                    <select className="question-dropdown" id="question-type" name="question-type" value={type} onChange={(e) => changeType(e.target.value)}>
                        <option value="multiple choice">Multiple Choice</option>
                        <option value="multiple answer">Multiple Answer</option>
                    </select>
                </div>
                <div className="question-subcontainer">
                    {
                        Object.keys(options).map( (index) => {
                            let option = options[index]
                            return <div className="question-option" key={index}>
                                <input className="question-select" type={type == 'multiple choice' ? 'radio' : 'checkbox'} name="answers" checked={answers[index]} onChange={(e) => updateAnswers(index)}></input>
                                <input className="question-weight" type="number" placeholder='1' name="weights" id="weights" value={weights[index] || 1} onChange={(e) => setWeightsHandler(Number(e.target.value), index)}></input>
                                <input className="question-text" type="text" value={option} onChange={(e) => updateOptions(e.target.value, index)}></input>
                                <div className="question-reorder">
                                    <button className="btn btn-secondary question-arrow" disabled={index == 0} type="button" onClick={(e) => { moveAnswer(e, index, -1) }}>{'\u2191'}</button>
                                    <button className="btn btn-secondary question-arrow" disabled={index == Object.keys(options).length - 1} type="button" onClick={(e) => { moveAnswer(e, index, 1) }}>{'\u2193'}</button>
                                </div>
                                { Object.keys(options).length > 2 && <button type="button" className="btn negative-btn" onClick={(e) => { removeAnswer(e, index) }}>x</button> }
                            </div>
                        })
                    }
                    { Object.keys(options).length < 10 && <button className="btn btn-secondary btn-add" type="button" onClick={(e) => { addAnswer(e) }}>+</button> }
                </div>
                { loading ? <TailSpin visible={true}/> : <button className="btn btn-secondary btn-add" type="submit" onClick={(e) => { updateQuestion(e) }}>{ question ? 'Save Question' : 'Create Question'}</button> }
            </form>
        </div>)
    }
    else {
        return <div className="vertical-container">
            <h1 className='question-stem'>
                { question.stem }
             </h1>
            <form className='student-question-response-form'>
                { Object.keys(options).map( (index) => {
                    let option = options[index]
                    return <div key={index} className='student-question-answer-option'>
                        {(question.type == 'multiple choice') ? 
                            <>
                                <input className='student-question-radio' type="radio" id={index} value={option} checked={answers[index] == true} readOnly={true}></input>
                                <label className='student-question-option-label' htmlFor={index}>{option}</label>
                            </> :
                            (question.type == 'multiple answer') ?
                                <>
                                    <input className='student-question-radio' type="checkbox" id={index} key={index} value={option} checked={answers[index] == true} readOnly={true}></input>
                                    <label className='student-question-option-label' htmlFor={index}>{option}</label>
                                </> :
                                <Notice error={false} key={index} message={"Only multiple choice and multiple answer are supported"}/>
                        }
                    </div>
                })}
            </form>
            { editable ? <button className="btn btn-secondary" onClick={(e) => {e.preventDefault(); setEditing(true)}}>Edit</button> : <></> }
        </div>
    }
}

export default SingleQuestionTeacher