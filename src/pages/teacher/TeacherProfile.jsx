
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/TeacherProfile.css";
import axios from "axios";
import AfterLogout from "../../components/AfterLogout";

import { useCallback, } from "react";


function TeacherProfile() {
    

// ---------------- STATES ----------------

const navigate = useNavigate();

const [recentExams, setRecentExams] = useState([]);

const [teacher, setTeacher] = useState(null);

const [totalAttempts, setTotalAttempts] = useState(0);

const [isLoading, setIsLoading] = useState(true);

// loading | authenticated | unauthenticated
const [authStatus, setAuthStatus] = useState("loading");

const [activeExams, setActiveExams] = useState(0);

const [totalAttemptInExam, setTotalAttemptInExams] = useState(0);

const [dashboardError, setDashboardError] = useState("");


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

        console.error("Error fetching teacher data:", error);

        if (error.response?.status === 401) {

            setTeacher(null);
            setAuthStatus("unauthenticated");

            return false;
        }

        throw error;
    }

}, []);


// ---------------- FETCH CREATED EXAMS & STATISTICS ----------------

const fetchCreatedExams = useCallback(async () => {

    try {

        const [
            examsResponse,
            activeExamsResponse,
            totalAttemptsResponse
        ] = await Promise.all([

            axios.get("/api/v1/teacher/created-exams"),

            axios.get("/api/v1/teacher/active-exams"),

            axios.get("/api/v1/teacher/total-attempt-in-exams")

        ]);

        setRecentExams(examsResponse.data.data || []);

        setActiveExams(
            activeExamsResponse.data.data?.length || 0
        );

        setTotalAttemptInExams(
            totalAttemptsResponse.data.data || 0
        );

    } catch (error) {

        console.error("Error fetching exam data:", error);

        if (error.response?.status === 401) {
            setTeacher(null);
            setAuthStatus("unauthenticated");
        }

        throw error;
    }

}, []);


// ---------------- CALCULATE TOTAL ATTEMPTS ----------------

const totalAttemptsOfExams = (exams) => {

    return exams.reduce(
        (total, exam) => {
            return total + (Number(exam.totalAttempts) || 0);
        },
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
            const authenticated = await fetchTeacherData();

            if (!isMounted) return;

            // Stop if not authenticated
            if (!authenticated) return;

            // Fetch dashboard data
            await fetchCreatedExams();

        } catch (error) {

            console.error("Dashboard loading error:", error);

            if (isMounted) {

                setDashboardError(
                    "Unable to load dashboard. Please try again."
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

}, [fetchTeacherData, fetchCreatedExams]);


// ---------------- UPDATE TOTAL ATTEMPTS ----------------

// No loading state required here.
// This calculation happens immediately whenever exams change.

useEffect(() => {

    setTotalAttempts(
        totalAttemptsOfExams(recentExams)
    );

}, [recentExams]);


// ---------------- CONDITIONAL RENDERING ----------------

// 1. Loading
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


// 3. API error
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


// 4. Your existing dashboard JSX goes below

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
