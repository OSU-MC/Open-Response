import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faBell,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const noticeRed = "#ea5b6a";
const noticeBlue = "#7bb0d0";
const noticeGreen = "#77dd77";

function Notice(props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: `${props.status == "error" ? noticeRed : props.status == "success" ? noticeGreen : noticeBlue}`,
          padding: "10px",
          borderRadius: "20px",
          justifyContent: "center",
          margin: "10px",
          maxWidth: "450px",
        }}
      >
        <div
          style={{
            marginRight: "10px",
          }}
        >
          <FontAwesomeIcon
            icon={
              props.status == "error"
                ? faCircleExclamation
                : props.status == "success"
                  ? faCheck
                  : faBell
            }
          />
        </div>
        <div
          style={{
            fontWeight: 600,
          }}
        >
          {" "}
          {props.message}
        </div>
      </div>
    </div>
  );
}

export default Notice;
