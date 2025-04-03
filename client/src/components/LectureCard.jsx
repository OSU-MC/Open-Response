import React from "react";
import { Button, Card } from "react-bootstrap";
import { Link } from 'react-router-dom';
import apiUtil from '../utils/apiUtil';

function LectureCard (props) {
    const handleDelete = async () => {
        try {
            console.log("courseId", props.course, "sectionId", props.section, "lectureId", props.lecture.id);
            const response = await apiUtil("delete", `courses/${props.course}/sections/${props.section}/lectures/${props.lecture.id}`);
            if (response.status === 200) {
                console.log("LectureForSection deleted successfully");
                // Optionally, refresh the list of lectures in the section
                props.onDelete && props.onDelete();
            } else {
                console.error("Error deleting LectureForSection:", response.message);
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