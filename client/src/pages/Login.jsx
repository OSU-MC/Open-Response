import React, { useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import Form from "react-bootstrap/Form";
import { Container, Row, Col, Dropdown, NavLink, Button, } from 'react-bootstrap'
import apiUtil from '../utils/apiUtil'
import { useDispatch } from 'react-redux';
import { login } from '../redux/actions';
import Notice from '../components/Notice'
import { Link } from "react-router-dom";
import { TailSpin } from  'react-loader-spinner'
import "../styles/auth.css"

const VITE_NAME = import.meta.env.VITE_NAME

export default function Login(props) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [ params ] = useSearchParams()

    //form fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    // TODO: expand this validation & use it
    function validateForm() {
        return email.length > 0 && password.length > 0;
    }

    // TODO: add some sort of loading symbol when waiting for a response
    async function authenticateUser(user){
    const response = await apiUtil('post', 'users/login', { dispatch: dispatch, navigate: navigate}, user)
    setLoading(false)
    setMessage(response.message ? response.message : "")
    setError(response.error)
    if (response.status === 200) {
        dispatch(login(response.data.user, response.data.status))
        try {
            navigate(params.get('redirect'))
        } catch(e) {
            navigate('/')
        }
    }
}

/* LoginForm component
Could maybe be moved to its own component file.

  This component is an email and password login with non-functional SSO button
  logins are handled on submit through authenticateUser function
*/
class LoginForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            email: '',
            rawPassword: ''
        };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    }

    // every time a text box is updated, it's react state is updated as well.
    handleChange(event) {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    }

    //input React states to authenticateUser function.
    handleSubmit() {
        event.preventDefault();
        setLoading(true)
        const user = {
            email: this.state.email,
            rawPassword: this.state.rawPassword,
        }
        authenticateUser(user);
    }

    render(){
        return(
            <form onSubmit={this.handleSubmit}>
                {/*Input fields: value mapped to React state through handleChange*/}
                <input type="text" name="email"
                    value={this.state.email} onChange={this.handleChange}
                    className="inputContainer emailContainer" placeholder="Email Address"
                />
                <input type="password" name="rawPassword"
                    value={this.state.rawPassword} onChange={this.handleChange}
                    className="inputContainer passwordContainer" placeholder= "Password"
                />
                <Link className="changePasswordLink" to="/reset">Forgot your password?</Link>
                {message != "" && error && <Notice message={message} error={error ? "error" : ""}/>}
                <input type="submit" value="Log in" className= "submitButton" />
                <p className='orSSOText'>or</p>
                <input type="submit" value="Continue with SSO" className= "ssoButton" />
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
                        <h1>Welcome Back!</h1>
                        <h2><a href="/create" className='subText'>New user?</a></h2>
                    </div>
                    <div className='linkBox'>
                        <a href="/home" className='homeButton'><img src="/arrow-left-solid.svg"/>Return to home</a>
                    </div>
                </div>
            </div>
            <div className='rightContainer'>
                <div className='loginSection'>
                    <h1>Log in</h1>
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
