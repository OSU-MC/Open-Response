import React, { useState, useEffect } from 'react';
import { Row, Col, Container, ListGroup, Button, NavLink } from "react-bootstrap"
import apiUtil from '../utils/apiUtil'
import { getUserState } from '../redux/selectors'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import Notice from '../components/Notice'
import { TailSpin } from  'react-loader-spinner'

function Profile(props) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    // TODO: create error handling functionality
    const userState = useSelector(getUserState);
    const [ firstName, setFirstName] = useState("");
    const [ lastName, setLastName] = useState("");
    const [ email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [ editToggle, setEditToggle ] = useState(false);
    const [ error, setError ] = useState(false)
    const [ message, setMessage ] = useState("")
    const [ loading, setLoading ] = useState(false)

    useEffect(() => {
        const getUserInfo = async () => {
            setLoading(true)
            const response = await apiUtil('get', `/users/${userState.user.id}`, { dispatch: dispatch, navigate: navigate })
            setLoading(false)
            setError(response.error)
            setMessage(response.message)
            if (response.status === 200) {
                setFirstName(response.data.user.firstName)
                setLastName(response.data.user.lastName)
                setEmail(response.data.user.email)
            }
        }
        getUserInfo()
    }, [])

    function settingEditToggle(){
        setEditToggle(!editToggle)
    }

    //--This function is essentially the main "PUT" request for editing the Account info.
    async function editAccountInfoRequest(accountPayload) {
        let response = {};

            response = await apiUtil("put", `/users/${userState.user.id}`, {dispatch: dispatch, navigate: navigate}, accountPayload)
            setError(response.error)
            setMessage(response.message)
        
    }

    //this function calls the api call, as well as sets the states all back to 
    //being blank.
    function sendEditedAccountInfo(){
        const newAccountInfo = {
            email: email,
            firstName: firstName,
            lastName: lastName
        }

        if (currentPassword != "")
            newAccountInfo.oldPassword = currentPassword
        if (newPassword != "")
            newAccountInfo.rawPassword = newPassword
        if (confirmedPassword != "")
            newAccountInfo.confirmedPassword = confirmedPassword

        editAccountInfoRequest(newAccountInfo);

        setCurrentPassword("")
        setNewPassword("")
        setConfirmedPassword("")
    }

    //this function bundles the functions into one central function so I can call this function 
    //on the onClick() callback.
    function onClickFunctions(){
        settingEditToggle();
        sendEditedAccountInfo();
    }

    // Doesn't resize well, need to make sure and fix that!
    if(editToggle){
        return (
            <>
                { loading ? <TailSpin visible={true}/> : <Container className='profileInfo'>
                <ListGroup className='tester'>
                        <ListGroup.Item className='profileRow'>
                            <Col xs={3}> <b>First Name:</b> </Col> <Col><input type='text' value={firstName} onChange={(event)=> {
                        setFirstName(event.target.value)}}></input></Col>     
                        </ListGroup.Item>

                        <ListGroup.Item className='profileRow'>
                            <Col xs={3}> <b>Last Name:</b> </Col> <Col><input type='text' value={lastName} onChange={(event)=> {
                        setLastName(event.target.value)}}></input></Col>
                        </ListGroup.Item>

                        <ListGroup.Item className='profileRow'>
                            {/* Need to add validation for these to be numbers, add dashed automatically? */}
                            <Col xs={3}> <b>Email:</b> </Col> <Col><input type='text' value={email} onChange={(event)=> {
                        setEmail(event.target.value)}}></input></Col>
                        </ListGroup.Item>

                        <ListGroup.Item className='profileRow'>
                            <Col xs={3}> <b>Current Password:</b> </Col> <Col><input type='text' onChange={(event)=> {
                        setCurrentPassword(event.target.value)}}></input> </Col>
                        </ListGroup.Item>

                        <ListGroup.Item className='profileRow'>
                            <Col xs={3}> <b>New Password:</b> </Col> <Col><input type='text' onChange={(event)=> {
                        setNewPassword(event.target.value)}}></input></Col>
                        </ListGroup.Item>

                        <ListGroup.Item className='profileRow'>
                            <Col xs={3}> <b>Confirm New Password:</b> </Col> <Col><input type='text' onChange={(event)=> {
                        setConfirmedPassword(event.target.value)}}></input></Col>
                        </ListGroup.Item>
                        
                        <Col xs={1} className='profileButton'> <Button onClick={onClickFunctions}> {editToggle ? "Save" : "Edit"} </Button> </Col>
                        { message !== "" && <Notice message={message} error={error}/> }
                    </ListGroup>
                </Container>}
            </>
        );
    } else{
        return (
            <>
                { message !== "" && <Notice message={message} error={error ? "error" : ""}/> }
                { loading ? <TailSpin visible={true}/> : <Container className='profileInfo'>
                        <ListGroup className='tester'>
                            <ListGroup.Item className='profileRow'>
                                <Col xs={3}> <b>First Name:</b> </Col> <Col><span>{firstName}</span></Col>
                            </ListGroup.Item>

                            <ListGroup.Item className='profileRow'>
                                <Col xs={3}> <b>Last Name:</b> </Col> <Col><span>{lastName}</span></Col>
                            </ListGroup.Item>

                            <ListGroup.Item className='profileRow'>
                                <Col xs={3}> <b>Email:</b> </Col> <Col><span>{email}</span></Col>
                            </ListGroup.Item>
                            
                            <Col xs={1} className='profileButton'> <Button onClick={() => setEditToggle(!editToggle)}>{editToggle ? "Save" : "Edit"}</Button> </Col>
                        </ListGroup>
                </Container>}
            </>
        );
    }
}

export default Profile;
