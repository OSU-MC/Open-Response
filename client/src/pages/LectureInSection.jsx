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

//URL : :courseId/sections/:sectionId/lectures/:lectureId

function LectureInSection() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [ questions, message, error, loading ] = useLectureForSectionQuestions()
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
    }

    const changeLiveState = async () => {
        setLoadingPublish(true);
        const requestData = { isLive: !isLive, published: true };
        console.log('Sending live state:', requestData);
        const response = await apiUtil("put", `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/live`, { 
            dispatch, 
            navigate,
            data: { isLive: !isLive, published: true }
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
            console.log('Updated Lecture:', { ...lecture, isLive: !lecture.isLive });
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
                    {loading ? <TailSpin visible={true}/> : questions.questions.map((question) => {
                            return <QuestionCard 
                                        key={question.id} 
                                        question={question} 
                                        view={'teacher'} 
                                        lecturePublished={published}
                                        isLectureLive={isLive}
                                    />;
                        })}
                    </div>
                </div>
            }
        </div>
    )
}

export default LectureInSection