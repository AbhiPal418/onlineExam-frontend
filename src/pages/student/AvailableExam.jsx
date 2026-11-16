import { useState } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import "../../styles/AvailableExams.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import AfterLogout from "../../components/AfterLogout";


function AvailableExams() {


    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    const [user, setUser] = useState({});
    const [search, setSearch] = useState("");

    const [userLoading, setUserLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const username = user.username;


    // Fetch student information
    const fetchStudentData = async () => {
        try {
            const response = await axios.get(
                "/api/v1/student/dashboard"
            );

            setUser(response.data.data);
            setIsAuthenticated(true);

        } catch (error) {
            console.error("Error fetching student data:", error);

            if (error.response?.status === 401) {
                setIsAuthenticated(false);
            }

        } finally {
            setUserLoading(false);
        }
    };


    // Fetch all exams
    const getAllExams = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                "/api/v1/student/all-exams"
            );

            setExams(response.data.data || []);

        } catch (error) {
            console.error("Error fetching exams:", error);

        } finally {
            setLoading(false);
        }
    };


    // Search exams
    const searchExamsA = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                "/api/v1/student/search-exams",
                {
                    params: {
                        query: search.trim()
                    }
                }
            );

            setExams(response.data.data || []);

        } catch (error) {
            console.error("Error searching exams:", error);

        } finally {
            setLoading(false);
        }
    };


    // Fetch student information on mount
    useEffect(() => {
        fetchStudentData();
    }, []);


    // Search and fetch exams only after authentication
    useEffect(() => {

        // Wait until authentication check finishes
        if (userLoading) return;

        // Don't fetch exams if student is not authenticated
        if (!isAuthenticated) return;

        const delay = setTimeout(() => {

            if (search.trim() === "") {
                getAllExams();
            } else {
                searchExamsA();
            }

        }, 400);

        return () => clearTimeout(delay);

    }, [search, userLoading, isAuthenticated]);


    // Handle starting an exam
    const handleStartExam = (examId, exam) => {

        navigate(`/student/${username}/attend-exam/${examId}`, {
            state: {
                exam: exam,
                student: username
            }
        });

    };


    // Sidebar responsiveness
    useEffect(() => {

        const mediaQuery = window.matchMedia(
            "(max-width: 768px)"
        );

        const handleResize = (event) => {
            if (!event.matches) {
                setIsSidebarOpen(false);
            }
        };

        mediaQuery.addEventListener("change", handleResize);

        return () => {
            mediaQuery.removeEventListener("change", handleResize);
        };

    }, []);


    // Loading screen
    if (userLoading) {
        return <div className="loader">Loading...</div>;
    }


    // Authentication check
    if (!isAuthenticated) {
        return <AfterLogout role="student" />;
    }


    // Your dashboard JSX below

    return (
        <div className="available-layout">

            <StudentSidebar />

            <main className="available-main">

                <div className="available-header">
                    <div>
                        <h1>{user.fullName} here is your Available Exams</h1>
                    </div>

                    <div className="available-profile">

                        <Link to={`/student/${user.username}/profile`}>
                            <div className="available-avatar">
                                {user.fullName?.[0]}
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Search */}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        searchExamsA();
                    }}
                >
                    <div className="exam-search-container">
                        <input
                            className="exam-search"
                            type="text"
                            placeholder="Search exams..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {/* <button type="submit"
                            className="exam-search-btn"
                        >
                            Search
                        </button> */}
                    </div>
                </form>
                {/* Exams */}

                {
                    loading ? (<div className="loader">
                        Loading...
                    </div>) : (
                        <div>
                            {
                                exams.length > 0 ? (
                                    (<div className="available-exam-grid">
                                        {exams.map((exam) => (
                                            <div className="available-exam-card" key={exam._id}>
                                                <div className="available-exam-top">

                                                    <h5>{exam.title}</h5>
                                                    <span className={`exam-status ${exam.status.toLowerCase()}`} >
                                                        {exam.status}
                                                    </span>
                                                </div>
                                                <p className="available-teacher">
                                                    Created by <strong>{exam.createdBy.fullName}</strong>
                                                </p>

                                                <div className="available-exam-info">
                                                    <div>
                                                        <span>{exam.totalQuestion} Questions</span>

                                                    </div>

                                                    <div>
                                                        <span>Time {exam.timeLimit} min</span>

                                                    </div>

                                                    <div>
                                                        <span>{exam.questions.length * 4} Marks</span>

                                                    </div>
                                                </div>

                                                <button className="available-start-btn" onClick={() => handleStartExam(exam._id, exam)}>
                                                    Start Exam →
                                                </button>

                                            </div>
                                        ))}
                                    </div>)
                                ) : (<p className="not-found">No Available Exam</p>)
                            }
                        </div>
                    )

                }



            </main>

        </div>
    );
}

export default AvailableExams;