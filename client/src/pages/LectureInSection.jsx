import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import Notice from "../components/Notice";
import useLectureForSectionQuestions from "../hooks/useLectureForSectionQuestions";
import useLecturesInSection from "../hooks/useLecturesInSection";
import { Switch } from "@mui/material";
import QuestionCard from "../components/QuestionCard";
import { useEffect, useState } from "react";
import apiUtil from "../utils/apiUtil";
import { publishLectureInSection } from "../redux/actions";
import { useDispatch } from "react-redux";
import { Button, Card } from "react-bootstrap";
import io from "socket.io-client";

//URL : :courseId/sections/:sectionId/lectures/:lectureId

const url = import.meta.env.VITE_SOCKET_URL || "ws://localhost:3002";

const socket = io(url);

function LectureInSection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [questions, message, error, loading, reloadQuestions] =
    useLectureForSectionQuestions();
  const [lecturesInSection, LSmessage, LSerror, LSloading] =
    useLecturesInSection();
  const { courseId, lectureId, sectionId } = useParams();
  const [published, setPublished] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lecture, setLecture] = useState({});
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [errorPublish, setErrorPublish] = useState(false);
  const [messagePublish, setMessagePublish] = useState("");

  // Tracks response stats per question: { [questionId]: { total, correct, percentCorrect } }
  const [stats, setStats] = useState({});
  const [liveQuestionIds, setLiveQuestionIds] = useState(new Set());

  useEffect(() => {
    // Join the lecture room as teacher
    socket.emit("joinLecture", { lectureId });

    // Listen for response stats from students answering
    socket.on(
      "responseStats",
      ({ questionId, total, correct, percentCorrect }) => {
        setStats((prev) => ({
          ...prev,
          [questionId]: { total, correct, percentCorrect },
        }));
      }
    );

    return () => {
      socket.off("responseStats");
    };
  }, [lectureId]);

  useEffect(() => {
    if (lecturesInSection != null && lecture.id == null) {
      lecturesInSection.forEach((lecture) => {
        if (lecture.id == lectureId) {
          setPublished(lecture.published);
          setIsLive(lecture.isLive || false);
          setLecture(lecture);
        }
      });
    }
  }, [lecturesInSection]);

  // TODO: attach lecture publication to the slider
  const changePublishState = async () => {
    setLoadingPublish(true);
    const response = await apiUtil(
      "put",
      `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
      { dispatch: dispatch, navigate: navigate }
    );
    setErrorPublish(response.error);
    setMessagePublish(response.message);
    setLoadingPublish(false);

    if (response.status === 200) {
      dispatch(publishLectureInSection(sectionId, lectureId));
      setPublished(!published);
    }

    //remove all live questions from students screens if turned off
    if (questions.length > 0) {
      for (const question of questions) {
        const updateResponse = await apiUtil(
          "put",
          `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/questions/${question.id}/live/0`,
          { dispatch, navigate }
        );
        if (updateResponse.status === 200) {
          // update students screens
          socket.emit("setLiveQuestion", { lectureId, question: null });
        }
      }
    }
    reloadQuestions();
  };

  const changeLiveState = async () => {
    setLoadingPublish(true);
    const isLiveNew = !isLive;
    // const requestData = { isLive: isLiveNew, published: true };
    const liveStatus = isLiveNew ? "1" : "0";
    const response = await apiUtil(
      "put",
      `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/live/${liveStatus}`,
      { dispatch, navigate }
    );
    setErrorPublish(response.error);
    setMessagePublish(response.message);
    setLoadingPublish(false);

    if (response.status === 200) {
      setIsLive(isLiveNew);
      setLecture((prevLecture) => ({
        ...prevLecture,
        isLive: isLiveNew,
      }));

      // Only clear live questions when turning OFF
      if (!isLiveNew && questions.length > 0) {
        for (const question of questions) {
          await apiUtil(
            "put",
            `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/questions/${question.id}/live/0`,
            { dispatch, navigate }
          );
          socket.emit("setLiveQuestion", { lectureId, question: null });
        }
      }
      reloadQuestions();
    }
  };

  // Called from QuestionCard when teacher makes a single question live
  const handleQuestionLive = (question) => {
    socket.emit("setLiveQuestion", { lectureId, question });
    setLiveQuestionIds((prev) => new Set([...prev, question.id]));
  };

  // Called from QuestionCard when teacher closes a single question
  const handleQuestionClose = (questionId) => {
    socket.emit("closeQuestion", { lectureId, questionId });
    setLiveQuestionIds((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
    // Clear stats for this question locally
    setStats((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  return (
    <div className="lecture-page-container">
      <div className="lecture-header">
        <Link
          className="back-btn-lectures"
          to={`/${courseId}/sections/${sectionId}`}
        >
          <Button className="back-btn">
            <div id="back-btn-image" />
          </Button>
        </Link>
        <p className="lecture-subtitle">
          {lecture ? lecture.title : ""} Lecture Questions
        </p>
      </div>

      <hr className="lecture-hr"></hr>

      {loading ? (
        <TailSpin visible={true} />
      ) : message ? (
        <Notice error={error ? "error" : ""} message={message} />
      ) : (
        <div className="lecture-container">
          <div className="switch">
            <label className="lecture-publish-switch">
              <span>Publish Lecture</span>
              {loadingPublish ? (
                <TailSpin visible={true} />
              ) : (
                <Switch onChange={changePublishState} checked={published} />
              )}
            </label>

            <label className="lecture-live-switch">
              <span>Go Live</span>
              {loadingPublish ? (
                <TailSpin visible={true} />
              ) : (
                <Switch onChange={changeLiveState} checked={isLive} />
              )}
            </label>

            {messagePublish !== "" && (
              <Notice
                status={errorPublish ? "error" : ""}
                message={messagePublish}
              />
            )}
          </div>

          <div className="questions">
            {loading ? (
              <TailSpin visible={true} />
            ) : (
              questions.map((question) => {
                const questionStats = stats[question.id];
                return (
                  <div key={question.id}>
                    <QuestionCard
                      question={question}
                      view={"teacher"}
                      lecturePublished={published}
                      isLectureLive={isLive}
                      sectionId={sectionId}
                      onQuestionLive={handleQuestionLive}
                      onQuestionClose={handleQuestionClose}
                    />
                    {/* Live response stats — only show when question is live and stats exist */}
                    {liveQuestionIds.has(question.id) && questionStats && (
                      <div
                        className="question-stats"
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "var(--accent2)",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          fontSize: "14px",
                        }}
                      >
                        <span>
                          📊 Responses: <strong>{questionStats.total}</strong>
                        </span>
                        <span style={{ marginLeft: "16px" }}>
                          ✅ Correct: <strong>{questionStats.correct}</strong> (
                          {questionStats.percentCorrect}%)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LectureInSection;
