import React from "react";
import Notice from "./Notice";

function StudentListItem(props) {
  return (
    <li className="studentrow">
      {props.student.User.firstName} {props.student.User.lastName}
      <span className="studentemail">{props.student.User.email}</span>
    </li>
  );
}

export default StudentListItem;
