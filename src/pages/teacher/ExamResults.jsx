
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/ExamResults.css";
import axios from "axios";
import AfterLogout from "../../components/AfterLogout";

function ExamResults() {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");
    const [teacher, setTeacher] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResultsLoading, setIsResultsLoading] = useState(false);

    const [examSearch, setExamSearch] = useState("");
    const [examSearchResults, setExamSearchResults] = useState([]);
    const [showExamDropdown, setShowExamDropdown] = useState(false);
    const [isExamSearching, setIsExamSearching] = useState(false);

    // Fetch teacher data
    const fetchTeacherData = async () => {
        try {
            const response = await axios.get("/api/v1/teacher/dashboard");
            setTeacher(response.data.data);
        } catch (error) {
            console.error("Error fetching teacher data:", error);
        }
    };

    const getAllExams = async () => {
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
            setExams([]);
            setExamSearchResults([]);
        }
    };


    useEffect(() => {

        if (!showExamDropdown) return;

        const query = examSearch.trim();

        // Show all initially fetched exams when search is empty
        if (!query) {
            setExamSearchResults(exams);
            setIsExamSearching(false);
            return;
        }

        const controller = new AbortController();

        // Debounce API requests
        const timer = setTimeout(async () => {

            try {
                setIsExamSearching(true);

                const response = await axios.get(
                    "/api/v1/teacher/search-exams",
                    {
                        params: {
                            query: query
                        },
                        signal: controller.signal
                    }
                );

                setExamSearchResults(response.data.data || []);

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
    // Fetch results for selected exam
    const getResultForExam = async (examId) => {
        try {
            const response = await axios.get(
                `/api/v1/teacher/result-for/${examId}`
            );
            // console.log("Hello vai")
            setResults(response.data.data || []);
        } catch (error) {
            console.error("Error fetching results:", error);
            setResults([]);
        }
    };

    const handleExamSelect = (exam) => {

        setSelectedExam(exam);
        setExamSearch(exam.title);
        setShowExamDropdown(false);

    };
    // const searchedExams = async () => {
    //     try {
    //         setIsLoading(true);
    //         const response = await axios.get(`/api/v1/teacher/search-exams`, {
    //             params: {
    //                 query: search
    //             }
    //         })
    //         setExams(response.data.data)
    //         setIsLoading(false)
    //     } catch (error) {
    //         console.error("Error searching exams ", error)
    //     }
    // }

    // Initial data fetching
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);

                await Promise.all([
                    fetchTeacherData(),
                    getAllExams()
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);



    // Fetch results whenever selected exam changes
    useEffect(() => {
        if (!selectedExam?._id) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            try {
                setIsResultsLoading(true);
                // console.log("Hello")
                await getResultForExam(selectedExam._id);
            } finally {
                setIsResultsLoading(false);
            }
        };

        fetchResults();
    }, [selectedExam?._id]);

    const handleExamChange = (e) => {
        const exam = exams.find(
            (item) => item._id === e.target.value
        );

        setSelectedExam(exam || null);
    };
    // console.log(exams)
    // console.log(results)
    // Search filtering
    const filteredResults = results.filter((result) => {
        const searchValue = search.toLowerCase();

        return (
            result.studentName?.toLowerCase().includes(searchValue) ||
            result.rollNumber?.toLowerCase().includes(searchValue) ||
            result.email?.toLowerCase().includes(searchValue)
        );
    });

    // Average score
    const averageScore = results.length > 0
        ? (
            results.reduce(
                (total, result) => total + Math.round((result.scoreObtained / result.totalScore) * 100),
                0
            ) / results.length
        ).toFixed(1)
        : 0;

    // Highest score

    const highestScore = results.length > 0
        ? Math.max(...results.map((result) => Math.round((result.scoreObtained / result.totalScore) * 100)))
        : 0;

    // Passed students
    const passedStudents = results.filter(
        (result) => Math.round((result.scoreObtained / result.totalScore) * 100) >= 40
    ).length;

    // Download results as CSV

    const handleDownloadResults = () => {
        if (!selectedExam || !results || results.length === 0) {
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

        // Safely format individual CSV cells
        const formatCSVCell = (value) => {
            let str = String(value ?? "");

            // Prevent CSV formula injection in untrusted text
            if (typeof value === "string" &&
                (/^[\t\r\n=+\-@]/.test(str) || /^\s*[=+\-@]/.test(str))) {
                str = "'" + str;
            }

            // Escape double quotes
            return `"${str.replace(/"/g, '""')}"`;
        };

        // Convert results into CSV rows
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

        // Generate CSV content
        const csvContent = [
            headers,
            ...rows
        ]
            .map(row => row.map(formatCSVCell).join(","))
            .join("\r\n");

        // Add UTF-8 BOM for better Excel compatibility
        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        // Generate temporary URL
        const url = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = url;

        const safeTitle = selectedExam.title.replace(
            /[<>:"/\\|?*]/g, "_"
        );

        link.download = `${safeTitle}-results.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        // Release URL after the browser has initiated the download
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    };

    // console.log(filteredResults)

    if (isLoading) {
        return (
            <div className="loading-data">
                <p>Loading......</p>
            </div>
        );
    }
    if (!teacher && !isLoading) {
        return <AfterLogout role="teacher" />;
    }

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
