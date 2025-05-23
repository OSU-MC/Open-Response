import React from "react";
import { Button, Card } from "react-bootstrap";
import { Link } from 'react-router-dom';
import apiUtil from '../utils/apiUtil';

function LectureCard (props) {
    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this lecture?");
        if (!confirmDelete) return; // Exit if the user cancels the confirmation

        try {
            // for delete on courseid/section/sectionId
            if(props.section) {
            const response = await apiUtil("delete", `courses/${props.course}/sections/${props.section}/lectures/${props.lecture.id}`);
            if (response.status === 200) {
                props.onDelete && props.onDelete();
            } else {
                console.error("Error deleting LectureForSection:", response.message);
            }}
            // for delete on courseId/lectures
            else {
                const response = await apiUtil("delete", `courses/${props.course}/lectures/${props.lecture.id}`);
                if (response.status === 204) {
                    props.onDelete && props.onDelete();
                } else {
                    console.error("Error deleting Lecture:", response.message);
                }
            }
        } catch (error) {
            console.error("Error deleting LectureForSection:", error);
        }
    };

    return (
        <Card className="lecture-card"> 
            <Card.Header>{props.lecture.title}</Card.Header>
            <Card.Body>
                <p>{props.lecture.description}</p>

                {props.view === "student" &&
                    <>
                        <Link className="viewLectureBtn" to={`${props.lecture.id}`}>
                            <Button>
                                Join Lecture
                            </Button>
                        </Link>
                    </>
                }

                {props.view === "teacher" &&
                    <>
                        <Link className="viewLectureBtn" to={props.section ? `lectures/${props.lecture.id}` : `${props.lecture.id}`}>
                            <Button className="viewLectureBtn">
                                {props.section ? `View Lecture` : `Edit Lecture`}
                            </Button>
                        </Link>
                        <Link classname="viewPastLectureBtn" to={props.section ? `lectures/past/${props.lecture.id}` : `${props.lecture.id}`}>
                            <Button className="viewPastLectureBtn">
                                {props.section ? `View Past Lecture` : `Edit Lecture`}
                            </Button>
                        </Link>
                        <Button variant="danger" onClick={handleDelete} className="deleteLectureBtn">
                            Delete
                        </Button>
                    </>
                }
            </Card.Body>
        </Card>
    );
}

export default LectureCard;