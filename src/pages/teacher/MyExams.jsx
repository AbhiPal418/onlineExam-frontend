import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/MyExams.css";
import axios from "axios";
import AfterLogout from "../../components/AfterLogout";
import { useCallback, } from "react";


const MyExams = () => {
  

// ---------------- STATES ----------------

const [exams, setExams] = useState([]);
const [search, setSearch] = useState("");

const [teacher, setTeacher] = useState(null);

const navigate = useNavigate();

const [isLoading, setIsLoading] = useState(true);
const [authStatus, setAuthStatus] = useState("loading");

const [totalAttemptInExams, setTotalAttemptInExams] = useState(0);
const [activeExams, setActiveExams] = useState([]);

const [errorMessage, setErrorMessage] = useState("");


// ---------------- FETCH TEACHER DATA ----------------

const fetchTeacherData = useCallback(async () => {

    try {

        const response = await axios.get(
            "/api/v1/teacher/dashboard"
        );

        setTeacher(response.data.data);
        setAuthStatus("authenticated");

        return true;

    } catch (error) {

        if (error.response?.status === 401) {

            setTeacher(null);
            setAuthStatus("unauthenticated");

            return false;
        }

        throw error;
    }

}, []);


// ---------------- FETCH ALL TEACHER EXAMS ----------------

const fetchTeachersExams = useCallback(async () => {

    const [
        examsResponse,
        activeExamsResponse,
        attemptsResponse
    ] = await Promise.all([

        axios.get("/api/v1/teacher/created-exams"),

        axios.get("/api/v1/teacher/active-exams"),

        axios.get("/api/v1/teacher/total-attempt-in-exams")

    ]);

    setExams(examsResponse.data.data || []);

    setActiveExams(activeExamsResponse.data.data || []);

    setTotalAttemptInExams(
        attemptsResponse.data.data || 0
    );

}, []);


// ---------------- SEARCH EXAMS ----------------

const searchedExams = useCallback(async (query, signal) => {

    try {

        const response = await axios.get(
            "/api/v1/teacher/search-exams",
            {
                params: {
                    query
                },
                signal
            }
        );

        setExams(response.data.data || []);

    } catch (error) {

        if (error.code !== "ERR_CANCELED") {

            console.error("Error searching exams:", error);

            setExams([]);
        }

        throw error;
    }

}, []);


// ---------------- INITIAL FETCH ----------------

useEffect(() => {

    let isMounted = true;

    const fetchInitialData = async () => {

        try {

            setIsLoading(true);
            setAuthStatus("loading");
            setErrorMessage("");

            // Verify authentication first
            const authenticated = await fetchTeacherData();

            if (!isMounted) return;

            if (!authenticated) return;

            // Fetch dashboard data
            await fetchTeachersExams();

        } catch (error) {

            console.error("Error loading dashboard:", error);

            if (isMounted) {
                setErrorMessage(
                    "Unable to load dashboard. Please try again."
                );
            }

            if (error.response?.status === 401 && isMounted) {
                setTeacher(null);
                setAuthStatus("unauthenticated");
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

}, [fetchTeacherData, fetchTeachersExams]);


// ---------------- SEARCH EFFECT ----------------

useEffect(() => {

    // Don't search before initial loading completes
    if (isLoading || authStatus !== "authenticated") {
        return;
    }

    const query = search.trim();

    // Empty search: show all exams
    if (!query) {

        const fetchAll = async () => {

            try {

                await fetchTeachersExams();

            } catch (error) {

                console.error("Error fetching exams:", error);

                if (error.response?.status === 401) {
                    setTeacher(null);
                    setAuthStatus("unauthenticated");
                }
            }
        };

        fetchAll();

        return;
    }

    // Debounce search
    const controller = new AbortController();

    const timer = setTimeout(async () => {

        try {

            setIsLoading(true);

            await searchedExams(query, controller.signal);

        } catch (error) {

            if (error.response?.status === 401) {
                setTeacher(null);
                setAuthStatus("unauthenticated");
            }

        } finally {

            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }

    }, 300);

    return () => {

        clearTimeout(timer);

        controller.abort();

    };

}, [
    search,
    isLoading,
    authStatus,
    fetchTeachersExams,
    searchedExams
]);


// ---------------- CHANGE EXAM STATUS ----------------

const changeExamStatus = async (examId) => {

    try {

        const response = await axios.post(
            `/api/v1/teacher/change-status/${examId}`
        );

        if (response.data.success) {

            // Refresh dashboard data
            await fetchTeachersExams();

            setSearch("");

        }

    } catch (error) {

        console.error("Error changing exam status:", error);

        if (error.response?.status === 401) {
            setTeacher(null);
            setAuthStatus("unauthenticated");
        }
    }

};


// ---------------- CONDITIONAL RENDERING ----------------

// Initial loading
if (isLoading || authStatus === "loading") {

    return (
        <div className="loading-data">
            <p>Loading...</p>
        </div>
    );

}


// Not authenticated
if (authStatus === "unauthenticated") {

    return <AfterLogout role="teacher" />;

}


// API error
if (errorMessage) {

    return (
        <div className="loading-data">

            <p>{errorMessage}</p>

            <button onClick={() => window.location.reload()}>
                Retry
            </button>

        </div>
    );

}


// Render your existing dashboard JSX below

    return (
        <div className="teacher-page">
            <TeacherSidebar />

            <main className="teacher-main my-exams-main">

                {/* Header */}
                <div className="my-exams-header">
                    <div>
                        <h1>My Exams</h1>
                        <p>
                            Manage the exams you have created.
                        </p>
                    </div>

                    <Link
                        to={`/teacher/${teacher.username}/create-exam`}
                        className="create-exam-btn"
                    >
                        Create Exam
                    </Link>
                </div>

                {/* Statistics */}
                <div className="exam-summary">

                    <div className="exam-summary-card">

                        <div>
                            <span className="summary-value">
                                {teacher.createdExams?.length}
                            </span>

                            <span className="summary-label">
                                Total Exams
                            </span>
                        </div>
                    </div>

                    <div className="exam-summary-card">

                        <div>
                            <span className="summary-value">
                                {activeExams.length}
                            </span>

                            <span className="summary-label">
                                Active Exams
                            </span>
                        </div>
                    </div>

                    <div className="exam-summary-card">

                        <div>
                            <span className="summary-value">
                                {totalAttemptInExams}
                            </span>

                            <span className="summary-label">
                                Total Attempts
                            </span>
                        </div>
                    </div>

                </div>

                {/* Search */}
                <div className="my-exams-toolbar">

                    <div className="exam-search">
                        <input
                            type="text"
                            placeholder="Search exams..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="clear-search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <span className="exam-count">
                        {exams.length} exam
                        {exams.length !== 1 ? "s" : ""}
                    </span>

                </div>

                {/* Exams */}
                <div className="my-exams-list">

                    {exams.length === 0 ? (
                        <div className="no-exams">

                            <h2>No Exams Found</h2>

                            <p>
                                {search
                                    ? "No exam matches your search."
                                    : "You haven't created any exams yet."}
                            </p>

                            {!search && (
                                <Link
                                    to={`/teacher/${teacher.username}/create-exam`}
                                    className="create-first-exam-btn"
                                >
                                    Create Your First Exam
                                </Link>
                            )}

                        </div>
                    ) : (
                        exams.map((exam) => (

                            <div className="my-exam-card" key={exam._id} >

                                <div className="exam-card-top">

                                    <div className="exam-title-section">

                                        <div>
                                            <h2>{exam.title}</h2>

                                        </div>

                                    </div>

                                    <span className={`exam-status ${exam.status.toLowerCase()}`} >
                                        {exam.status}
                                    </span>

                                </div>

                                <div className="exam-details">

                                    <div className="exam-detail">


                                        <div>
                                            <span className="detail-label">
                                                Questions
                                            </span>

                                            <strong>
                                                {exam.totalQuestion}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="exam-detail">


                                        <div>
                                            <span className="detail-label">
                                                Duration
                                            </span>

                                            <strong>
                                                {exam.timeLimit} min
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="exam-detail">


                                        <div>
                                            <span className="detail-label">
                                                Total Marks
                                            </span>

                                            <strong>
                                                {exam.totalQuestion * 4}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="exam-detail">


                                        <div>
                                            <span className="detail-label">
                                                Total Attempts
                                            </span>

                                            <strong>
                                                {exam.totalAttempts}
                                            </strong>
                                        </div>
                                    </div>

                                </div>

                                <div className="exam-card-footer">

                                    <span className="created-date">
                                        Created on{" "}
                                        {new Date(
                                            exam.createdAt
                                        ).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>

                                    <div className="exam-actions">

                                        <Link
                                            to={`/teacher/${teacher.username}/view-exam/${exam._id}`}
                                            className="view-exam-btn"
                                        >
                                            View
                                        </Link>

                                        <Link
                                            to={`/teacher/${teacher.username}/edit-exam/${exam._id}`}
                                            className="edit-exam-btn"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() => changeExamStatus(exam._id)}
                                            className="change-exam-btn"
                                        >
                                            Change status
                                        </button>



                                    </div>

                                </div>

                            </div>

                        ))
                    )}

                </div>

            </main>
        </div>

    );
};

export default MyExams;