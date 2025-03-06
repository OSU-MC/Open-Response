import React from "react";
import { Button, Card } from "react-bootstrap";
import { Link } from 'react-router-dom';
import '../styles/SectionCard.css'

function SectionCard (props) { 
    return (<>
        <div className="section-card">
            <Card>
                <Card.Header>Section # {props.section.number}</Card.Header>
                <Card.Body>
                    <div>Join Code: {props.section.joinCode}</div>
                    <Link to={`${props.section.id}`}> {/* relative path allows us to just go to the section id, regardless of the other preceding routing */}
                        <Button>
                            {props.view == 'roster' ? 'View students in section' : 'View Section'}
                        </Button>
                    </Link>
                </Card.Body>
            </Card>
        </div>
    </>)
}

export default SectionCard;