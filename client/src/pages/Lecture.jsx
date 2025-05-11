import { React, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { TailSpin } from  'react-loader-spinner'
import Notice from '../components/Notice'
import { Button, Card } from "react-bootstrap"
import useLectureQuestions from "../hooks/useLectureQuestions";
import useCourse from "../hooks/useCourse";
import useLectures from '../hooks/useLectures';
import QuestionCard from '../components/QuestionCard';

// URL: :courseId/lecutres/:lectureId 

function Lecture() {
    const [ questions, message, error, loading ] = useLectureQuestions()
    const [ course, role, Cmessage, Cerror, Cloading ] = useCourse()
    const [ lectures, Lmessage, Lerror, Lloading ] = useLectures()
    const { courseId, lectureId } = useParams() 
    const [ lecture, setLecture ] = useState({})

    useEffect(() => {
        if (lectures[courseId] != null) {
            let foundLecture = null
            lectures[courseId].forEach((lecture) => {
                if (lecture.id == lectureId) {
                    foundLecture = lecture
                }
            })
            if (foundLecture != null) {
                setLecture(foundLecture)
            }
        }
    }, [ lectures ])

    return (
        <div className="lecture-page-container">
            { (loading|Cloading|Lloading) ? <TailSpin visible={true}/> : message ? <Notice error={error ? "error" : ""} message={message}/> : <div className="non-error">
            <div className="lecture-header">
                <Link className='back-btn-lectures' to={`/${courseId}/lectures`}>
                    <Button className='back-btn'> 
                        <div id="back-btn-image"/>
                    </Button>
                </Link>
                <p className="lecture-subtitle">{lecture.title} Lecture Questions</p>
            </div>

            { Cmessage ? <Notice error={Cerror ? "error" : ""} message={Cmessage}/> : <></>}
            { Lmessage ? <Notice error={Lerror ? "error" : ""} message={Lmessage}/> : <></>}

            <hr className="lecture-hr"></hr>

            {/*If Student*/}
            {(role == "student" &&
                <div className='lecture-container'>
                    <div className='questions'>
                        {loading ? <TailSpin visible={true}/> : questions.questions.map((question) => {
                            return <QuestionCard key={question.id} question={question} view={role}/>
                        })}
                    </div>
                </div>
            )}            
            
            {(role == "teacher") &&
                <div className='lecture-container'>
                    <div className="lecture-header-btns">
                        <Link to={`questions/add`}>
                            <Button className="btn-add" variant="secondary">Add Questions</Button>
                        </Link>
                    </div>

                    <div className='questions'>
                        {loading ? <TailSpin visible={true}/> : questions.questions.map((question) => {
                            return <QuestionCard key={question.id} question={question} view={role}/>
                        })}
                    </div>
                </div>}
            </div>}
        </div>
    )
}

export default Lecture