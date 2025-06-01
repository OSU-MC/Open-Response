import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import "../../styles/Sections.css";

const Breadcrumbs = ({ breadcrumbs }) => {
  return (
    <div className="breadcrumbs">
      {breadcrumbs.map(([label, link], index) => (
        <React.Fragment key={index}>
          {/* Render a Link for breadcrumb items with a "link" property */}
          {link ? (
            <Link to={link} className="no-link-style">
              {label}
            </Link>
          ) : (
            // For breadcrumbs without a link (null 'link' value), render plain text
            <span className="no-link-style">{label}</span>
          )}
          {/* Add the separator except for the last item */}
          {index < breadcrumbs.length - 1 && ' > '}
        </React.Fragment>
      ))}
    </div>
  );
};

// PropTypes for type safety
Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.array).isRequired,
};

export default Breadcrumbs;

/*
Create an object that holds ["text to diapay", 'link to destination' ]
    const breadcrumbs = [
        ['Courses', '/'],
        [courseName, `/courses/${courseId}`],
        ['Lecture 101', null]  // 'null' will make it a non-clickable breadcrumb
    ];
Call in react component like this
    <Breadcrumbs breadcrumbs={breadcrumbs} />

This generates
    Courses > Main Course   
*/