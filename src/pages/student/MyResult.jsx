
import { useState, useEffect } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import "../../styles/MyResults.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AfterLogout from "../../components/AfterLogout";

function MyResults() {

    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [user, setUser] = useState({});
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true);

    // Fetch student information
    const fetchStudentData = async () => {
        try {
            const response = await axios.get(
                "/api/v1/student/dashboard"
            );

            setUser(response.data.data);

        } catch (error) {
            console.error("Error fetching student data:", error);

            if (error.response?.status === 401) {
                setUser(null);
            }
        } finally {
            setUserLoading(false);
        }
    };

    // Fetch all exam results
    const getAllResults = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                "/api/v1/student/my-results"
            );

            setResults(response.data.data || []);

        } catch (error) {
            console.error("Error fetching results:", error);
        } finally {
            setLoading(false);
        }
    };

    // Search exam results
    const searchExamsResult = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                "/api/v1/student/search-result",
                {
                    params: {
                        query: search.trim()
                    }
                }
            );

            setResults(response.data.data || []);

        } catch (error) {
            console.error("Error searching results:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch student information on component mount
    useEffect(() => {
        setUserLoading(true)
        fetchStudentData();
        setUserLoading(false)
    }, []);

    // Debounced search
    useEffect(() => {

        const delay = setTimeout(() => {

            if (search.trim() === "") {
                getAllResults();
            } else {
                searchExamsResult();
            }

        }, 100);

        return () => clearTimeout(delay);

    }, [search]);

    // Handle logged-out student
    if (userLoading) {
        return (
            <div className="loading-data">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user && !userLoading) {
        return <AfterLogout role="student" />;
    }

    return (
        <div className="results-layout">

            <StudentSidebar />

            <main className="results-main">

                {/* Header */}
                <div className="results-header">

                    <div>
                        <h1>
                            {user.fullName}, your Previous Exam Results
                        </h1>
                    </div>

                    <div className="results-profile">

                        <Link to={`/student/${user.username}/profile`}>
                            <div className="results-avatar">
                                {user.fullName?.[0]}
                            </div>
                        </Link>

                    </div>

                </div>

                {/* Exam History */}
                <div className="results-stats">

                    <div className="results-section-header">

                        <div>
                            <h2>Exam History</h2>
                            <p>Your completed examinations</p>
                        </div>

                    </div>

                    {/* Search */}
                    <div className="exam-search">

                        <input
                            type="text"
                            placeholder="Search exams..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {search !== "" && (
                            <button
                                onClick={() => setSearch("")}
                                className="clear-search"
                                type="button"
                            >
                                x
                            </button>
                        )}

                    </div>

                </div>

                {/* Results Table */}
                <section className="results-section">

                    {loading ? (

                        <div className="loading-data">
                            <p>Loading...</p>
                        </div>

                    ) : (

                        <div className="results-table-container">

                            <table className="results-table-std">

                                <thead>
                                    <tr>
                                        <th>Exam</th>
                                        <th>Created By</th>
                                        <th>Score</th>
                                        <th>Attempted</th>
                                        <th>Total Question</th>
                                        <th>Percentage</th>
                                        {/* <th>View Exam</th> */}
                                    </tr>
                                </thead>

                                <tbody>

                                    {results.length === 0 ? (

                                        <tr>
                                            <td colSpan="6" className="no-results">
                                                {search.trim()
                                                    ? "No matching exams found"
                                                    : "No Results Yet"}
                                            </td>
                                        </tr>

                                    ) : (

                                        results.map((result) => (

                                            <tr key={result._id}>

                                                <td className="result-exam-name">
                                                    {result.exam?.title || "Deleted Exam"}
                                                </td>

                                                <td>
                                                    
                                                    {result.exam.createdBy?.fullName}
                                                </td>
                                                <td>
                                                    {result.scoreObtained} / {result.totalScore}
                                                </td>

                                                <td>
                                                    {result.attemptedQuestions}
                                                </td>

                                                <td>
                                                    {result.exam?.questionMarks
                                                        ? result.totalScore / result.exam.questionMarks
                                                        : "-"}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {result.totalScore > 0
                                                            ? Math.round(
                                                                (result.scoreObtained / result.totalScore) * 100
                                                            )
                                                            : 0}%
                                                    </strong>
                                                </td>

                                                {/* <td>
                                                    <button
                                                        className="view-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/student/${user.username}/view-result/${result.exam?._id}`,
                                                                {
                                                                    state: {
                                                                        exam: result.exam,
                                                                        student: user.username
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>
                                                </td> */}

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default MyResults;
