import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from 'react-bootstrap';
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { borderRadius, fontFamily, fontStyle, minHeight } from '@mui/system'
import "../styles/home.css"

function Home() {
    return(
       <div id="home">
           <div className="section">
               <p className="homeHeader">Welcome to Open Response</p>
               <p>Open-Source Classroom Polling Software</p>
           </div>

           <div className="infoContainer">
               <div className="infoConnector"></div>
               <div className="infoBox leftBox">
                   <img src="classroom.png"></img>
                   <p className="infoText">Create courses and manage lectures easily.</p>
               </div>
               <div className="infoBox rightBox">
                   <img src="goal.png"></img>
                   <p className="infoText">Track student progress and manage grades.</p>
               </div>
               <div className="infoBox leftBox">
                   <img src="lms.png"></img>
                   <p className="infoText">Seamless integration with educational platforms.</p>
               </div>
               <div className="infoBox rightBox">
                   <img src="graph.png"></img>
                   <p className="infoText">Boost student engagement with interactive polls.</p>
               </div>
               <div className="infoBox leftBox">
                   <img src="school.png"></img>
                   <p className="infoText">Highly customizable and free to use.</p>
               </div>
           </div>
       </div>
    )
}

export default Home