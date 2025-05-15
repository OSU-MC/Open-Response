import { Route, Routes, Navigate, Outlet } from "react-router-dom";

/*
  Page Imports
*/
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import ConfirmationCodePasswordRequest from "./pages/ConfirmationCodePassword";
import ResetPasswordForLoginUser from "./pages/ResetPassword";
import Confirm from "./pages/Confirm";
import Landing from "./pages/Landing";
import Course from "./pages/Course";
import Lectures from "./pages/Lectures";
import Lecture from "./pages/Lecture";
import Sections from "./pages/Sections";
import Section from "./pages/Section";
import LectureInSection from "./pages/LectureInSection";
import Questions from "./pages/Questions";
import CreateQuestion from "./pages/CreateQuestion";
import Roster from "./pages/Roster";
import Enrollments from "./pages/Enrollments";
import SingleCoursePage from "./pages/SingleCoursePage";
import AddCourse from "./pages/AddCourse";
import AddLecture from "./pages/AddLecture";
import Home from "./pages/Home";
import SingleQuestion from "./pages/SingleQuestion";
import Navigation from "./components/nav/Navigation";
import useAuth from "./hooks/useAuth";
import { TailSpin } from "react-loader-spinner";
import Grades from "./pages/Grades";
import LiveLecture from "./pages/LiveLecture";

function App() {
	const [loggedIn, message, error, loading] = useAuth();

	return (
		<>
			{loading === true ? (
				<TailSpin visible={true} />
			) : (
				<Routes>
					{/* There are only 4 accessible pages for users who are not logged in:
            - home
            - create account
            - login
            - password reset
          */}

					<Route element={<Navigation loggedIn={loggedIn}></Navigation>}>
						<Route path='/home' element={<Home />} />
						<Route element={loggedIn ? <Navigate to='/' /> : <Outlet />}>
							<Route path='/login' element={<Login />} />
							<Route path='/create' element={<Signup />} />{" "}
							{/* redirects to landing page if a user is logged in already */}
							<Route
								path='/reset'
								element={<ConfirmationCodePasswordRequest />}
							/>{" "}
							{/* redirects to landing page if a user is logged in already */}
							<Route
								path='/reset/password'
								element={<ResetPasswordForLoginUser />}
							/>
						</Route>

						{/* Routes requiring user to be logged in */}
						{/* All routes below require a user be logged in */}
						<Route element={loggedIn ? <Outlet /> : <Navigate to='/login' />}>
							{" "}
							{/* Redirect to login if not logged in*/}
							{/* General routes */}
							<Route path='/' element={<Landing />} />
							<Route path='/login' element={<Navigate to='/' />} />
							<Route path='/profile' element={<Profile />} />
							<Route path='/confirm' element={<Confirm />} />
							<Route path='/createcourse' element={<AddCourse />} />
							{/* Course-related routes */}
							<Route path='/:courseId'>
								<Route path='' element={<SingleCoursePage />} />
								<Route path='questions' element={<Outlet />}>
									<Route path='' element={<Questions />} />
									<Route path=':questionId' element={<SingleQuestion />} />
									<Route path='add' element={<CreateQuestion />} />
								</Route>
								<Route path='live/:lectureId' element={<LiveLecture />} />
								<Route path='lectures' element={<Outlet />}>
									<Route path='' element={<Lectures />} />
									<Route path=':lectureId' element={<Outlet />}>
										<Route path='' element={<Lecture />} />
										<Route path='questions' element={<Outlet />}>
											<Route path='' element={<Questions />} />
											<Route path='add' element={<CreateQuestion />} />
											<Route path=':questionId' element={<SingleQuestion />} />
										</Route>
									</Route>
								</Route>
								<Route path='sections' element={<Outlet />}>
									<Route path='' element={<Sections />} />
									<Route path=':sectionId' element={<Outlet />}>
										<Route path='' element={<Section />} />
										<Route path='grades' element={<Grades />} /> {/* Updated route */}
										<Route
											path='lectures/:lectureId'
											element={<LectureInSection />}
										/>
									</Route>
								</Route>
								<Route path='roster' element={<Outlet />}>
									<Route path='' element={<Roster />} />
									<Route path=':sectionId' element={<Enrollments />} />
								</Route>
								<Route path='createlecture' element={<AddLecture />} />
								{/* TODO: the remainder of the nested routes should go here */}
							</Route>
						</Route>
					</Route>
				</Routes>
			)}
		</>
	);
}

export default App;
