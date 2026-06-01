import React, { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Switch } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import apiUtil from "../utils/apiUtil";
import { TailSpin } from "react-loader-spinner";
import { togglePublishedForQuestionInLecture } from "../redux/actions";
import { io } from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL || "ws://localhost:3002";

const socket = io(url);

function QuestionCard(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [published, setPublished] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const { courseId, lectureId, sectionId } = useParams();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("props.question:", props.question);
    setIsLive(!!props.question.isLive);

    async function fetchQuestionState() {
      if (props.view === "teacher" && sectionId) {
        setLoading(true);
        const response = await apiUtil(
          "get",
          `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/questions/${props.question.id}`,
          { dispatch, navigate }
        );
        setLoading(false);
        console.log("response: ", response.data);
        if (response.status === 200) {
          setPublished(!!response.data.published);
        } else {
          setError(true);
          setMessage(response.message || "Failed to fetch question state");
        }
      } else {
        setPublished(!!props.question.published);
      }
    }
    fetchQuestionState();
  }, [courseId, lectureId, sectionId, props.question.id, props.view]);

  //(un)publish a question
  //called on switch onChange()
  async function changePublishState() {
    setLoading(true);
    const response = await apiUtil(
      "put",
      `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/questions/${props.question.id}/`,
      { dispatch, navigate }
    );
    setLoading(false);
    setError(response.error);
    setMessage(response.message);
    console.log("response: ", response.data);

    if (response.status === 200) {
      setPublished(response.data.published);
      dispatch(
        togglePublishedForQuestionInLecture(lectureId, response.data.id)
      );
      // Notify students a question's publish state changed (legacy signal)
      socket.emit("setLiveQuestion", { lectureId, question: null });
    }
  }

  async function goLive() {
    setLoading(true);
    const goingLive = !isLive;
    const liveStatus = goingLive ? "1" : "0";
    const response = await apiUtil(
      "put",
      `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/questions/${props.question.id}/live/${liveStatus}`,
      { dispatch, navigate }
    );

    console.log(
      "goLive response:",
      response.status,
      response.message,
      response.data
    );
    console.log("Full response:", response); // ADD
    console.log("response.data:", response.data); // ADD
    console.log("isLive state:", isLive, "goingLive:", goingLive); // ADD

    setLoading(false);
    setError(response.error);
    setMessage(response.message);

    if (response.status === 200 && response.data?.isLive !== undefined) {
      const actuallyLive = response.data.isLive; // trust the API, not local state
      setIsLive(actuallyLive);

      if (actuallyLive) {
        // Broadcast full question to students
        socket.emit("setLiveQuestion", { lectureId, question: props.question });
        // Notify parent so it can track stats for this question
        props.onQuestionLive && props.onQuestionLive(props.question);
      } else {
        // Tell students the question is closed
        socket.emit("closeQuestion", {
          lectureId,
          questionId: props.question.id,
        });
        // Notify parent to clear stats
        props.onQuestionClose && props.onQuestionClose(props.question.id);
      }
    }

    console.log("setting it to:", goingLive);
  }

  return (
    <>
      {loading ? (
        <TailSpin visible={true} />
      ) : (
        props.view === "student" && (
          <div className="question-card-student">
            <Card>
              <Card.Header>{props.question.stem}</Card.Header>
              <Card.Body>
                <p>{props.question.type}</p>
                <Link to={`questions/${props.question.id}`}>
                  <Button className="editQuestionBtn">View Question</Button>
                </Link>
              </Card.Body>
            </Card>
          </div>
        )
      )}

      {loading ? (
        <TailSpin visible={true} />
      ) : (
        props.view === "teacher" && (
          <div className="question-card-teacher">
            <Card>
              <Card.Header>{props.question.stem}</Card.Header>
              <Card.Body>
                <p>{props.question.type}</p>

                {!sectionId && (
                  <Button
                    onClick={() => navigate(`questions/${props.question.id}`)}
                    className="editQuestionBtn"
                  >
                    Edit Question
                  </Button>
                )}

                {sectionId && props.lecturePublished && (
                  <div className="switch">
                    <label>
                      <span>Publish Question</span>
                      <Switch
                        onChange={changePublishState}
                        checked={published}
                      />
                    </label>
                  </div>
                )}

                {props.isLectureLive && (
                  <Button
                    className="btn-live"
                    onClick={goLive}
                    disabled={loading}
                  >
                    {isLive ? "End Live" : "Go Live"}
                  </Button>
                )}
              </Card.Body>
            </Card>
          </div>
        )
      )}
    </>
  );
}

export default QuestionCard;
