import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import apiUtil from "../utils/apiUtil";

/*
TODO: rerun the requst for the lecture in section again after lecture add
TODO: add a method to create a new lecture local to the section
*/

function AddLectureToSection({
  show,
  handleClose,
  courseId,
  sectionId,
  onUpdate,
}) {
  const [lectures, setLectures] = useState([]);
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [selectedAttendanceMethod, setSelectedAttendanceMethod] = useState(""); // Added state for attendance method
  const [lectureWeight, setLectureWeight] = useState(""); // New state for lecture weight
  const [loading, setLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false); // Toggles between "Select" and "Create"
  const [newLectureTitle, setNewLectureTitle] = useState(""); // Stores the new name
  const [newLectureDescription, setNewLectureDescription] = useState("");

  useEffect(() => {
    async function fetchLectures() {
      try {
        const response = await apiUtil("get", `courses/${courseId}/lectures`);
        if (response.status === 200 && Array.isArray(response.data.lectures)) {
          setLectures(response.data.lectures); // Ensure we are setting an array
        } else {
          console.error("Unexpected response format:", response.data);
          setLectures([]); // Fallback to an empty array if the response is not as expected
        }
      } catch (error) {
        console.error("Error fetching lectures:", error);
        setLectures([]); // Fallback to an empty array in case of an error
      }
    }

    if (show) {
      fetchLectures();
    }
  }, [show, courseId]);

  const handleSave = async () => {
    const isIdValid = !isCreatingNew && selectedLectureId;
    const isTitleValid = isCreatingNew && newLectureTitle.trim() !== "";

    if (!(isIdValid || isTitleValid)) {
      alert(
        isCreatingNew
          ? "Please enter a lecture title"
          : "Please select a lecture"
      );
      return;
    }

    if (!selectedAttendanceMethod) {
      alert("Please select an attendance method");
      return;
    }

    if (lectureWeight === "" || parseFloat(lectureWeight) < 0) {
      alert("Please enter a valid lecture weight (must be 0 or greater)");
      return;
    }

    setLoading(true);
    try {
      let lectureIdToLink = selectedLectureId;

      if (isCreatingNew) {
        console.log("Creating new lecture with title:", newLectureTitle);
        const createRes = await apiUtil(
          "post",
          `courses/${courseId}/lectures`,
          null,
          {
            title: newLectureTitle,
            description: newLectureDescription,
          }
        );

        console.log("Create response:", createRes);
        console.log("Create response data:", createRes.data);

        if (createRes.status === 200 || createRes.status === 201) {
          lectureIdToLink = createRes.data.id;
        } else {
          throw new Error("Failed to create new lecture");
        }
      }

      const response = await apiUtil(
        "post",
        `courses/${courseId}/sections/${sectionId}/lectures`,
        null,
        {
          lectureId: lectureIdToLink,
          attendanceMethod: selectedAttendanceMethod,
          weight: parseFloat(lectureWeight),
        },
        null
      );
      if (response.status === 200 || response.status === 201) {
        if (onUpdate) onUpdate();
        handleClose();
      } else {
        console.error("Error adding lecture to section:", response.message);
      }
    } catch (error) {
      console.error("Error adding lecture to section:", error);
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
          <Form.Group className="mb-3" controlId="toggleCreate">
            <Form.Check
              type="switch"
              label="Create a brand new lecture?"
              checked={isCreatingNew}
              onChange={() => setIsCreatingNew(!isCreatingNew)}
            />
          </Form.Group>
          {isCreatingNew ? (
            <>
              <Form.Group controlId="newLectureTitle" className="mb-3">
                <Form.Label>New Lecture Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter lecture title (e.g. Intro to Databases)"
                  value={newLectureTitle}
                  onChange={(e) => setNewLectureTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="newLectureDescription" className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Enter lecture description"
                  value={newLectureDescription}
                  onChange={(e) => setNewLectureDescription(e.target.value)}
                />
              </Form.Group>
            </>
          ) : (
            <Form.Group controlId="lectureSelect" className="mb-3">
              <Form.Label>Select an Existing Lecture</Form.Label>
              <Form.Control
                as="select"
                value={selectedLectureId || ""}
                onChange={(e) => setSelectedLectureId(Number(e.target.value))}
              >
                <option value="" disabled>
                  -- Select a Lecture --
                </option>
                {Array.isArray(lectures) &&
                  lectures.map((lecture) => (
                    <option key={lecture.id} value={lecture.id}>
                      {lecture.title}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
          )}

          <Form.Group controlId="attendanceSelect" className="mb-3">
            <Form.Label>Attendance Method</Form.Label>
            <Form.Control
              as="select"
              value={selectedAttendanceMethod || ""}
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

          <Form.Group controlId="lectureWeight" className="mb-3">
            <Form.Label>Lecture Weight</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="any"
              value={lectureWeight}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val))
                  setLectureWeight(val);
              }}
              placeholder="Enter lecture weight"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={
            loading ||
            (!isCreatingNew && !selectedLectureId) ||
            (isCreatingNew && !newLectureTitle) ||
            !selectedAttendanceMethod ||
            lectureWeight === ""
          }
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddLectureToSection;
