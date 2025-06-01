import React, { useState } from 'react'
import { Button, Form } from "react-bootstrap"
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { addLectures } from "../redux/actions";
import apiUtil from '../utils/apiUtil'
import { TailSpin } from  'react-loader-spinner'
import Notice from '../components/Notice'
import { Link, useParams } from 'react-router-dom'

function AddLecture(props){
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [order, setOrder] = useState("")
    const { courseId } = useParams()
    const [error, setError] = useState(false)
    const [message, setMessage] = useState("")
    const [loading, setLoading ] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    async function postLecture(newLecturePayload){
        //make a POST course api call
        setLoading(true)
        const route = "/courses/" + courseId + "/lectures"
        const response = await apiUtil("post", route, { dispatch: dispatch, navigate: navigate}, newLecturePayload)
        setLoading(false)

        //update the redux
        setError(response.error)
        setMessage(response.message)
        if(response.status === 201){
            dispatch(addLectures(response.data.course))
            navigate(`/${courseId}/lectures`)
            window.location.reload(false)
        }
    }

    function addLectureSubmit(e){
        e.preventDefault()

        const newLecture = {
            courseId: courseId,
            title: title,
            order: order,
            description: description
        }

        postLecture(newLecture)
    }

    return(
        <>
            { message !== "" && <Notice message={message} error={error ? "error" : ""}/> }
            { loading ? <TailSpin visible={true}/> : <Form className="create-container" onSubmit={(e) => { addLectureSubmit(e) }}>
                <div className='create-bar'>
                    <Link className='back-btn-create' to={`/${courseId}/lectures`}>
                        <Button className='back-btn'> 
                            <div id="back-btn-image"/>
                        </Button>
                    </Link>
                    <h1 className='create-subtitle'>Create Lecture</h1>
                </div>
                <hr className='create-hr-bar'></hr>
                <Form.Group className="inputTitleContainer">
                    <Form.Label>Title Name</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Enter Title Name" 
                        onChange={(e) => setTitle(e.target.value)}/>
                </Form.Group>
                <Form.Group className="inputDescriptionContainer">
                    <Form.Label>Lecture Description</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows="4"
                        placeholder="Enter Lecture Description"
                        onChange={(e) => setDescription(e.target.value)}/>
                </Form.Group>
                <Form.Group className="inputOrderContainer">
                    <Form.Label id="lecture-order-subtitle">Lecture Order</Form.Label>
                    <Form.Control 
                        id="lecture-order-textentry"
                        type="text" 
                        pattern="[0-9]*"
                        placeholder="Enter Lecture Order"
                        onChange={(e) => setOrder(e.target.value)}/>
                </Form.Group>
                
                <div className="create-btns">
                    <Link to={`/${courseId}/lectures`}>
                        <Button variant="secondary" id="create-cancel">
                            Cancel
                        </Button>
                    </Link>
                    <Button className="btn-add" variant="primary" type="submit" id="create-submit">
                        Create Lecture
                    </Button>
                </div>
            </Form> }
        </>
    )
}

export default AddLecture;