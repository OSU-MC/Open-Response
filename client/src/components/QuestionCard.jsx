import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { Switch } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import apiUtil from '../utils/apiUtil'
import { TailSpin } from  'react-loader-spinner'
import { togglePublishedForQuestionInLecture } from '../redux/actions'
import { io } from "socket.io-client";



const socket = io("http://localhost:3001");

function QuestionCard(props){
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [ published, setPublished ] = useState(!!props.question.published)
    const [ isLive, setIsLive ] = useState(!!props.question.isLive)
    const { courseId, lectureId, sectionId } = useParams()
    const [ error, setError ] = useState(false)
    const [ message, setMessage ] = useState("")
    const [ loading, setLoading ] = useState(false)



    //(un)publish a question
    //called on switch onChange()
    async function changePublishState(){
        //call the api for an update 
        setLoading(true)
        const response = await apiUtil("put", `/courses/${courseId}/sections/${props.sectionId}/lectures/${lectureId}/questions/${props.question.id}`, { dispatch: dispatch, navigate: navigate})
        setLoading(false)
        setError(response.error)
        setMessage(response.message)

        if(response.status === 200) {
            dispatch(togglePublishedForQuestionInLecture(lectureId, props.question.id))
            setPublished(!published)
            socket.emit("setLiveQuestion", { lectureId });
        }

    }

    async function goLive() {

        setLoading(true);    
        const response = await apiUtil("put", `/courses/${courseId}/lectures/${lectureId}/questions/${props.question.id}/live`, { 
            dispatch: dispatch,
            navigate: navigate,
            data: { isLive: !isLive }
        });
    
        setLoading(false);
        setError(response.error);
        setMessage(response.message);
    
        if (response.status === 200 && response.data?.isLive !== undefined) {
            setIsLive(!isLive);
            socket.emit("setLiveQuestion", { lectureId });
        }
    }


    return (
        <>
            {loading ? <TailSpin visible={true}/> : (props.view === "student" &&
                <div className="question-card-student">
                    <Card>
                        <Card.Header>{props.question.stem}</Card.Header>
                        <Card.Body>
                            <p>{props.question.type}</p>
                            <Link to={`questions/${props.question.id}`}>
                                <Button className="editQuestionBtn">View Question</Button>
                            </Link>
                        </Card.Body>
                    </Card>
                </div>
            )}

            {loading ? <TailSpin visible={true}/> : (props.view === "teacher" &&
                <div className="question-card-teacher">
                    <Card>
                        <Card.Header>{props.question.stem}</Card.Header>
                        <Card.Body>
                            <p>{props.question.type}</p>

                            {!sectionId && (
                                <Button onClick={() => navigate(`questions/${props.question.id}`)} className="editQuestionBtn">
                                    Edit Question
                                </Button>
                            )}

                            {sectionId && props.lecturePublished && (
                                <div className="switch">
                                    <label>
                                        <span>Publish Question</span>
                                        <Switch onChange={changePublishState} checked={published}/>
                                    </label>
                                </div>
                            )}

                            {props.isLectureLive && (
                                <Button 
                                    className="btn-live" 
                                    onClick={goLive}
                                    disabled={loading}
                                >
                                    {isLive ? "End Live" : "Go Live"}
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            )}
        </>
    );
}

export default QuestionCard;