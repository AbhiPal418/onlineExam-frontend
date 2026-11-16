import { useEffect, useState } from "react";
import StudentSidebar from "../../components/StudentSidebar";
import "../../styles/StudentProfile.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AfterLogout from "../../components/AfterLogout";


const StudentProfile = () => {
    

    const navigate = useNavigate();
    const [student, setStudent] = useState({});
    const [email, setEmail] = useState("");
    const [rollNumber, setRoleNumber] = useState("");
    const [isLoading,setIsLoading]  = useState(false)


    const fetchStudentData = async () => {
        try {
            setIsLoading(true)
            const response = await axios.get("/api/v1/student/dashboard");
            setStudent(response.data.data);
            setEmail(response.data.data.email)
            setRoleNumber(response.data.data.rollNumber)
            setIsLoading(false)
        } catch (error) {
            console.error("Error fetching student data:", error);
        }
    };


    useEffect(() => {
        setIsLoading(true);
        fetchStudentData();
        setIsLoading(false);
    }, []);

    const handleEditProfile = async()=>{
        navigate(`/student/${student.username}/edit-profile`)
    }

    if(isLoading){
        return(
            <div className="loading-data">
                <p>Loading.......</p>
            </div>
        )
    }
    if (!student && !isLoading) {
        return <AfterLogout role="student" />;
    }


    return (
        <div className="student-page">
            <StudentSidebar />

            <main className="student-main">
                {/* Header */}
                <div className="profile-page-header">
                    <div>
                        <h1>My Profile</h1>
                        <p>View and manage your student information</p>
                    </div>
                </div>

                {/* Profile Overview */}
                <section className="profile-overview">
                    <div className="profile-avatar">
                        {student.fullName?.[0]?.toUpperCase()}
                    </div>

                    <div className="profile-main-info">
                        <p>@{student.username}</p>

                        <span className="student-role">
                            {student.role}
                        </span>
                    </div>

                    <button className="edit-profile-btn" onClick={()=>handleEditProfile()}>
                        Edit Profile
                    </button>
                </section>

                {/* Profile Content */}
                <div className="profile-content">

                    {/* Personal Information */}
                    <section className="profile-card">
                        <div className="card-header">
                            <h3>Personal Information</h3>
                        </div>

                        <div className="profile-details">

                            <div className="detail-item">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">
                                    {student.fullName}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Username</span>
                                <span className="detail-value">
                                    @{student.username}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">
                                    {student.email}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Roll Number</span>
                                <span className="detail-value">
                                    {student.rollNumber}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Account Type</span>
                                <span className="detail-value">
                                    {student.role}
                                </span>
                            </div>

                            <div className="detail-item">
                                <span className="detail-label">Joined On</span>
                                <span className="detail-value">
                                    {new Date(student.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                        </div>
                    </section>

                    {/* Exam Statistics */}
                    <section className="profile-card">
                        <div className="card-header">
                            <h3>Exam Statistics</h3>
                        </div>

                        <div className="profile-stats">

                            <div className="profile-stat">
                                <div>
                                    <span className="stat-value">
                                        {student.attemptedExams?.length}
                                    </span>
                                    <span className="stat-label">
                                        Attempted Exams
                                    </span>
                                </div>
                            </div>


                            <div className="profile-stat">
                                {/* <div className="stat-icon">📊</div> */}
                                <div>
                                    <span className="stat-value">
                                        {student.averageScore}%
                                    </span>
                                    <span className="stat-label">
                                        Average Score
                                    </span>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Account Security */}
                    <section className="profile-card">
                        <div className="card-header">
                            <h3>Account & Security</h3>
                        </div>

                        <div className="security-row">
                            <div>
                                <strong>Password</strong>
                                <p>
                                    Your password is securely protected.
                                </p>
                            </div>

                            <Link to={`/student/${student.username}/change-password`}>
                                <button className="change-password-btn" >
                                    Change Password
                                </button>
                            </Link>
                        </div>

                        <div className="security-row">
                            <div>
                                <strong>Account Status</strong>
                                <p>
                                    Your student account is currently active.
                                </p>
                            </div>

                            <span className="account-status">
                                Active
                            </span>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default StudentProfile;