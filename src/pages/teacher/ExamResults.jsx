
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/ExamResults.css";
import axios from "axios";
import AfterLogout from "../../components/AfterLogout";
import { useCallback } from "react";

function ExamResults() {


    // -------------------- STATES --------------------

    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [results, setResults] = useState([]);

    const [search, setSearch] = useState("");

    const [teacher, setTeacher] = useState(null);

    // Authentication: loading | authenticated | unauthenticated
    const [authStatus, setAuthStatus] = useState("loading");

    const [isLoading, setIsLoading] = useState(true);
    const [isResultsLoading, setIsResultsLoading] = useState(false);

    const [dashboardError, setDashboardError] = useState("");

    const [examSearch, setExamSearch] = useState("");
    const [examSearchResults, setExamSearchResults] = useState([]);
    const [showExamDropdown, setShowExamDropdown] = useState(false);
    const [isExamSearching, setIsExamSearching] = useState(false);


    // -------------------- FETCH TEACHER DATA --------------------

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


    // -------------------- FETCH ALL EXAMS --------------------

    const getAllExams = useCallback(async () => {
        try {
            const response = await axios.get(
                "/api/v1/teacher/created-exams"
            );

            const fetchedExams = response.data.data || [];

            setExams(fetchedExams);
            setExamSearchResults(fetchedExams);

            setSelectedExam(
                fetchedExams.length > 0
                    ? fetchedExams[0]
                    : null
            );

        } catch (error) {

            console.error("Error fetching exams:", error);

            if (error.response?.status === 401) {
                setTeacher(null);
                setAuthStatus("unauthenticated");
            }

            setExams([]);
            setExamSearchResults([]);
            setSelectedExam(null);

            throw error;
        }
    }, []);


    // -------------------- INITIAL DATA FETCHING --------------------

    useEffect(() => {

        let isMounted = true;

        const fetchInitialData = async () => {

            try {
                setIsLoading(true);
                setAuthStatus("loading");
                setDashboardError("");

                // First verify teacher authentication
                const isAuthenticated = await fetchTeacherData();

                if (!isMounted) return;

                // Don't fetch exams if authentication failed
                if (!isAuthenticated) return;

                // Fetch exams after authentication
                await getAllExams();

            } catch (error) {

                console.error("Error loading dashboard:", error);

                if (isMounted) {
                    setDashboardError(
                        "Unable to load dashboard. Please try again."
                    );
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

    }, [fetchTeacherData, getAllExams]);


    // -------------------- SEARCH EXAMS --------------------

    useEffect(() => {

        if (!showExamDropdown) return;

        const query = examSearch.trim();

        // Display initially fetched exams
        if (!query) {
            setExamSearchResults(exams);
            setIsExamSearching(false);
            return;
        }

        const controller = new AbortController();

        const timer = setTimeout(async () => {

            try {

                setIsExamSearching(true);

                const response = await axios.get(
                    "/api/v1/teacher/search-exams",
                    {
                        params: { query },
                        signal: controller.signal
                    }
                );

                setExamSearchResults(
                    response.data.data || []
                );

            } catch (error) {

                if (error.code !== "ERR_CANCELED") {
                    console.error("Error searching exams:", error);
                    setExamSearchResults([]);
                }

            } finally {

                if (!controller.signal.aborted) {
                    setIsExamSearching(false);
                }
            }

        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };

    }, [examSearch, showExamDropdown, exams]);


    // -------------------- SELECT EXAM --------------------

    const handleExamSelect = (exam) => {

        setSelectedExam(exam);
        setExamSearch(exam.title);
        setShowExamDropdown(false);

    };


    // -------------------- FETCH RESULTS FOR SELECTED EXAM --------------------

    useEffect(() => {

        if (!selectedExam?._id) {
            setResults([]);
            setIsResultsLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchResults = async () => {

            try {

                setIsResultsLoading(true);

                // Clear previous exam results immediately
                setResults([]);

                const response = await axios.get(
                    `/api/v1/teacher/result-for/${selectedExam._id}`,
                    {
                        signal: controller.signal
                    }
                );

                setResults(response.data.data || []);

            } catch (error) {

                if (error.code !== "ERR_CANCELED") {
                    console.error("Error fetching results:", error);
                    setResults([]);
                }

            } finally {

                if (!controller.signal.aborted) {
                    setIsResultsLoading(false);
                }
            }
        };

        fetchResults();

        return () => {
            controller.abort();
        };

    }, [selectedExam?._id]);


    // -------------------- EXAM CHANGE --------------------

    const handleExamChange = (e) => {

        const exam = exams.find(
            (item) => item._id === e.target.value
        );

        setSelectedExam(exam || null);

    };


    // -------------------- FILTER RESULTS --------------------

    const filteredResults = results.filter((result) => {

        const searchValue = search.trim().toLowerCase();

        return (
            result.student?.fullName?.toLowerCase().includes(searchValue) ||
            result.student?.rollNumber?.toLowerCase().includes(searchValue) ||
            result.student?.email?.toLowerCase().includes(searchValue)
        );

    });


    // -------------------- CALCULATE STATISTICS --------------------

    const getPercentage = (result) => {

        const score = Number(result.scoreObtained) || 0;
        const total = Number(result.totalScore) || 0;

        return total > 0
            ? Math.round((score / total) * 100)
            : 0;

    };


    // Average score
    const averageScore = results.length > 0
        ? (
            results.reduce(
                (total, result) => total + getPercentage(result),
                0
            ) / results.length
        ).toFixed(1)
        : "0.0";


    // Highest score
    const highestScore = results.length > 0
        ? Math.max(...results.map(getPercentage))
        : 0;


    // Passed students
    const passedStudents = results.filter(
        (result) => getPercentage(result) >= 40
    ).length;


    // -------------------- DOWNLOAD RESULTS CSV --------------------

    const handleDownloadResults = () => {

        if (!selectedExam || results.length === 0) {
            alert("No results available to download.");
            return;
        }

        const headers = [
            "Student Name",
            "Roll Number",
            "Email",
            "Marks Obtained",
            "Total Marks",
            "Percentage",
            "Submitted At"
        ];

        // Safely format CSV cells
        const formatCSVCell = (value) => {

            let str = String(value ?? "");

            // Prevent CSV formula injection
            if (/^[\s]*[=+\-@\t\r]/.test(str)) {
                str = "'" + str;
            }

            // Escape double quotes
            return `"${str.replace(/"/g, '""')}"`;
        };


        const rows = results.map((result) => {

            const score = Number(result.scoreObtained) || 0;
            const total = Number(result.totalScore) || 0;

            const percentage = total > 0
                ? `${Math.round((score / total) * 100)}%`
                : "0%";

            return [
                result.student?.fullName,
                result.student?.rollNumber,
                result.student?.email,
                score,
                total,
                percentage,
                result.createdAt
                    ? new Date(result.createdAt).toLocaleString("en-IN")
                    : ""
            ];

        });


        const csvContent = [
            headers,
            ...rows
        ]
            .map((row) => row.map(formatCSVCell).join(","))
            .join("\r\n");


        // UTF-8 BOM for Excel compatibility
        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        const safeTitle = selectedExam.title
            .replace(/[<>:"/\\|?*]/g, "_");

        link.download = `${safeTitle}-results.csv`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

    };


    // -------------------- CONDITIONAL RENDERING --------------------

    // 1. Initial loading
    if (isLoading || authStatus === "loading") {

        return (
            <div className="loading-data">
                <p>Loading...</p>
            </div>
        );

    }


    // 2. Not authenticated
    if (authStatus === "unauthenticated") {

        return <AfterLogout role="teacher" />;

    }


    // 3. Dashboard loading error
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


    // 4. Render your normal teacher dashboard below


    return (
        <div className="teacher-page">
            <TeacherSidebar />

            <main className="teacher-main exam-results-main">

                <div className="results-page-header">
                    <div>
                        <h1>Exam Results</h1>
                        <p>
                            View and analyze student performance in your exams.
                        </p>
                    </div>
                </div>

                {/* Exam Selector */}

                {/* Exam Selector */}
                <div className="exam-selector-card">

                    <div className="selector-content">

                        <label htmlFor="examSearch">
                            Select Exam
                        </label>

                        <div className="exam-search-dropdown">

                            <input
                                id="examSearch"
                                type="text"
                                placeholder="Search exams..."
                                value={examSearch}
                                onFocus={() => {
                                    setShowExamDropdown(true);
                                    setExamSearch("");
                                }}
                                onChange={(e) => {
                                    setExamSearch(e.target.value);
                                    setShowExamDropdown(true);
                                }}
                                disabled={exams.length === 0}
                            />

                            {showExamDropdown && (

                                <div className="exam-dropdown-options">

                                    {isExamSearching ? (

                                        <div className="exam-no-match">
                                            Searching exams...
                                        </div>

                                    ) : examSearchResults.length > 0 ? (

                                        examSearchResults.map((exam) => (

                                            <div
                                                key={exam._id}
                                                className={`exam-dropdown-option ${selectedExam?._id === exam._id
                                                    ? "selected"
                                                    : ""
                                                    }`}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => handleExamSelect(exam)}
                                            >
                                                {exam.title}
                                            </div>

                                        ))

                                    ) : (

                                        <div className="exam-no-match">
                                            No exams found
                                        </div>

                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                    {selectedExam && (

                        <div className="selected-exam-info">

                            <span>
                                {selectedExam.totalQuestion} Questions
                            </span>

                            <span>
                                {selectedExam.totalQuestion *
                                    (selectedExam.questionMarks || 0)} Marks
                            </span>
                            <span>
                                {-selectedExam.negativeMarks} for wrong answer
                            </span>

                        </div>

                    )}

                </div>


                {/* Statistics */}
                <div className="results-statistics">
                    <div className="result-stat-card">
                        <div>
                            <span className="result-stat-value">
                                {results.length}
                            </span>
                            <span className="result-stat-label">
                                Students Attempted
                            </span>
                        </div>
                    </div>

                    <div className="result-stat-card">
                        <div>
                            <span className="result-stat-value">
                                {averageScore}%
                            </span>
                            <span className="result-stat-label">
                                Average Score
                            </span>
                        </div>
                    </div>

                    <div className="result-stat-card">
                        <div>
                            <span className="result-stat-value">
                                {highestScore}%
                            </span>
                            <span className="result-stat-label">
                                Highest Score
                            </span>
                        </div>
                    </div>

                    <div className="result-stat-card">
                        <div>
                            <span className="result-stat-value">
                                {passedStudents}
                            </span>
                            <span className="result-stat-label">
                                Passed
                            </span>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="results-card">
                    <div className="results-card-header">
                        <div>
                            <h2>Student Results</h2>

                            {selectedExam && (
                                <p>{selectedExam.title}</p>
                            )}
                        </div>

                        <div className="results-header-actions">

                            <button
                                className="download-results-btn"
                                onClick={handleDownloadResults}
                                disabled={isResultsLoading}
                            >
                                <span>⤓ </span>
                                Download Results
                            </button>
                        </div>
                    </div>

                    {isResultsLoading ? (
                        <div className="loading-data">
                            <p>Loading results...</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="no-results">
                            <h3>No Results Found</h3>
                            <p>
                                No student results match your search.
                            </p>
                        </div>
                    ) : (
                        <div className="results-table-wrapper">
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Student</th>
                                        <th>Roll Number</th>
                                        <th>Score</th>
                                        <th>Percentage</th>
                                        <th>Submitted</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {results.map((result, index) => (
                                        <tr key={result._id}>
                                            <td className="serial-number">
                                                {index + 1}
                                            </td>

                                            <td>
                                                <div className="student-cell">
                                                    <div className="student-avatar">
                                                        {result.student.fullName?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <strong>
                                                            {result.student.fullName}
                                                        </strong>
                                                        <span>
                                                            {result.student.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="roll-number">
                                                    {result.student.rollNumber}
                                                </span>
                                            </td>

                                            <td>
                                                <strong>{result.scoreObtained}</strong>
                                                <span className="total-marks">
                                                    / {result.totalScore}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`percentage ${Math.round((result.scoreObtained / result.totalScore) * 100) >= 80
                                                        ? "excellent"
                                                        : Math.round((result.scoreObtained / result.totalScore) * 100) >= 60
                                                            ? "good"
                                                            : Math.round((result.scoreObtained / result.totalScore) * 100) >= 40
                                                                ? "average"
                                                                : "poor"
                                                        }`}
                                                >
                                                    {Math.round((result.scoreObtained / result.totalScore) * 100)}%
                                                </span>
                                            </td>

                                            <td>
                                                <span className="submitted-date">
                                                    {new Date(
                                                        result.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric"
                                                        }
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <Link
                                                    to={`/teacher/result/${result._id}`}
                                                    className="view-result-btn"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default ExamResults;
