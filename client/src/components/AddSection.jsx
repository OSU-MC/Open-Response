import React, { useState } from 'react'
import { Button, Form } from "react-bootstrap"
import { useParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { addSection } from "../redux/actions";
import apiUtil from '../utils/apiUtil'
import { TailSpin } from  'react-loader-spinner'
import Notice from './Notice'

function AddSection(props) {
    const [ number, setNumber ] = useState()
    const [ error, setError ] = useState(false)
    const [ message, setMessage ] = useState("")
    const [ loading, setLoading ] = useState(false)
    const { courseId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    async function postSection(sectionBody){
        //make a POST section api call
        setLoading(true)
        const response = await apiUtil("post", `/courses/${courseId}/sections`, { dispatch: dispatch, navigate: navigate}, sectionBody)
        setLoading(false)

        //update the redux
        setError(response.error)
        setMessage(response.message)
        if (response.status === 201) {
            dispatch(addSection(courseId, response.data.section))
            props.closeFunction()
        }
    }

    function addSectionSubmit(e){
        e.preventDefault()

        const newSection = {
            courseId: courseId,
            number: number
        }

        postSection(newSection)
    }

    return (
        <>
            { message !== "" && <Notice message={message} error={error}/> }
            <h1 className='add-section-h1'>Add Section</h1>
            <div className='add-section-div'>
                { loading ? <TailSpin visible={true}/> : <Form onSubmit={(e) => { addSectionSubmit(e) }}>
                        <Form.Group className="inputNameContainer" controlId="number">
                            <Form.Label>Section Number:</Form.Label>
                            <Form.Control 
                                type="number"
                                defaultValue="0"
                                min="0"
                                max="10000"
                                onChange={(e) => setNumber(e.target.value)}/>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Create Section
                        </Button>
                </Form> }
            </div>
        </>
    )
}

export default AddSection