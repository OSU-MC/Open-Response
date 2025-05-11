import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import apiUtil from '../utils/apiUtil';

/*
TODO: rerun the requst for the lecture in section again after lecture add
TODO: add a method to create a new lecture local to the section
*/



function AddLectureToSection({ show, handleClose, courseId, sectionId }) {
    const [lectures, setLectures] = useState([]);
    const [selectedLectureId, setSelectedLectureId] = useState(null);
    const [selectedAttendanceMethod, setSelectedAttendanceMethod] = useState(''); // Added state for attendance method
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchLectures() {
            try {
                const response = await apiUtil("get", `courses/${courseId}/lectures`);
                if (response.status === 200 && Array.isArray(response.data.lectures)) {
                    setLectures(response.data.lectures); // Ensure we are setting an array
                } else {
                    console.error('Unexpected response format:', response.data);
                    setLectures([]); // Fallback to an empty array if the response is not as expected
                }
            } catch (error) {
                console.error('Error fetching lectures:', error);
                setLectures([]); // Fallback to an empty array in case of an error
            }
        }

        if (show) {
            fetchLectures();
        }
    }, [show, courseId]);

    const handleSave = async () => {
        if (!selectedLectureId || !selectedAttendanceMethod) return;

        setLoading(true);
        try {
            const response = await apiUtil(
                "post",
                `courses/${courseId}/sections/${sectionId}/lectures`,
                null,
                { 
                    lectureId: selectedLectureId, 
                    attendanceMethod: selectedAttendanceMethod
                },
                null
            );
            if (response.status === 200) {
                handleClose();
            } else {
                console.error('Error adding lecture to section:', response.message);
            }
        } catch (error) {
            console.error('Error adding lecture to section:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Lecture to Section</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="lectureSelect">
                        <Form.Label>Select a Lecture</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedLectureId || ''}
                            onChange={(e) => setSelectedLectureId(Number(e.target.value))}
                        >
                            <option value="" disabled>
                                -- Select a Lecture --
                            </option>
                            {Array.isArray(lectures) && lectures.map((lecture) => (
                                <option key={lecture.id} value={lecture.id}>
                                    {lecture.title}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="attendanceSelect">
                        <Form.Label>Attendance Method</Form.Label>
                        <Form.Control 
                            as="select"
                            value={selectedAttendanceMethod || ''}
                            onChange={(e) => setSelectedAttendanceMethod(e.target.value)}
                        >
                            <option value="" disabled>
                                -- Select a Method --
                            </option>
                            <option value="join">Join</option>
                            <option value="joinBy">Join By</option>
                            <option value="requiredQuestions">Required Questions</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={loading || !selectedLectureId || !selectedAttendanceMethod}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddLectureToSection;
