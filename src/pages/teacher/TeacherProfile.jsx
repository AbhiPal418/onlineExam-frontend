
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/TeacherProfile.css";
import axios from "axios";
import AfterLogout from "../../components/AfterLogout";



function TeacherProfile() {
    const navigate = useNavigate();

    const [recentExams, setRecentExams] = useState([]);
    const [teacher, setTeacher] = useState({});
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [isLoading,setIsLoading] = useState(false)
    const [activeExams,setActiveExams] = useState(0)
    const [totalAttemptInExam,setTotalAttemptInExams] = useState(0)

    const fetchTeacherData = async () => {
        try {
            const response = await axios.get("/api/v1/teacher/dashboard");
            setTeacher(response.data.data);
        } catch (error) {
            console.error("Error fetching teacher data:", error);
        }
    };

    const fetchCreatedExams = async () => {
        try {
            const response = await axios.get("/api/v1/teacher/created-exams");
            const response2 = await axios.get("/api/v1/teacher/active-exams");
            const totalAttemptsIn = await axios.get("/api/v1/teacher/total-attempt-in-exams");
            setTotalAttemptInExams(totalAttemptsIn.data.data)
            setActiveExams(response2.data.data.length)
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
        setIsLoading(true);
        fetchTeacherData();
        fetchCreatedExams();
        setIsLoading(false)
    }, [])

    useEffect(() => {
        setIsLoading(true)
        setTotalAttempts(totalAttemptsOfExams(recentExams));
        setIsLoading(false)
    }, [recentExams])

    if(isLoading){
        return(
            <div className="loading-data">
                <p>Loading.....</p>
            </div>
        )
    }
    if (!teacher && !isLoading) {
        return <AfterLogout role="teacher" />;
    }
    return (
        <div className="teacher-layout teacher-profile-page">
            <TeacherSidebar />

            <main className="teacher-profile-main">

                {/* Page Header */}
                <div className="teacher-profile-header">
                    <div>
                        <h1>My Profile</h1>
                        <p>Manage your personal information and account settings.</p>
                    </div>
                </div>

                {/* Profile Overview */}
                <section className="teacher-profile-card">

                    <div className="teacher-profile-avatar">
                        {teacher?.fullName?.[0].toUpperCase()}
                    </div>

                    <div className="teacher-profile-details">
                        <h2>{teacher.fullName}</h2>

                        <span className="teacher-role-badge-h">
                            {teacher.role}
                        </span>

                    </div>

                    <div className="teacher-profile-actions">
                        <button
                            className="teacher-edit-profile-btn"
                            onClick={()=>
                                navigate(`/teacher/${teacher.username}/edit-profile`)
                            }
                        >
                            Edit Profile
                        </button>
                    </div>

                </section>

                {/* Statistics */}
                <section className="teacher-profile-stats">

                    <div className="teacher-stat-card">
                        <div>
                            <h3>{teacher?.createdExams?.length}</h3>
                            <p>Exams Created</p>
                        </div>
                    </div>

                    <div className="teacher-stat-card">
                        <div>
                            <h3>{activeExams}</h3>
                            <p>Active Exams</p>
                        </div>
                    </div>

                    <div className="teacher-stat-card">
                        <div>
                            <h3>{totalAttemptInExam}</h3>
                            <p>Total Attempts</p>
                        </div>
                    </div>

                </section>

                {/* Personal Information */}
                <section className="teacher-profile-section">

                    <div className="teacher-section-heading">
                        <h2>Personal Information</h2>
                        <p>Your personal details.</p>
                    </div>

                    <div className="teacher-info-grid">

                        <div className="teacher-info-item">
                            <label>Full Name</label>
                            <p>{teacher.fullName}</p>
                        </div>

                        <div className="teacher-info-item">
                            <label>Username</label>
                            <p>{teacher.username}</p>
                        </div>

                        <div className="teacher-info-item">
                            <label>Email Address</label>
                            <p>{teacher.email}</p>
                        </div>

                        <div className="teacher-info-item">
                            <label>Account Type</label>
                            <p>{teacher.role}</p>
                        </div>

                        <div className="teacher-info-item">
                            <label>Joined On</label>
                            <p>{new Date(teacher.createdAt).toLocaleDateString()}</p>
                        </div>

                    </div>

                </section>

                {/* Account Settings */}
                <section className="teacher-profile-section">

                    <div className="teacher-section-heading">
                        <h2>Account & Security</h2>
                        <p>Manage your account security and preferences.</p>
                    </div>

                    <div className="teacher-security-item">
                        <div>
                            <h3>Change Password</h3>
                            <p>Update your password to keep your account secure.</p>
                        </div>

                        <button
                            onClick={() => navigate(`/teacher/${teacher.username}/change-password`,{
                                state:{
                                    username:teacher.username
                                }
                            })}
                        >
                            Change Password
                        </button>
                    </div>

                    <div className="teacher-security-item">
                        <div>
                            <h3>Account Status</h3>
                            <p>Your account is currently active</p>
                        </div>

                        <span className="teacher-role-badge">
                            Active
                        </span>
                    </div>

                </section>

            </main>
        </div>
    );
}

export default TeacherProfile;
