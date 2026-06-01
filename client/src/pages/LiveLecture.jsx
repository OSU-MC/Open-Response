import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux"; // added
import Notice from "../components/Notice";
import useLectures from "../hooks/useLectures";
import useCourse from "../hooks/useCourse";
import useLectureQuestions from "../hooks/useLectureQuestions";
import SingleQuestionStudent from "../components/questions/SingleQuestionStudent";
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import io from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL || "ws://localhost:3002";

const socket = io(url);

function LiveLecture() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courseId, lectureId } = useParams();
  const [lectures, message, error, loading] = useLectures();
  const [course, role, Cmessage, Cerror, Cloading] = useCourse();
  const [lecture, lMessage, lError, lectureLoading, getLecture] =
    useLectureQuestions();

  // The current live question pushed from the socket — null means no active question
  const [socketQuestion, setSocketQuestion] = useState(null);

  // Track which questions have been closed: Set of questionIds
  const [closedQuestionIds, setClosedQuestionIds] = useState(new Set());

  // Keep closed questions visible on screen so students can review results
  const [closedQuestionsList, setClosedQuestionsList] = useState([]);

  // track responses by question ID
  const [questionResponses, setQuestionResponses] = useState({});

  // Track which questions the student has already answered: { [questionId]: true }
  const [answered, setAnswered] = useState({});

  useEffect(() => {
    // Join the lecture room as a student
    socket.emit("joinLecture", { lectureId });

    // Receive a live question pushed directly from the teacher
    socket.on("liveQuestion", ({ question }) => {
      console.log("liveQuestion received:", question); // student recieve logged
      setSocketQuestion(question || null);
      if (!question) {
        getLecture(); // re-fetch to get updated isLive state
      }
    });

    // Teacher closed a question — reveal results to student
    socket.on("questionClosed", ({ questionId }) => {
      setClosedQuestionIds((prev) => new Set([...prev, questionId]));
      // Move the current socket question to the closed list so it stays visible
      setSocketQuestion((prev) => {
        if (prev?.id === questionId) {
          setClosedQuestionsList((list) => {
            // Avoid duplicates
            if (list.find((q) => q.id === questionId)) return list;
            return [...list, prev];
          });
        }
        return null; // clear active question
      });
    });

    socket.on("questionRemoved", ({ questionId }) => {
      const qId = Number(questionId);
      setClosedQuestionsList((prev) =>
        prev.filter((q) => Number(q.id) !== qId)
      );
      setClosedQuestionIds((prev) => {
        const next = new Set(prev);
        next.delete(qId);
        next.delete(String(qId));
        return next;
      });
      setQuestionResponses((prev) => {
        const next = { ...prev };
        delete next[qId];
        delete next[String(qId)];
        return next;
      });
      setSocketQuestion(null);
    });

    // Legacy: teacher toggled something, re-fetch to stay in sync
    socket.on("questionUpdated", () => {
      getLecture();
    });

    return () => {
      socket.off("liveQuestion");
      socket.off("questionClosed");
      socket.off("questionUpdated");
      socket.off("endLive");
    };
  }, [lectureId, getLecture]);

  // Called after student successfully submits an answer
  const handleAnswerSubmitted = (question, isCorrect, response) => {
    console.log("closedQuestionIds at submit time:", [...closedQuestionIds]);
    console.log("question.id:", question.id);
    // Mark this question as answered locally so the UI updates
    setAnswered((prev) => ({ ...prev, [question.id]: true }));
    // store the response
    setQuestionResponses((prev) => ({ ...prev, [question.id]: response }));
    // Notify the socket server so the teacher sees updated stats
    socket.emit("submitAnswer", {
      lectureId,
      questionId: question.id,
      isCorrect,
    });
  };

  const liveQuestions = socketQuestion ? [socketQuestion] : [];

  const closedQuestions = lecture?.questions?.filter((q) => !q.isLive) || [];

  const breadcrumbs_object = [
    ["Courses", "/"],
    [course.name, `/${courseId}/sections`],
    [`Lectures`, null],
    [`Live`, null],
  ];

  return (
    <div className="LiveLecture">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px 20vh",
          backgroundColor: "var(--accent2)",
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          <Breadcrumbs breadcrumbs={breadcrumbs_object} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Link className="back-btn-lectures">
            <Button className="back-btn" onClick={() => navigate(-1)}>
              <div id="back-btn-image" />
            </Button>
          </Link>
          <h2>Live Lecture</h2>
        </div>
        <p
          style={{
            borderBottom: "2px solid var(--accent)",
            width: "100%",
            padding: "10px",
          }}
        >
          {`${lecture?.description ? lecture?.description : "This is an example lecture description."}`}
        </p>
      </div>

      <div
        className="live-lecture-content"
        style={{
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        {/* Closed question sidebar */}
        <div
          style={{
            width: "150px",
            height: "auto",
            marginLeft: "10vw",
            padding: "10px",
            backgroundColor: "var(--accent2)",
            borderRadius: "8px",
          }}
        >
          <h6 style={{ borderBottom: "1px solid var(--accent)" }}>
            Closed Questions
          </h6>
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              fontSize: "12px",
            }}
          >
            {closedQuestions?.length > 0 ? (
              closedQuestions.map((question) => (
                <li key={question.id} style={{ marginBottom: "8px" }}>
                  <a
                    href={`#question-${question.id}`}
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    Question {question.id} {question.isAnswered ? "✓" : "x"}
                  </a>
                </li>
              ))
            ) : (
              <p>No closed questions yet.</p>
            )}
          </ul>
        </div>

        {/* Main content area */}
        <div style={{ flexGrow: 1, padding: "0 20px" }}>
          {/* Closed questions — shown with results revealed */}
          {closedQuestionsList.map((question) => (
            <div
              key={question.id}
              id={`question-${question.id}`}
              style={{ marginBottom: "24px", opacity: 0.85 }}
            >
              <SingleQuestionStudent
                question={question}
                courseId={courseId}
                lectureId={lectureId}
                questionId={question.id}
                onAnswerSubmitted={handleAnswerSubmitted}
                isClosed={true}
                savedResponse={questionResponses[question.id]}
              />
            </div>
          ))}

          {/* Active live question */}
          {liveQuestions?.length > 0 ? (
            liveQuestions.map((question) => (
              <SingleQuestionStudent
                key={question.id}
                question={question}
                courseId={courseId}
                lectureId={lectureId}
                questionId={question.id}
                onAnswerSubmitted={handleAnswerSubmitted}
                isClosed={closedQuestionIds.has(question.id)}
              />
            ))
          ) : closedQuestionsList.length === 0 ? (
            <Notice message="Waiting for the teacher to post a question..." />
          ) : (
            <Notice message="Waiting for the next question..." />
          )}
        </div>
        <div style={{ width: "calc(150px + 10vw)" }} />
      </div>
    </div>
  );
}

export default LiveLecture;
