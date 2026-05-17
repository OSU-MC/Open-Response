import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { useDispatch } from "react-redux";

import Notice from "@/components/Notice";
import apiUtil from "@/utils/apiUtil";
import { login } from "@/redux/actions";
import "@/styles/auth.css";

const VITE_NAME = import.meta.env.VITE_NAME;

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    rawPassword: "",
  });
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function authenticateUser(user) {
    const response = await apiUtil(
      "post",
      "users/login",
      { dispatch: dispatch, navigate: navigate },
      user
    );
    setTimeout(() => {
      setLoading(false);
      setMessage(response.message ? response.message : "");
      setError(response.error);
      setFormData((prev) => ({
        ...prev,
        rawPassword: "",
      }));
      if (response.status === 200) {
        dispatch(login(response.data.user, response.data.status));
        try {
          navigate(params.get("redirect"));
        } catch {
          navigate("/");
        }
      }
    }, 1000);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const isValidForm = (form) => {
    const email = form.email;
    const password = form.rawPassword;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // check email format
    return email.length > 0 && password.length > 0 && re.test(email);
  };

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    const user = {
      email: formData.email.trim(),
      rawPassword: formData.rawPassword,
    };
    if (!isValidForm(user)) {
      setTimeout(() => {
        setLoading(false);
        setFormData((prev) => ({
          ...prev,
          rawPassword: "",
        }));
        return;
      }, 1000);
    }

    authenticateUser(user);
  }

  return (
    <div id="auth">
      <div className="leftContainer">
        <div className="welcomeBox">
          <span className="classroomLink">
            <img className="classroomIcon" src="classroomIcon.png" />
            {VITE_NAME}
          </span>
          <div className="textBox">
            <h1>Welcome Back!</h1>
            <h2>
              <a href="/create" className="subText">
                New user?
              </a>
            </h2>
          </div>
          <div className="linkBox">
            <a href="/home" className="homeButton">
              <img src="/arrow-left-solid.svg" />
              Return to home
            </a>
          </div>
        </div>
      </div>
      <div className="rightContainer">
        <div className="loginSection">
          <h1>Log in</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="inputContainer emailContainer"
              placeholder="Email Address"
              disabled={loading}
            />
            <input
              type="password"
              name="rawPassword"
              value={formData.rawPassword}
              onChange={handleChange}
              className="inputContainer passwordContainer"
              placeholder="Password"
              disabled={loading}
            />
            <Link className="changePasswordLink" to="/reset">
              Forgot your password?
            </Link>
            {message != "" && error && (
              <Notice message={message} error={error ? "error" : ""} />
            )}
            {loading && (
              <div className="center-div">
                <TailSpin />
              </div>
            )}
            <input type="submit" value="Log in" className="submitButton" />
            <p className="orSSOText">or</p>
            <input
              type="submit"
              value="Continue with SSO"
              className="ssoButton"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
