import axios from 'axios'
import { logout } from '../redux/actions'
import Notice from '../components/Notice'

// TODO: set up config for stuff like CORS

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://core.open-response.org',
    withCredentials: true
});

const handleRequest = async (method, route, reactOpts, body, params) => {
    try {
        const response = await sendRequest(method, route, body, params)
        const responseBody = {
            data: response.data,
            status: response.status,
            error: false,
            message: ""
        }
        if (response.data.message != null) {
            responseBody.message = response.data.message
        }
        return responseBody
    }
    catch (e) { // defines global response behaviors for errors so our application's API calls can be coded with reduced repitition
        if (e.response) {
            if (e.response.status === 401 && (reactOpts.overrideRedirect !== true)) {
                reactOpts.dispatch(logout())
                reactOpts.navigate(`/login?redirect=${location.pathname}`)
            }
            else if (e.response.status === 403) {
                reactOpts.navigate(`/`)
            }
            return {
                message: e.response.data.error,
                data: e.response.data,
                status: e.response.status,
                error: true
            }
        }

        else {
            return {
                message: 'An unexpected error occurred. Please try again later.',
                data: {},
                status: 500,
                error: true
            }
        }
    }
}

// this method makes calling the axios methods a little simpler and handles bad request types
const sendRequest = async (method, route, body, params) => {
    switch(method) {
        case 'get':
            return await getRequest(route, params)
        case 'post':
            return await postRequest(route, body)
        case 'put':
            return await putRequest(route, body)
        case 'delete':
            return await deleteRequest(route)
        default:
            console.log('Invalid HTTP method')
            throw new Error("Invalid HTTP method")
    }
}

const getRequest = async (route, params) => {
    return await axiosInstance.request({
        url: route,
        method: "get",
        params: params
    })
}

const postRequest = async (route, body) => {
    return await axiosInstance.request({
        url: route,
        method: 'post',
        data: body
    })
}

const putRequest = async (route, body) => {
    return await axiosInstance.request({
        url: route,
        method: "put",
        data: body
    })
}

const deleteRequest = async (route) => {
    return await axiosInstance.request({
        url: route,
        method: "delete"
    })
}

export default handleRequest 
