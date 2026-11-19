import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
    useLocation,
    Link
} from "react-router-dom";

import axios from "axios";
import StudentSidebar from "../../components/StudentSidebar";
import AfterLogout from "../../components/AfterLogout";
import "../../styles/AttendExam.css";


function AttendExam() {

    const navigate = useNavigate();
    const location = useLocation();

    const { examId, username } = useParams();

    // Exam data passed from Available Exams page
    const exam = location.state?.exam;
    const [isLoading,setIsLoading] = useState(false);
    // Use URL username as fallback
    // const student = location.state?.student || username;
    const [student,setStudent]= useState({});
    const fetchUsername = async()=>{
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/v1/student/dashboard`)
            setStudent(response.data.data)
            setIsLoading(false)
        } catch (error) {
            console.error("Error fetching user name ",error)
        }
    }
    
    useEffect(()=>{
        fetchUsername();
    },[])

    // Component states
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    if(isLoading){
        return(
            <div className="loading-data">
                <p>Loading.....</p>
            </div>
        )
    }
    // If user information is unavailable
    if (!student && !isLoading) {
        return <AfterLogout role="student" />;
    }


    // If exam information is unavailable
    if (!exam) {
        return (
            <div className="deactivated-exam">
                <div className="deactivated-card">

                    <h2>Exam Information Unavailable</h2>

                    <p>
                        Exam details could not be loaded.
                        Please return to the available exams page
                        and select your examination again.
                    </p>

                    <Link
                        to={`/student/${student.username}/available-exams`}
                        className="deactivated-btn"
                    >
                        Back to Available Exams
                    </Link>

                </div>
            </div>
        );
    }


    // Check whether the exam is deactivated
    if (exam.status === "Deactivated") {

        return (
            <div className="deactivated-exam">

                <div className="deactivated-card">

                    

                    <h2>Exam Unavailable</h2>

                    <p>
                        Sorry! This exam is currently inactive.
                        The teacher has deactivated this examination,
                        so you cannot attend it right now.
                    </p>

                    <Link
                        to={`/student/${student.username}/dashboard`}
                        className="deactivated-btn"
                    >
                        Back to Dashboard
                    </Link>

                    <span className="deactivated-footer">
                        Please contact your teacher for more information.
                    </span>

                </div>

            </div>
        );
    }


    // Handle exam password verification
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (isLoading) return;

        setError("");

        // Validate password
        if (!password.trim()) {
            setError("Please enter the exam password.");
            return;
        }

        try {

            setIsLoading(true);

            const response = await axios.post(
                `/api/v1/student/attend-exam/${examId}`,
                {
                    password: password.trim()
                },
                {
                    withCredentials: true
                }
            );


            if (response.data.success) {

                navigate(`/student/exam/${examId}`, {
                    state: {
                        exam: response.data.data,
                        student: student.username
                    }
                });

            }

        } catch (error) {

            console.error(
                "Error verifying exam password:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to verify the exam password. Please try again."
            );

        } finally {

            setIsLoading(false);

        }

    };


    return (

        <div className="attend-layout">

            <StudentSidebar />

            <main className="attend-main">

                <div className="attend-container">

                    <div className="attend-card">

                        {/* Page Heading */}

                        <h1>Enter Exam Password</h1>

                        <p className="attend-description">
                            This examination is password protected.
                            Enter the password provided by your teacher
                            to continue.
                        </p>


                        {/* Exam Information */}

                        <div className="exam-preview">

                            <div>

                                <h3>{exam.title}</h3>

                                <p>
                                    {exam.questions?.length || exam.totalQuestion} Questions
                                    {" "}•{" "}
                                    {exam.timeLimit} Minutes
                                </p>

                            </div>

                        </div>


                        {/* Password Form */}

                        <form onSubmit={handleSubmit}>

                            <div className="password-group">

                                <label htmlFor="exam-password">
                                    Exam Password
                                </label>

                                <input
                                    id="exam-password"
                                    type="password"
                                    placeholder="Enter exam password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    disabled={isLoading}
                                    autoComplete="off"
                                    required
                                />


                                {error && (

                                    <p className="password-error">
                                        {error}
                                    </p>

                                )}

                            </div>


                            <button
                                type="submit"
                                className="verify-exam-btn"
                                disabled={isLoading}
                            >

                                {isLoading
                                    ? "Verifying Password..."
                                    : "Verify & Start Exam →"
                                }

                            </button>

                        </form>


                        {/* Back Navigation */}

                        <button
                            type="button"
                            className="back-exams-btn"
                            onClick={() => navigate(
                                `/student/${student}/available-exams`
                            )}
                            disabled={isLoading}
                        >
                            ← Back to Available Exams
                        </button>

                    </div>

                </div>

            </main>

        </div>

    );

}

export default AttendExam;
