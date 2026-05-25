import PropTypes from "prop-types";
// import { Outlet } from "react-router-dom";

function Popup(props) {
  return (
    <div className="popup-background">
      <div className="popup-container">
        <div className="right-aligned">
          <button
            className="btn negative-btn"
            onClick={(e) => {
              e.preventDefault();
              props.close();
            }}
          >
            x
          </button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

Popup.propTypes = {
  close: PropTypes.func.isRequired,
  children: PropTypes.PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default Popup;
