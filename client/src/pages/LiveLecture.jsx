import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "react-bootstrap";
import Notice from '../components/Notice';
import useLectures from '../hooks/useLectures';
import useCourse from "../hooks/useCourse";
import useLectureQuestions from '../hooks/useLectureQuestions';
import SingleQuestionStudent from '../components/questions/SingleQuestionStudent';
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import io from 'socket.io-client';

const url = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3002'

const socket = io(url);

function LiveLecture() {
    const navigate = useNavigate();
    const { courseId, lectureId } = useParams();
    const [lectures, message, error, loading] = useLectures();
    const [course, role, Cmessage, Cerror, Cloading] = useCourse();
    const [lecture, lMessage, lError, lectureLoading, getLecture] = useLectureQuestions();

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
    const closedQuestions = lecture?.questions?.filter(question => !question.isLive);

    const breadcrumbs_object = [['Courses', '/'], [course.name, `/${courseId}/sections`], [`Lectures`, null], [`Live`, null]];

    return (
        <div className="LiveLecture">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '10px 20vh',
                backgroundColor: 'var(--accent2)',
                borderBottom: '2px solid #e5e7eb'
            }}>
                <div style={{ marginBottom: '8px' }}>
                    <Breadcrumbs breadcrumbs={breadcrumbs_object} />
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Link className='back-btn-lectures'>
                        <Button className='back-btn' onClick={() => navigate(-1)}>
                            <div id="back-btn-image"/>
                        </Button>
                    </Link>
                    <h2>Live Lecture</h2>
                </div>
                <p style={{
                    borderBottom: '2px solid var(--accent)',
                    width: '100%',
                    padding: '10px'
                }}>
                    {`${lecture?.description ? lecture?.description : 'This is an example lecture description.'}`}
                </p>
            </div>

            <div className="live-lecture-content"
            style={{
                display: 'flex',
                alignItems: 'center'
            }}>
                {/* Closed question sidebar */}
                <div style={{
                    width: '150px',
                    height: 'auto',
                    marginLeft: '10vw',
                    padding: '10px',
                    backgroundColor: 'var(--accent2)',
                    borderRadius: '8px'
                }}>
                    <h6 style={{borderBottom: '1px solid var(--accent)'}}>Closed Questions</h6>
                    <ul style={{
                        listStyleType: 'none', 
                        padding: 0,
                        fontSize: '12px'
                    }}>
                        {closedQuestions?.length > 0 ? closedQuestions.map(question => (
                            <li key={question.id} style={{ marginBottom: '8px' }}>
                                <a href={`#question-${question.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                                    Question {question.id} {question.isAnswered ? '✓' : 'x'}
                                </a>
                            </li>
                        )) : <p>No closed questions yet.</p>}
                    </ul>
                </div>
                <div style={{ flexGrow: 1 }}>
                    {liveQuestions?.length > 0 ? (
                        liveQuestions.map((question) => (<SingleQuestionStudent key={question.id} question={question} courseId={courseId} lectureId={lectureId} questionId={question.id}/>))
                    ) : (
                        <Notice message="No live questions available for this lecture." />
                    )}
                </div>
                <div style={{width:'calc(150px + 10vw)'}} />
            </div>
        </div>
    );
}

export default LiveLecture;