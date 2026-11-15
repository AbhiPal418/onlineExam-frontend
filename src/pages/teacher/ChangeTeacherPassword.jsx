import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import "../../styles/ChangePassword.css";
import axios from "axios";
import TeacherSidebar from "../../components/TeacherSidebar";
import AfterLogout from "../../components/AfterLogout";

const ChangeTeacherPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // const[username,setusername] = useState("");
    // const username =location.state?.username;

    const [username,setUsername] = useState();
    const fetchUsename = async()=>{
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/v1/teacher/dashboard`);
            setUsername(response.data.data.username);
            setIsLoading(false)
            
        } catch (error) {
            console.error("Error fetching user name inside change password",error)
        }
    }

    useEffect(()=>{
        setIsLoading(true);
        fetchUsename();
        setIsLoading(false);
    })
    // console.log(username)
    const [isLoading,setIsLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

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
        setIsLoading(true);
        const response = await axios.patch("/api/v1/teacher/change-password", {
          currentPassword,
          newPassword
        });

        setIsLoading(false);
     
        alert("Password changed successfully!");

        navigate(`/teacher/${username}/profile`);
    };


    if(isLoading){
        return (
            <div className="loading">
                <p>Loading.......</p>
            </div>
        )
    }


    console.log("Hello",username)
    if(!username && !isLoading){
        return(
            <AfterLogout role="teacher"/>
        )
    }
    return (
        <div className="student-page">
            <TeacherSidebar />

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
                                            "password"
                                        }
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your current password"
                                    />

                                    
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
                                            "password"
                                        }
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your new password"
                                    />

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
                                           "password"
                                        }
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your new password"
                                    />

                        
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
                                        navigate(`/teacher/${username}/profile`)
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

export default ChangeTeacherPassword;