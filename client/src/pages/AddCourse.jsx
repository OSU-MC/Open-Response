import React, { useState } from 'react'
import { Button, Form } from "react-bootstrap"
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { createCourse } from "../redux/actions";
import { Link, useParams } from 'react-router-dom';
import apiUtil from '../utils/apiUtil'
import { TailSpin } from  'react-loader-spinner'
import Notice from '../components/Notice'
import useCourse from "../hooks/useCourse";
import '../styles/addcourse.css'

export default function AddCourse(props){

    //Old things, not sure how much of this is needed
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [published, setPublished] = useState()
    const [error, setError] = useState(false)
    const [message, setMessage] = useState("")
    const [ loading, setLoading ] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    class CreateForm extends React.Component {
        constructor(props){
            super(props);
            this.state = {
                name: '',
                description: '',
                published: true
            };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        }

        // every time a text box is updated, it's react state is updated as well.
        handleChange(event) {
            const { name, value } = event.target;
            this.setState({
                [name]: value
            });
        }

        handleCheck(event){
            const {name, checked } = event.target;
            this.setState({
                [name]: checked
            });
        }

        //input React states to authenticateUser function.
        handleSubmit() {
            event.preventDefault();
            const newCourse = {
                name: this.state.name,
                description: this.state.description,
                published: this.state.published ? 1 : 0
            }
            
            postCourse(newCourse);
        }

        render(){
            return(
                <form onSubmit={this.handleSubmit}>
                    {/*Input fields: value mapped to React state through handleChange*/}
                   <h1>Create Course</h1>
                    <input type="text" name="name"
                        value={this.state.name} onChange={this.handleChange}
                        className="inputContainer" placeholder="Class Name"
                    />
                    <input type="text" name="description"
                        value={this.state.description} onChange={this.handleChange}
                        className="inputContainer" placeholder= "Class Description"
                    />

                    <input type="checkbox" name="published"
                        checked={this.state.published} onChange={this.handleCheck}
                        className="publishedCheck"
                    />
                    <label className='publishedLabel'> Publish course? </label>

                    <input type="submit" value="+ Create Course" className="submitButton" />
                </form>
            )
        }
    }

    async function postCourse(newCoursePayload){
        //make a POST course api call
        setLoading(true)
        const response = await apiUtil("post", "/courses", { dispatch: dispatch, navigate: navigate}, newCoursePayload)
        setLoading(false)

        //update the redux
        setError(response.error)
        setMessage(response.message)
        if(response.status === 201){
            dispatch(createCourse(response.data.course))
            navigate(`/${response.data.course.id}`)
        }
    }

    return (
        <>
            <div className='createContainer'>
                <CreateForm />
            </div>
        </>
    )
}
