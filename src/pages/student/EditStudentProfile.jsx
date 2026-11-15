
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import StudentSidebar from "../../components/StudentSidebar";
import AfterLogout from "../../components/AfterLogout";
import "../../styles/EditStudentProfile.css";


function EditStudentProfile() {

    const navigate = useNavigate();

    const [student, setStudent] = useState({});

    const [formData, setFormData] = useState({
        fullName: "",
        email: ""
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // Fetch current student information
    const fetchStudentData = async () => {

        try {

            const response = await axios.get(
                "/api/v1/student/dashboard"
            );

            const studentData = response.data.data;

            setStudent(studentData);

            setFormData({
                fullName: studentData.fullName || "",
                email: studentData.email || ""
            });

            setIsAuthenticated(true);

        } catch (error) {

            console.error("Error fetching student:", error);

            if (error.response?.status === 401) {
                setIsAuthenticated(false);
            } else {
                setError("Unable to load your profile. Please try again.");
            }

        } finally {

            setIsLoading(false);

        }

    };


    useEffect(() => {
        fetchStudentData();
    }, []);


    // Handle input changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");

    };


    // Handle profile update
    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const fullName = formData.fullName.trim();
        const email = formData.email.trim().toLowerCase();

        if (!fullName || !email) {
            setError("All fields are required.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (fullName.length < 3) {
            setError("Full name must contain at least 3 characters.");
            return;
        }

        try {

            setIsSaving(true);

            const response = await axios.post(
                "/api/v1/student/update-profile",
                {
                    fullName,
                    email
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {

                const updatedStudent = response.data.data;

                setStudent(updatedStudent);

                setFormData({
                    fullName: updatedStudent.fullName,
                    email: updatedStudent.email
                });

                setSuccess("Your profile has been updated successfully.");

            }
            navigate(`/student/${response.data.data.username}/profile`)

        } catch (error) {

            console.error("Profile update error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to update your profile. Please try again."
            );

        } finally {

            setIsSaving(false);

        }

    };

   

    // Loading screen
    if (isLoading) {
        return (
            <div className="edit-profile-loading">
                Loading your profile...
            </div>
        );
    }


    // Authentication check
    if (!isAuthenticated && !isLoading) {
        return <AfterLogout role="student" />;
    }


    return (

        <div className="student-layout">

            <StudentSidebar />

            <main className="student-main edit-profile-main">

                {/* Header */}

                <header className="edit-profile-header">

                    <div>
                        <h1>Edit Profile</h1>

                        <p>
                            Update your personal information
                        </p>
                    </div>

                    <Link
                        to={`/student/${student.username}/profile`}
                        className="edit-back-link"
                    >
                        ← Back to Profile
                    </Link>

                </header>


                {/* Profile Form */}

                <section className="edit-profile-card">

                    <div className="edit-profile-top">

                        <div className="edit-profile-avatar">
                            {student.fullName?.[0]?.toUpperCase()}
                        </div>

                        <div>
                            <h2>{student.fullName}</h2>
                            <p>{student.role}</p>
                        </div>

                    </div>


                    <div className="edit-profile-divider"></div>


                    <form onSubmit={handleSubmit}>

                        <div className="edit-form-heading">
                            <h3>Personal Information</h3>

                            <p>
                                Update the information associated with your account.
                            </p>
                        </div>


                        {/* Full Name */}

                        <div className="edit-form-group">

                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                maxLength={60}
                                required
                            />

                        </div>


                        {/* Email */}

                        <div className="edit-form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                required
                            />

                        </div>


                        {/* Username */}

                        <div className="edit-form-group">

                            <label htmlFor="username">
                                Username
                            </label>

                            <input
                                type="text"
                                id="username"
                                value={student.username || ""}
                                readOnly
                            />

                            <span className="edit-field-hint">
                                Username cannot be changed.
                            </span>

                        </div>


                        {/* Roll Number */}

                        <div className="edit-form-group">

                            <label htmlFor="rollNumber">
                                Roll Number
                            </label>

                            <input
                                type="text"
                                id="rollNumber"
                                value={student.rollNumber || ""}
                                readOnly
                            />

                            <span className="edit-field-hint">
                                Roll number is assigned during registration.
                            </span>

                        </div>


                        {/* Messages */}

                        {error && (
                            <div className="edit-message error-message">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="edit-message success-message">
                                {success}
                            </div>
                        )}


                        {/* Form Actions */}

                        <div className="edit-profile-actions">

                            <button
                                type="button"
                                className="edit-cancel-btn"
                                onClick={() => navigate(
                                    `/student/${student.username}/profile`
                                )}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="edit-save-btn"
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? "Saving Changes..."
                                    : "Save Changes"
                                }
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>

    );

}

export default EditStudentProfile;
