import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { TailSpin } from  'react-loader-spinner'
import Notice from '../components/Notice'
import useLectureForSectionQuestions from "../hooks/useLectureForSectionQuestions";
import useLecturesInSection from '../hooks/useLecturesInSection';
import { Switch } from '@mui/material';
import QuestionCard from '../components/QuestionCard';
import { useEffect, useState } from 'react'
import apiUtil from '../utils/apiUtil'
import { publishLectureInSection } from '../redux/actions';
import { useDispatch } from 'react-redux'
import { Button, Card } from "react-bootstrap"
import io from 'socket.io-client';


//URL : :courseId/sections/:sectionId/lectures/:lectureId

const url = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3002'

const socket = io(url);

function LectureInSection() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [questions, message, error, loading, reloadQuestions] = useLectureForSectionQuestions();
    const [ lecturesInSection, LSmessage, LSerror, LSloading ] = useLecturesInSection()
    const { courseId, lectureId, sectionId } = useParams()
    const [ published, setPublished ] = useState(false)
    const [isLive, setIsLive] = useState(false);
    const [ lecture, setLecture ] = useState({})
    const [ loadingPublish, setLoadingPublish ] = useState(false)
    const [ errorPublish, setErrorPublish ] = useState(false)
    const [ messagePublish, setMessagePublish ] = useState("")

    useEffect(() => {
        if (lecturesInSection != null) {
            lecturesInSection.forEach((lecture) => {
                if (lecture.id == lectureId) {
                    setPublished(lecture.published)
                    setIsLive(lecture.isLive || false);
                    setLecture(lecture)
                }
            })
        }
    }, [ lecturesInSection ])

    // TODO: attach lecture publication to the slider
    const changePublishState = async () => {
        setLoadingPublish(true)
        const response = await apiUtil("put", `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`, { dispatch: dispatch, navigate: navigate})
        setErrorPublish(response.error)
        setMessagePublish(response.message)
        setLoadingPublish(false)

        if (response.status === 200) {
            dispatch(publishLectureInSection(sectionId, lectureId))
            setPublished(!published)
        }

        //remove all live questions from students screens if turned off
        if (questions.length > 0) {
            for (const question of questions) {
                const updateResponse = await apiUtil("put", `/courses/${courseId}/lectures/${lectureId}/questions/${question.id}/live/0`, { 
                    dispatch,
                    navigate
                });
                if (updateResponse.status === 200) {
                    // update students screens
                    socket.emit("setLiveQuestion", { lectureId });
                }
            }
            //remove all questions from being published
            for (const question of questions) {
                const updateResponse = await apiUtil("put", `/courses/${courseId}/lectures/${lectureId}/questions/${question.id}/sections/${sectionId}/0`, { 
                    dispatch,
                    navigate
                });
                if (updateResponse.status === 200) {
                    // update students screens
                    socket.emit("setLiveQuestion", { lectureId });
                }
            }
        }
        reloadQuestions();


    }

    const changeLiveState = async () => {
        setLoadingPublish(true);
        const isLiveNew = !isLive;
        const requestData = { isLive: isLiveNew, published: true };
        const liveStatus = isLiveNew ? '1' : '0';
        const response = await apiUtil("put", `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/live/${liveStatus}`, { 
            dispatch, 
            navigate,
        });
        setErrorPublish(response.error);
        setMessagePublish(response.message);
        setLoadingPublish(false);

        if (response.status === 200) {
            setIsLive(!isLive);
            setLecture(prevLecture => ({
                ...prevLecture,
                isLive: !prevLecture.isLive
            }));
            setPublished(true);
        
            //remove all live questions from students screens if turned off
            if (questions.length > 0) {
                for (const question of questions) {
                    const updateResponse = await apiUtil("put", `/courses/${courseId}/lectures/${lectureId}/questions/${question.id}/live/${false}`, { 
                        dispatch,
                        navigate
                    });
                    if (updateResponse.status === 200) {
                        // update students screens
                        socket.emit("setLiveQuestion", { lectureId });
                    }
                }
            }
            reloadQuestions();
        }
    };

    return (
        <div className="lecture-page-container">
            <div className="lecture-header">
                <Link className='back-btn-lectures' to={`/${courseId}/sections/${sectionId}`}>
                    <Button className='back-btn'> 
                        <div id="back-btn-image"/>
                    </Button>
                </Link>
                <p className="lecture-subtitle">{lecture ? lecture.title : ''} Lecture Questions</p>
            </div>

            <hr className="lecture-hr"></hr>
            
            {loading ? <TailSpin visible={true}/> : 
            message ? <Notice error={error ? "error" : ""} message={message}/> :
                <div className='lecture-container'>
                    <div className='switch'>
                        <label className="lecture-publish-switch">
                            <span>Publish Lecture</span>
                            { loadingPublish ? <TailSpin visible={true}/> : <Switch onChange={changePublishState} checked={published}/> }
                        </label>

                        <label className="lecture-live-switch">
                            <span>Go Live</span>
                            { loadingPublish ? <TailSpin visible={true}/> : <Switch onChange={changeLiveState} checked={isLive}/> }
                        </label>

                        { messagePublish !== "" && <Notice status={errorPublish ? "error" : ""} message={messagePublish}/> }
                    </div>

                    <div className='questions'>
                        {loading ? <TailSpin visible={true}/> : questions.map((question) => {
                            return <QuestionCard 
                                key={question.id} 
                                question={question} 
                                view={'teacher'} 
                                lecturePublished={published}
                                isLectureLive={isLive}
                                sectionId={sectionId}
                            />;
                        })}
                    </div>
                </div>
            }
        </div>
    )
}

export default LectureInSection