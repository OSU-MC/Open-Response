import React, { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { Switch } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import apiUtil from '../utils/apiUtil'
import { TailSpin } from  'react-loader-spinner'
import { togglePublishedForQuestionInLecture } from '../redux/actions'
import { io } from "socket.io-client";


const url = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3002'

const socket = io(url);

function QuestionCard(props){
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [ published, setPublished ] = useState(!!props.question.published)
    const [ isLive, setIsLive ] = useState(!!props.question.isLive)
    const { courseId, lectureId, sectionId } = useParams()
    const [ error, setError ] = useState(false)
    const [ message, setMessage ] = useState("")
    const [ loading, setLoading ] = useState(false)


    useEffect(() => {
        setPublished(!!props.question.published);
        setIsLive(!!props.question.isLive);
    }, [props.question]);



    //(un)publish a question
    //called on switch onChange()
    async function changePublishState(){
        
        setLoading(true)
        const publishedStatus = published ? '0' : '1'
        const response = await apiUtil("put", `/courses/${courseId}/lectures/${lectureId}/questions/${props.question.id}/sections/${props.sectionId}/${publishedStatus}`, { dispatch: dispatch, navigate: navigate})
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
        const liveStatus = isLive ? '0' : '1';
        const response = await apiUtil("put", `/courses/${courseId}/lectures/${lectureId}/questions/${props.question.id}/live/${liveStatus}`, { 
            dispatch: dispatch,
            navigate: navigate
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
                                        <Switch
                                            onChange={changePublishState}
                                            checked={published}
                                        />
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