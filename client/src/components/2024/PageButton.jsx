import React from "react";
import "../../styles/PageButton.css";

/**********************************************************************************************************************
    --PageButton Component--

	This is a component that adds a button to the DOM that when clicked, loads up another page inside a centered modal.
		Requires proper css styling to work properly.
			--I believe this will be implemented in a way that the css is loaded wheneber this component is used

    PROPS:
    	className: as expected with HTML elements, provides a class for css styling the button
    	children: as expected with HTML elements, provides children for the added button
    	newPage: The page (as a react component) to load inside the modal


**********************************************************************************************************************/

export default class PageButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewForm: false,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({
      viewForm: !this.state.viewForm,
    });
  }

  render() {
    return (
      <>
        <button onClick={this.handleClick} className={this.props.className}>
          {this.props.children}
        </button>

        {this.state.viewForm && (
          <>
            <div className="backdrop" />
            <div className="centeredModal">
              <div className="modalContents">
                <button onClick={this.handleClick} className="xButton">
                  Close
                </button>
                {this.props.newPage}
              </div>
            </div>
          </>
        )}
      </>
    );
  }
}
