import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import apiUtil from "@/utils/apiUtil";
import "@/styles/home.css";

const VITE_NAME = import.meta.env.VITE_NAME;

function Signup() {
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    rawPassword: "",
    confirmedPassword: "",
    firstName: "",
    lastName: "",
    isTeacher: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const { refresh } = useAuth();

  async function CreateAccountRequest(accountPayload) {
    let response = {};
    response = await apiUtil("post", "/users", {}, accountPayload);

    setError(response.error);
    setMessage(response.message);
    setFormData({
      email: "",
      rawPassword: "",
      confirmedPassword: "",
      firstName: "",
      lastName: "",
      isTeacher: false,
    });

    if (response.status == 201) {
      setShowForm(false);
      setMessage(
        "Account signup successful, redirecting to home page in the next 3 seconds..."
      );
      setTimeout(() => {
        refresh();
      }, 3000);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    // TODO: temporary check for oregonstate.edu email
    const email = formData.email;
    const lastAtSignIdx = email.lastIndexOf("@");
    if (lastAtSignIdx === -1) {
      setError(true);
      setMessage("Invalid email format");
      return;
    }
    const emailProvider = email.slice(lastAtSignIdx + 1);
    if (!formData.isTeacher & (emailProvider !== "oregonstate.edu")) {
      setError(true);
      setMessage("Not a valid 'oregonstate.edu' email");
      return;
    }

    const accountInformation = formData;
    CreateAccountRequest(accountInformation);
  }

  return (
    <div id="auth">
      <div className="leftContainer">
        <div className="welcomeBox">
          <span className="classroomLink">
            {/*Image attr: Unknown, need to ask*/}
            <img className="classroomIcon" src="classroomIcon.png" />
            {VITE_NAME}
          </span>
          <div className="textBox">
            <h1>Create your free account today!</h1>
            <h2>
              <a href="login" className="subText">
                Already have an account?
              </a>
            </h2>
          </div>
          <a href="/home" className="homeButton">
            <img src="/arrow-left-solid.svg" />
            Return to home
          </a>
        </div>
      </div>
      <div className="rightContainer">
        <div className="loginSection">
          <h1>Sign Up</h1>
          {showForm && (
            <>
              <form onSubmit={handleSubmit}>
                <div className="userTypeSelector">
                  <label className="switch">
                    <p id="studentText">
                      I am a <b>student</b>
                    </p>
                    <p id="teacherText">
                      I am a <b>teacher</b>
                    </p>
                    <input
                      type="checkbox"
                      name="isTeacher"
                      className="teacherCheck"
                      checked={formData.isTeacher}
                      onChange={handleChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="inputContainer firstNameContainer"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="inputContainer lastNameContainer"
                  placeholder="Last Name"
                />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="inputContainer emailContainer"
                  placeholder="Email Address"
                />
                <input
                  type="password"
                  name="rawPassword"
                  value={formData.rawPassword}
                  onChange={handleChange}
                  className="inputContainer passwordContainer"
                  placeholder="Password"
                />
                <input
                  type="password"
                  name="confirmedPassword"
                  value={formData.confirmedPassword}
                  onChange={handleChange}
                  className="inputContainer passwordContainer"
                  placeholder="Confirm Password"
                />
                {error && <p>{error}</p>}
                {message && <p>{message}</p>}
                <input type="submit" value="Sign Up" className="submitButton" />
                <p className="orSSOTextSignup"> or </p>
                <input
                  type="submit"
                  value="Continue with SSO"
                  className="ssoButton"
                />
              </form>
            </>
          )}
          {!showForm && message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Signup;
