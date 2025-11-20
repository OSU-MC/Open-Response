import apiUtil from "../utils/apiUtil";
import { addQuestions } from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { getQuestions } from "../redux/selectors";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function useQuestions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const questions = useSelector(getQuestions);
  const { courseId } = useParams();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [nextLink, setNextLink] = useState(null);
  const [prevLink, setPrevLink] = useState(null);

  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      const search = searchParams.get("search");
      const page = searchParams.get("page");
      let path = `courses/${courseId}/questions`;
      const response = await apiUtil(
        "get",
        path,
        { dispatch: dispatch, navigate: navigate },
        {},
        searchParams
      );
      setMessage(response.message);
      setError(response.error);
      if (response.status === 200) {
        dispatch(addQuestions(courseId, response.data.questions));
        setNextLink(response.data.links.nextPage);
        setPrevLink(response.data.links.prevPage);
      }
      setLoading(false);
    }
    getQuestions();
  }, [searchParams]);

  return [questions, nextLink, prevLink, message, error, loading];
}

export default useQuestions;
