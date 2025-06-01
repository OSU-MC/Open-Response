import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap"
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import Notice from "./Notice";
import { joinCourse } from "../redux/actions";
import apiUtil from '../utils/apiUtil'

/******************************************************/
//Bugs:
//if A student enters a course which they have already joined
//no message for joinCodes which don't have a match
/******************************************************/

function JoinCourse(props) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [error, setError] = useState(false)
    const [message, setMessage] = useState("")
    const [joinCode, setJoinCode] = useState("")

    async function handleJoinSubmit(e) {
        event.preventDefault()
        //setJoinCode(e.target.value)
        //post to the courses/join endpoint
        const joinCodePayload = { joinCode: joinCode }
        const response = await apiUtil("post", "courses/join", { dispatch: dispatch, navigate: navigate }, joinCodePayload);
        setError(response.error)
        setMessage(response.message)
        if (response.status === 201)
            dispatch(joinCourse(response.data.course))
    }

    return (
        <div className="join-course-form">
            <div className="join-course-submit">
               <Form onSubmit={(e) => { handleJoinSubmit(e) }}>
                <Form.Group controlId="formJoinCourse">
                    <Form.Control type="text" placeholder="Enter Join Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                </Form.Group>
                <button type="submit" className="join-course-button">
                    + Join Course
                </button>
                </Form> 
            </div>
            
            
            {message !== "" && <Notice status={error ? "error" : ""} message={message} />}
        </div>
    );
}

export default JoinCourse;
