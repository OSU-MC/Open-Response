import React, { useRef, useState } from "react"
import apiUtil from '../utils/apiUtil'
import { useNavigate } from 'react-router-dom'
import Notice from '../components/Notice'
import { TailSpin } from  'react-loader-spinner'
import "../styles/auth.css"

const VITE_NAME = import.meta.env.VITE_NAME;
import classroomIcon from '../../public/classroomIcon.png';

function ResetPasswordForLoginUser(){
const [email, setEmail] = useState("")
const [confirmationCode, setConfirmationCode] = useState("")
const [newPassword, setNewPassword] = useState("")
const [confirmNewPassword, setConfirmNewPassword] = useState("")
const [ error, setError ] = useState(false)
const [ message, setMessage ] = useState("")
const passwordConfirmInput = useRef(null)
const passwordInput = useRef(null)
const confirmationCodeInput = useRef(null)
const emailInput = useRef(null)
const navigate = useNavigate()

 console.log(email)
 console.log(confirmationCode)
 console.log(newPassword)
 console.log(confirmNewPassword)
 console.log(error)

    async function resetPasswordRequest(passwordPayload){
        let response = {}

        response = await apiUtil('put', '/users', {}, passwordPayload)
        console.log(response)

        setError(response.error)
        setMessage(response.message)
        setEmail("")
        setConfirmNewPassword("")
        setNewPassword("")
        setConfirmationCode("")

        if(response.status == 200){
            navigate("/")
        }
    }

    function resetPasswordObjectStaging(){
        const resetPasswordInformation = {
            email: email,
            passwordResetCode: confirmationCode,
            rawPassword: newPassword,
            confirmedPassword: confirmNewPassword
        }

        resetPasswordRequest(resetPasswordInformation)
        emailInput.current.value = ''
        confirmationCodeInput.current.value = ''
        passwordInput.current.value = ''
        passwordConfirmInput.current.value = ''
    }

    return(
        <div id="auth">
            <div className='leftContainer'>
                <div className='welcomeBox'>
                    <span className='classroomLink'>
                    {/*Image attr: Unknown, need to ask*/}
                        <img className="classroomIcon" src={classroomIcon} alt="Classroom Icon" />
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
                <div className="formContainer">
                    <form onSubmit={(event) => event.preventDefault()}>
                        <div className="formGroup">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                className="inputField"
                                ref={emailInput}
                                placeholder="Enter email here..."
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="confirmationCode">Confirmation Code</label>
                            <input
                                id="confirmationCode"
                                className="inputField"
                                ref={confirmationCodeInput}
                                placeholder="Enter confirmation code here..."
                                onChange={(event) => setConfirmationCode(event.target.value)}
                            />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                className="inputField"
                                ref={passwordInput}
                                placeholder="Enter new password here..."
                                onChange={(event) => setNewPassword(event.target.value)}
                            />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="confirmNewPassword">Confirm New Password</label>
                            <input
                                id="confirmNewPassword"
                                type="password"
                                className="inputField"
                                ref={passwordConfirmInput}
                                placeholder="Confirm new password here..."
                                onChange={(event) => setConfirmNewPassword(event.target.value)}
                            />
                        </div>
                        <button type="submit" className="submitButtonReset" onClick={resetPasswordObjectStaging}>
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordForLoginUser
