import { Link } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/TeacherDashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";

import { useCallback } from "react";
import AfterLogout from "../../components/AfterLogout";

function TeacherDashboard() {


    // ---------------- STATES ----------------

    const [recentExams, setRecentExams] = useState([]);

    const [teacher, setTeacher] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    // loading | authenticated | unauthenticated
    const [authStatus, setAuthStatus] = useState("loading");

    const [totalAttemptInExam, setTotalAttemptInExams] = useState(0);

    const [activeExams, setActivExams] = useState(0);

    const [dashboardError, setDashboardError] = useState("");


    // ---------------- FETCH TEACHER DATA ----------------

    const fetchTeachserData = useCallback(async () => {

        try {

            // Fetch all required dashboard information together
            const [
                teacherResponse,
                attemptsResponse,
                activeExamsResponse
            ] = await Promise.all([

                axios.get("/api/v1/teacher/dashboard"),

                axios.get("/api/v1/teacher/total-attempt-in-exams"),

                axios.get("/api/v1/teacher/active-exams")

            ]);

            setTeacher(teacherResponse.data.data);

            setTotalAttemptInExams(
                attemptsResponse.data.data || 0
            );

            setActivExams(
                activeExamsResponse.data.data?.length || 0
            );

            setAuthStatus("authenticated");

            return true;

        } catch (error) {

            console.error("Error fetching teacher data:", error);

            if (error.response?.status === 401) {

                setTeacher(null);
                setAuthStatus("unauthenticated");

                return false;
            }

            throw error;
        }

    }, []);


    // ---------------- FETCH CREATED EXAMS ----------------

    const fetchCreatedExams = useCallback(async () => {

        try {

            const response = await axios.get(
                "/api/v1/teacher/created-exams"
            );

            setRecentExams(response.data.data || []);

        } catch (error) {

            console.error("Error fetching exam data:", error);

            if (error.response?.status === 401) {
                setTeacher(null);
                setAuthStatus("unauthenticated");
            }

            throw error;
        }

    }, []);


    // ---------------- TOTAL ATTEMPTS OF EXAMS ----------------

    const totalAttemptsOfExams = (exams) => {

        return exams.reduce(
            (total, exam) => total + (Number(exam.totalAttempts) || 0),
            0
        );

    };


    // ---------------- INITIAL DATA FETCHING ----------------

    useEffect(() => {

        let isMounted = true;

        const fetchInitialData = async () => {

            try {

                setIsLoading(true);

                setAuthStatus("loading");

                setDashboardError("");

                // First verify teacher authentication
                const isAuthenticated = await fetchTeachserData();

                if (!isMounted) return;

                // Stop if teacher is not authenticated
                if (!isAuthenticated) return;

                // Fetch recent exams
                await fetchCreatedExams();

            } catch (error) {

                console.error("Dashboard loading error:", error);

                if (isMounted) {

                    setDashboardError(
                        "Unable to load dashboard data. Please try again."
                    );

                    if (error.response?.status === 401) {
                        setTeacher(null);
                        setAuthStatus("unauthenticated");
                    }
                }

            } finally {

                if (isMounted) {
                    setIsLoading(false);
                }

            }
        };

        fetchInitialData();

        return () => {
            isMounted = false;
        };

    }, [fetchTeachserData, fetchCreatedExams]);


    // ---------------- CONDITIONAL RENDERING ----------------

    // 1. Loading
    if (isLoading || authStatus === "loading") {

        return (
            <div className="loading-data">
                <p>Loading...</p>
            </div>
        );

    }


    // 2. Authentication failed
    if (authStatus === "unauthenticated") {

        return <AfterLogout role="teacher" />;

    }


    // 3. Other API errors
    if (dashboardError) {

        return (
            <div className="loading-data">

                <p>{dashboardError}</p>

                <button onClick={() => window.location.reload()}>
                    Retry
                </button>

            </div>
        );

    }


    // 4. Your dashboard JSX starts here


    return (
        <div className="teacher-layout">

            <TeacherSidebar />

            <main className="teacher-main">

                {/* Header */}
                <header className="teacher-dashboard-header">

                    <div>
                        <h1>Good Morning, {teacher.fullName} </h1>
                        <p>Here's what's happening with your exams</p>
                    </div>

                    <div className="teacher-header-profile">
                        <div className="teacher-profile-avatar">
                            {teacher.fullName?.[0].toUpperCase()}
                        </div>

                    </div>

                </header>



                <section className="teacher-stats-grid">

                    <div className="teacher-stat-card">
                        <div>
                            <p>Total Exams</p>
                            <h2>{teacher.createdExams?.length}</h2>
                        </div>
                    </div>

                    <div className="teacher-stat-card">
                        <div>
                            <p>Active Exams</p>
                            <h2>{activeExams}</h2>
                        </div>
                    </div>

                    <div className="teacher-stat-card">

                        <div>
                            <p>Total Attempts</p>
                            <h2>{totalAttemptInExam}</h2>
                        </div>
                    </div>

                </section>


                {/* Quick Actions */}

                <section className="teacher-quick-actions">

                    <div>
                        <h2>Quick Actions</h2>
                        <p>Manage your examinations efficiently</p>
                    </div>

                    <div className="quick-action-buttons">

                        <Link
                            to={`/teacher/${teacher.username}/create-exam`}
                            className="create-exam-button"
                        >
                            Create New Exam
                        </Link>

                        <Link
                            to={`/teacher/${teacher.username}/my-exams`}
                            className="manage-exam-button"
                        >
                            Manage Exams
                        </Link>

                    </div>

                </section>


                {/* Recent Exams */}

                <section className="teacher-dashboard-section">

                    <div className="teacher-section-header">
                        <div>
                            <h2>Recent Exams</h2>
                            <p>Your recently created exams</p>
                        </div>

                        <Link
                            to={`/teacher/${teacher.username}/my-exams`} className="teacher-view-all"
                        >
                            View All →
                        </Link>
                    </div>


                    <div className="teacher-exam-list">

                        {recentExams.map((exam, index) => (

                            <div className="teacher-exam-item" key={index}>

                                <div className="teacher-exam-info">

                                    <h3>{exam.title}</h3>

                                    <div className="teacher-exam-meta">
                                        <span>{exam.totalQuestion} Questions</span>
                                        <span>•</span>
                                        <span>{exam.totalAttempts} Students</span>
                                        <span>•</span>
                                        <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                                    </div>

                                </div>

                                <span className={`exam-status ${exam.status.toLowerCase()}`}> {exam.status}
                                </span>
                            </div>

                        ))}

                    </div>

                </section>



            </main>

        </div>
    );
}

export default TeacherDashboard;