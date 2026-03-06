import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserState } from "../redux/selectors";
import { login } from "../redux/actions";
import { useNavigate } from "react-router-dom";
import apiUtil from "../utils/apiUtil";

function useAuth() {
  const user = useSelector(getUserState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function authenticate() {
      const response = await apiUtil("get", "users/authenticate", {
        dispatch: dispatch,
        navigate: navigate,
        overrideRedirect: true,
      });
      setError(response.error);
      setMessage(response.message);
      if (response.status === 200) {
        dispatch(login(response.data.user, response.data.status));
      }
      setLoading(false);
    }
    if (user.id == null) {
      setLoading(true);
      authenticate();
    }
  }, []);

  async function refresh() {
    setLoading(true);
    const response = await apiUtil("get", "users/authenticate", {
      dispatch: dispatch,
      navigate: navigate,
      overrideRedirect: true,
    });
    setError(response.error);
    setMessage(response.message);
    if (response.status === 200) {
      dispatch(login(response.data.user, response.data.status));
    }
    setLoading(false);
  }

  return {
    loggedIn: user && user.user ? user.user.id != null : false,
    message,
    error,
    loading,
    refresh,
  };
}

export default useAuth;
