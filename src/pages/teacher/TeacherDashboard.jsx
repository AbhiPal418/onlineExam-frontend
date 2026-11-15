import { Link } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/TeacherDashboard.css";
import { useState, useEffect } from "react";
import axios from "axios";
import AfterLogout from "../../components/AfterLogout";

function TeacherDashboard() {

    const [recentExams, setRecentExams] = useState([]);
    const [teacher, setTeacher] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [totalAttemptInExam,setTotalAttemptInExams] = useState(0);
    const [activeExams,setActivExams] = useState(0);
    const fetchTeachserData = async () => {
        try {

            const response = await axios.get("/api/v1/teacher/dashboard");
            const totalAttemptsIn = await axios.get("/api/v1/teacher/total-attempt-in-exams");
            const activeExamsLength = await axios.get("/api/v1/teacher/active-exams");
            setActivExams(activeExamsLength.data.data.length)
            setTotalAttemptInExams(totalAttemptsIn.data.data)
            setTeacher(response.data.data);
        } catch (error) {
            console.error("Error fetching teacher data:", error);
        }
    };

    const fetchCreatedExams = async () => {
        try {
            const response = await axios.get("/api/v1/teacher/created-exams");
            setRecentExams(response.data.data);
        } catch (error) {
            console.error("Error fetching exam data:", error);
        }
    };

    const totalAttemptsOfExams = (recentExams) => {
        let total = 0;
        // console.log("hello" + recentExams?.length)
        for (let i = 0; i < recentExams?.length; i++) {
            total = total + recentExams[i]?.totalAttempts;
        }
        return total;
    }

    useEffect(() => {
        setIsLoading(true)
        fetchTeachserData();
        fetchCreatedExams();
        setIsLoading(false)
    }, [])


    

    if (isLoading) {
        return (
            <div className="loading-data">
                <p>Loading........</p>
            </div>
        )
    }

    console.log(typeof(teacher))
    if (!teacher && !isLoading) {
        return <AfterLogout role="teacher" />;
    }

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