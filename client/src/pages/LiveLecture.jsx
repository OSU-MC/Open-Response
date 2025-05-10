import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "react-bootstrap";
import Notice from '../components/Notice';
import useLectures from '../hooks/useLectures';
import useCourse from "../hooks/useCourse";
import useLectureQuestions from '../hooks/useLectureQuestions';
import SingleQuestionStudent from '../components/questions/SingleQuestionStudent';
import io from 'socket.io-client';

const url = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const socket = io(url);

function LiveLecture() {
    const navigate = useNavigate();
    const { courseId, lectureId } = useParams();
    const [lectures, message, error, loading] = useLectures();
    const [course, role, Cmessage, Cerror, Cloading] = useCourse();
    const [lecture, lMessage, lError, lLoading, getLecture] = useLectureQuestions();

    useEffect(() => {
        socket.emit("joinLecture", { lectureId });
        socket.on("questionUpdated", () => {
            getLecture();
        });

        return () => {
            socket.off("questionUpdated");
        };
    }, [lectureId, getLecture]);
    
    const liveQuestions = lecture?.questions?.filter(question => question.isLive);

    return (
        <div className="LiveLecture">
            <div className='lectures-top-bar'>
                <Link className='back-btn-lectures'>
                    <Button className='back-btn' onClick={() => navigate(-1)}>
                        <div id="back-btn-image"/>
                    </Button>
                </Link>
                <h2>Live Lecture</h2>
            </div>

            <div className="live-lecture-content">
                <h3>Live Questions</h3>
                {liveQuestions?.length > 0 ? (
                    liveQuestions.map((question) => (<SingleQuestionStudent key={question.id} question={question} courseId={courseId} lectureId={lectureId} questionId={question.id}/>))
                ) : (
                    <Notice message="No live questions available for this lecture." />
                )}
            </div>
        </div>
    );
}

export default LiveLecture;
