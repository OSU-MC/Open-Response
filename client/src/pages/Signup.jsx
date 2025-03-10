import React, { useRef, useState } from "react"
import apiUtil from '../utils/apiUtil'
import Notice from '../components/Notice'
import { useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom";
import "../styles/home.css"

const VITE_NAME = import.meta.env.VITE_NAME

function Signup(props){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [isTeacher, setIsTeacher] = useState(false);
    const [message, setMessage] = useState("")
    const [error, setError] = useState(false)
    const emailInput = useRef(null)
    const passwordInput = useRef(null)
    const confirmPasswordInput = useRef(null)
    const firstNameInput = useRef(null)
    const lastNameInput = useRef(null)
    const navigate = useNavigate()
    
    async function CreateAccountRequest(accountPayload){
        let response = {}

        response = await apiUtil('post', '/users', {}, accountPayload)

        setError(response.error)
        setMessage(response.message)
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setFirstName("")
        setLastName("")
        setIsTeacher(false)

        if(response.status == 201){
            navigate("/login")
        }
    }

    function createAccountStaging(){
        event.preventDefault()

        const accountInformation = {
            email: email,
            rawPassword: password,
            confirmedPassword: confirmPassword,
            firstName: firstName,
            lastName: lastName,
            isTeacher: isTeacher
        }

        CreateAccountRequest(accountInformation)
        emailInput.current.value = ''
        passwordInput.current.value = ''
        confirmPasswordInput.current.value = ''
        firstNameInput.current.value = ''
        lastNameInput.current.value = ''
    }

    class SignupForm extends React.Component {
        constructor(props){
        super(props);
        this.state = {
            email: '',
            rawPassword: '',
            confirmedPassword: '',
            firstName: '',
            lastName: '',
            isTeacher: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // every time a text box is updated, it's react state is updated as well.
    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    //input React states to CreateAccountRequest function.
    handleSubmit() {
        event.preventDefault();

        const accountInformation = {
            email: this.state.email,
            rawPassword: this.state.rawPassword,
            confirmedPassword: this.state.confirmedPassword,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            isTeacher: this.state.isTeacher
        }
        
        CreateAccountRequest(accountInformation)
    }

    render(){
        return(
            <form onSubmit={this.handleSubmit}>
                <div className="userTypeSelector">
                    <label className="switch">
                        <p id="studentText">I am a <b>student</b></p>
                        <p id="teacherText">I am a <b>teacher</b></p>
                        <input type="checkbox" name="isTeacher" className="teacherCheck" checked={this.state.isTeacher} onChange={this.handleChange} />
                        <span className="slider"></span>
                    </label>
                </div>
                {/*Input fields: value mapped to React state through handleChange*/}
                <input type="text" name="firstName"
                    value={this.state.firstName} onChange={this.handleChange}
                    className="inputContainer firstNameContainer" placeholder="First Name"
                />
                <input type="text" name="lastName"
                    value={this.state.lastName} onChange={this.handleChange}
                    className="inputContainer lastNameContainer" placeholder="Last Name"
                />
                <input type="text" name="email"
                    value={this.state.email} onChange={this.handleChange}
                    className="inputContainer emailContainer" placeholder="Email Address"
                />
                <input type="password" name="rawPassword"
                    value={this.state.rawPassword} onChange={this.handleChange}
                    className="inputContainer passwordContainer" placeholder="Password"
                />
                <input type="password" name="confirmedPassword"
                    value={this.state.confirmedPassword} onChange={this.handleChange}
                    className="inputContainer passwordContainer" placeholder="Confirm Password"
                />
                <input type="submit" value="Sign Up" className="submitButton" />
                <p className='orSSOTextSignup'> or </p>
                <input type="submit" value="Continue with SSO" className="ssoButton" />
            </form>
        )
    }
}

    return (
        <div id="auth">
            <div className='leftContainer'>
                <div className= 'welcomeBox'>
                    <span className='classroomLink'>
                        {/*Image attr: Unknown, need to ask*/}
                        <img className="classroomIcon" src="classroomIcon.png" />
                        {VITE_NAME}
                    </span>
                    <div className='textBox'>
                        <h1>Create your free account today!</h1>
                        <h2><a href="login" className='subText'>Already have an account?</a></h2>
                    </div>
                    <a href="/home" className='homeButton'><img src="/arrow-left-solid.svg"/>Return to home</a>
                </div>
            </div>
            <div className='rightContainer'>
                <div className='loginSection'>
                    <h1>Sign Up</h1>
                    <SignupForm />
                </div>
            </div>
        </div>
        )
    }

export default Signup
