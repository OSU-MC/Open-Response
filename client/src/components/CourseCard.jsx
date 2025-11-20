import React from "react";
import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/CourseCard.css";

function CourseCard(props) {
  const truncateDescription = (description) => {
    if (description.length > 50) return description.substring(0, 45) + "...";
    return description;
  };

  return (
    /* Top section of course card - placeholder term X*/
    <div className="course-card">
      <div className="course-header">
        <h1>{props.course.name}</h1>
        <p>{truncateDescription(props.course.description)}</p>
      </div>

      {/* Bottom section of course card, placeholder registered number X*/}
      <p className="registered"> 0 registered </p>

      <a
        className="viewButton"
        href={
          props.role == "teacher"
            ? `/${props.course.id}/sections`
            : `/${props.course.id}`
        }
      >
        {" "}
        {/*string template, fills in courseID/sections*/}
        View
      </a>
    </div>
  );
}

export default CourseCard;
