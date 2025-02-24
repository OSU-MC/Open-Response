import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { TailSpin } from 'react-loader-spinner';
import Notice from '../components/Notice';
import { Button, Card } from "react-bootstrap";
import useLectures from '../hooks/useLectures';
import useCourse from "../hooks/useCourse";
import useLectureQuestions from '../hooks/useLectureQuestions';
import QuestionListItem from '../components/questions/QuestionListItem';
import SingleQuestionStudent from '../components/questions/SingleQuestionStudent';
import SingleQuestionTeacher from '../components/questions/SingleQuestionTeacher';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // TODO change url


function LiveLecture() {
    const location = useLocation();
    const navigate = useNavigate();
    const { courseId, lectureId} = useParams();
    const [lectures, message, error, loading] = useLectures()
    const [ course, role, Cmessage, Cerror, Cloading ] = useCourse()
    const [lecture, lMessage, lError, lLoading, getLecture] = useLectureQuestions();
    const [currentQuestion, setCurrentQuestion] = useState(null);
    
    // console.log("currentQuestion: ", currentQuestion);
    // console.log("lecture: ", lecture);
    useEffect(() => {
        if (lecture?.questions?.length > 0) {
            setCurrentQuestion(lecture.questions[lecture.questions.length - 1]);
        }
    }, [lecture]);

    useEffect(() => {
        
        socket.emit("joinLecture", { lectureId });

        socket.on("questionUpdated", () => {
            console.log("Received questionUpdated event, refetching questions...");
            getLecture();
        });

        return () => {
            socket.off("questionUpdated");
        };

    
    }, [lectureId, getLecture]);


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
                <h3>Current Question</h3>
                {currentQuestion ? (
                    <SingleQuestionStudent 
                        question={currentQuestion} 
                        courseId={courseId} 
                        lectureId={lectureId} 
                        questionId={currentQuestion.id} 
                    />
                ) : (
                    <Notice message="No questions available for this live lecture." />
                )}
            </div>
            
        </div>
    );
}

export default LiveLecture;