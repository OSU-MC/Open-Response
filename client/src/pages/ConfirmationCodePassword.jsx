import React, { useState } from "react"
import { Row, Col, Container, ListGroup, Button, NavLink } from "react-bootstrap"
import apiUtil from '../utils/apiUtil'
import { getUserState } from '../redux/selectors'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import Notice from '../components/Notice'
import { TailSpin } from  'react-loader-spinner'
import "../styles/auth.css"

const VITE_NAME = import.meta.env.VITE_NAME;

//we will need state variable to grab the email address.
//onClick is going to redirect 

//this function is prompting the user for email to send verification code
function ConfirmationCodePasswordRequest() {
    const [email, setEmail] = useState("")
    const [ error, setError ] = useState(false)
    const [ message, setMessage ] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    async function confirmationCodeRequest(emailPayload) {
        let response = {}

        response = await apiUtil('put', '/users/password', {}, emailPayload)

        if(response.status == 200){
            navigate("/reset/password")
        }

        setError(response.error)
        setMessage(response.message)
        setEmail("")
    }

    function emailObjectStaging(){
        const emailInput = {
            email: email
        }

        confirmationCodeRequest(emailInput)
    }
    
    return (
        <div id="auth">
            <div className='leftContainer'>
                <div className='welcomeBox'>
                    <span className='classroomLink'>
                    {/*Image attr: Unknown, need to ask*/}
                        <img className="classroomIcon" src="classroomIcon.png" alt="Classroom Icon" />
                        {VITE_NAME}
                    </span>
                    <div className='textBox'>
                        <h1>Welcome Back!</h1>
                        <h2><a href="/create" className='subText'>New user?</a></h2>
                    </div>
                    <div className='linkBox'>
                        <a href="/home" className='homeButton'><img src="/arrow-left-solid.svg" alt="Back" />Return to home</a>
                    </div>
                </div>
            </div>
            <div className="rightContainer">
                <div className="resetpassword">
                    <div className="confirmationCodeDivContainer">
                        <h1 className="confirmationCodePageh1">Forgot Password?</h1>
                        <p>Please enter your email address related to your account.<br/>We will send a confirmation code to that email.</p>
                        <br />
                        <form onSubmit={(event) => event.preventDefault()}>
                            <div>
                                <input
                                    onChange={(input) => setEmail(input.target.value)}
                                    placeholder="test@test.com"
                                />
                            </div>
                            <br />
                            <div>
                                <button type="submit" className="submitButtonReset" onClick={emailObjectStaging}>Get Code</button>
                            </div>
                        </form>
                        {message && <p className={error ? 'errorMessage' : 'successMessage'}>{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

//this function is the screen for the user to change their password to the account. 
//Using the PUT that includes email, confirmation code, rawpassword, and confirmed new password.
export default ConfirmationCodePasswordRequest
