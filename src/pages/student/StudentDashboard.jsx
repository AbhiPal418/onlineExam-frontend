import StudentSidebar from "../../components/StudentSidebar";
import "../../styles/StudentDashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AfterLogout from "../../components/AfterLogout";



function StudentDashboard() {
    // console.log("hello world")


    const navigate = useNavigate();

    const [attemptedExams, setAttemptedExams] = useState([]);
    const [exams, setExams] = useState([]);
    const [user, setUser] = useState({});

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const fetchStudentData = async () => {
        try {
            const [userResponse, attemptedResponse] = await Promise.all([
                axios.get("/api/v1/student/dashboard"),
                axios.get("/api/v1/student/attempted-exams")
            ]);

            setUser(userResponse.data.data);
            setAttemptedExams(attemptedResponse.data.data);
            setIsAuthenticated(true);

        } catch (error) {
            if (error.response?.status === 401) {
                setIsAuthenticated(false);
            }

            console.error("Error fetching student data:", error);
            throw error;
        }
    };

    const getAllExams = async () => {
        try {
            const response = await axios.get("/api/v1/student/all-exams");
            setExams(response.data.data);

        } catch (error) {
            console.error("Error fetching all exams:", error);
            throw error;
        }
    };

    useEffect(() => {

        const loadDashboard = async () => {
            try {
                setIsLoading(true);

                await Promise.all([
                    fetchStudentData(),
                    getAllExams()
                ]);

            } catch (error) {
                console.error("Dashboard loading failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();

    }, []);

    const handleStartExam = (examId, exam) => {

        navigate(`/student/${user.username}/attend-exam/${examId}`, {
            state: {
                exam: exam,
                student: user.username
            }
        });

    };


    if (isLoading) {
        return <div>Loading dashboard...</div>;
    }

    if (!isAuthenticated) {
        return <AfterLogout role="student" />;
    }

    // Your actual dashboard JSX below


    return (
        <div className="student-layout">

            <StudentSidebar />

            <main className="student-main">


                <header className="dashboard-header">

                    <div>
                        <h1>Welcome, {user.fullName} </h1>
                    </div>

                    <div className="header-profile" >
                        <Link to={`/student/${user.username}/profile`}>
                            <div className="profile-avatar-dashboard">
                                {user.fullName?.[0]}
                            </div>
                        </Link>
                    </div>

                </header>


                {/* Statistics */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <div>
                            <p>Available Exams</p>
                            <h2>{exams.length}</h2>
                        </div>
                    </div>


                    <div className="stat-card">

                        <div>
                            <p>Attempted</p>
                            <h2>{attemptedExams.length}</h2>
                        </div>
                    </div>

                    <div className="stat-card">

                        <div>
                            <p>Created Exams</p>
                            <h2>{user.createdExams?.length}</h2>
                        </div>
                    </div>

                </section>


                {/* Available Exams */}

                <section className="dashboard-section">

                    <div className="section-header">
                        <div>
                            <h2>Available Exams</h2>
                            <p>Exams waiting for you</p>
                        </div>

                        <Link to={`/student/${user.username}/available-exams`}>
                            <button className="view-all-btn">
                                View All →
                            </button>
                        </Link>
                    </div>


                    <div className="exam-grid">

                        {exams?.map((exam, index) => (

                            <div className="exam-card-dashboard" key={exam._id}>

                                <div className="available-exam-top">

                                    <h5>{exam.title}</h5>
                                    <span className={`exam-status ${exam.status.toLowerCase()}`} >
                                        {exam.status}
                                    </span>
                                </div>
                                <p className="teacher-name">
                                    Created By <strong>{exam.createdBy.fullName}</strong>
                                </p>

                                <div className="exam-details-dashboard">

                                    <div>
                                        <span>{exam.totalQuestion} Questions </span>
                                    </div>

                                    <div>
                                        <span>Time {exam.timeLimit} min</span>
                                    </div>
                                </div>
                                <div className="exam-details-dashboard">
                                    <div>
                                        <span>{exam.questions.length * 4} Marks</span>
                                    </div>
                                    <div>
                                        <span>Total Attempts {exam.totalAttempts}</span>
                                    </div>


                                </div>

                                <button className="start-exam-btn" onClick={() => handleStartExam(exam._id, exam)}>
                                    Start Exam →
                                </button>

                            </div>

                        ))}

                    </div>

                </section>


                {/* Recent Performance */}

                <section className="dashboard-section">

                    <div className="section-header">
                        <div>
                            <h2>Recent Performance</h2>
                            <p>Your latest examination results</p>
                        </div>
                    </div>

                    <div className="performance-card">

                        {
                            attemptedExams?.map((exam, index) => (
                                <div id={exam._id} className="performance-item" key={exam._id}>
                                    <div>
                                        <h3>{exam.title}</h3>
                                        <p>{new Date(exam.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        }

                    </div>

                </section>

            </main>

        </div>
    );

}

export default StudentDashboard;