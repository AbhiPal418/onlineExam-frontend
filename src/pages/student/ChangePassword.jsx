import { useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import "../../styles/ChangePassword.css";
import axios from "axios";
import AfterLogout from "../../components/AfterLogout";

const ChangePassword = () => {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [error, setError] = useState("");


    // Fetch username
    const fetchUsername = async () => {
        try {
            const response = await axios.get(
                "/api/v1/student/dashboard"
            );

            setUsername(response.data.data.username);
            setIsAuthenticated(true);

        } catch (error) {
            console.error("Error fetching username:", error);

            if (error.response?.status === 401) {
                setIsAuthenticated(false);
            } else {
                setError("Unable to load student information.");
            }

        } finally {
            setIsLoading(false);
        }
    };


    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };


    // Toggle password visibility
    const togglePassword = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };


    // Handle password change
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setError(
                "New password must be different from your current password."
            );
            return;
        }

        try {
            setIsSaving(true);

            const response = await axios.patch(
                "/api/v1/student/change-password",
                {
                    currentPassword,
                    newPassword,
                }
            );

            if (response.data.success) {
                alert("Password changed successfully!");

                navigate(`/student/${username}/profile`);
            }

        } catch (error) {
            console.error("Password change error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to change password. Please try again."
            );

        } finally {
            setIsSaving(false);
        }
    };


    // Fetch student information on mount
    useEffect(() => {
        fetchUsername();
    }, []);


    // Loading screen
    if (isLoading) {
        return (
            <div className="loading">
                <p>Loading.......</p>
            </div>
        );
    }


    // Authentication check
    if (!isAuthenticated) {
        return <AfterLogout role="student" />;
    }


    // Your change password JSX below


    return (
        <div className="student-page">
            <StudentSidebar />

            <main className="student-main change-password-main">
                {/* Header */}
                <div className="change-password-header">
                    <div>
                        <h1>Change Password</h1>
                        <p>
                            Update your password to keep your account secure.
                        </p>
                    </div>
                </div>

                <div className="change-password-wrapper">

                    {/* Form Card */}
                    <div className="password-card">

                        <div className="password-card-header">

                            <div>
                                <h2>Update Your Password</h2>
                                <p>
                                    Enter your current password and choose a new one.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="password-field">
                                <label htmlFor="currentPassword">
                                    Current Password
                                </label>

                                <div className="password-input-wrapper">
                                    <input
                                        id="currentPassword"
                                        type={
                                            showPassword.current
                                                ? "text"
                                                : "password"
                                        }
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your current password"
                                    />

                                    <button
                                        type="button"
                                        className="show-password-btn"
                                        onClick={() =>
                                            togglePassword("current")
                                        }
                                    >
                                        {showPassword.current ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <div className="password-field">
                                <label htmlFor="newPassword">
                                    New Password
                                </label>

                                <div className="password-input-wrapper">
                                    <input
                                        id="newPassword"
                                        type={
                                            showPassword.new
                                                ? "text"
                                                : "password"
                                        }
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your new password"
                                    />

                                    <button
                                        type="button"
                                        className="show-password-btn"
                                        onClick={() =>
                                            togglePassword("new")
                                        }
                                    >
                                        {showPassword.new ? "🙈" : "👁️"}
                                    </button>
                                </div>

                                <span className="password-hint">
                                    Password must contain at least 6 characters.
                                </span>
                            </div>

                            {/* Confirm Password */}
                            <div className="password-field">
                                <label htmlFor="confirmPassword">
                                    Confirm New Password
                                </label>

                                <div className="password-input-wrapper">
                                    <input
                                        id="confirmPassword"
                                        type={
                                            showPassword.confirm
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your new password"
                                    />

                                    <button
                                        type="button"
                                        className="show-password-btn"
                                        onClick={() =>
                                            togglePassword("confirm")
                                        }
                                    >
                                        {showPassword.confirm ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="password-error">
                                    {error}
                                </div>
                            )}

                            {/* Password Rules */}
                            <div className="password-rules">
                                <h4>Password Requirements</h4>

                                <ul>
                                    <li>At least 6 characters</li>
                                    <li>Do not use your old password</li>
                                    <li>Keep your password private</li>
                                </ul>
                            </div>

                            {/* Buttons */}
                            <div className="password-actions">
                                <button
                                    type="button"
                                    className="cancel-password-btn"
                                    onClick={() =>
                                        navigate(`/student/${username}/profile`)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="update-password-btn"
                                >
                                    Update Password
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>

        </div>
    );
};

export default ChangePassword;