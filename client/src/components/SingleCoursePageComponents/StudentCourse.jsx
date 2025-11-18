import React, { useEffect, useState } from "react";

function StudentCourse(props) {
  return (
    <div>
      <h1>{props.course.name}</h1>
      <p>{props.course.description}</p>
      <p>this is being accessed by student</p>
    </div>
  );
}

export default StudentCourse;
