
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function TeacherSidebar() {

    const location = useLocation();
    const navigate = useNavigate();

    const [teacher, setTeacher] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch teacher data
    const fetchTeacherData = async () => {
        try {
            const response = await axios.get("/api/v1/teacher/dashboard");
            setTeacher(response.data.data);
        } catch (error) {
            console.error("Error fetching teacher data:", error);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            const response = await axios.post("/api/v1/teacher/logout");

            if (response.data.success) {
                setShowModal(false);
                setIsOpen(false);

                navigate("/login", {
                    state: {
                        role: "teacher"
                    }
                });
            }

        } catch (error) {
            console.error("Error while logging out:", error);
        }
    };

    // Close sidebar when navigating
    const handleNavigation = () => {
        setIsOpen(false);
    };

    // Fetch teacher data when component mounts
    useEffect(() => {
        fetchTeacherData();
    }, []);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="menu-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Teacher Sidebar */}
            <aside className={`teacher-sidebar ${isOpen ? "show" : ""}`}>

                {/* Logo */}
                <div className="teacher-sidebar-logo">
                    <span>Test Zone</span>
                </div>

                {/* Sidebar Navigation */}
                <nav className="teacher-sidebar-menu">

                    <Link
                        to={`/teacher/${teacher.username}/dashboard`}
                        onClick={handleNavigation}
                        className={`teacher-sidebar-link ${
                            location.pathname === `/teacher/${teacher.username}/dashboard`
                                ? "active"
                                : ""
                        }`}
                    >
                        Dashboard
                    </Link>

                    <Link
                        to={`/teacher/${teacher.username}/create-exam`}
                        onClick={handleNavigation}
                        className={`teacher-sidebar-link ${
                            location.pathname === `/teacher/${teacher.username}/create-exam`
                                ? "active"
                                : ""
                        }`}
                    >
                        Create Exam
                    </Link>

                    <Link
                        to={`/teacher/${teacher.username}/my-exams`}
                        onClick={handleNavigation}
                        className={`teacher-sidebar-link ${
                            location.pathname === `/teacher/${teacher.username}/my-exams`
                                ? "active"
                                : ""
                        }`}
                    >
                        My Exams
                    </Link>

                    <Link
                        to={`/teacher/${teacher.username}/exam-results`}
                        onClick={handleNavigation}
                        className={`teacher-sidebar-link ${
                            location.pathname === `/teacher/${teacher.username}/exam-results`
                                ? "active"
                                : ""
                        }`}
                    >
                        Results
                    </Link>

                    <Link
                        to={`/teacher/${teacher.username}/profile`}
                        onClick={handleNavigation}
                        className={`teacher-sidebar-link ${
                            location.pathname === `/teacher/${teacher.username}/profile`
                                ? "active"
                                : ""
                        }`}
                    >
                        Profile
                    </Link>

                </nav>

                {/* Sidebar Bottom */}
                <div className="teacher-sidebar-bottom">

                    <button
                        onClick={() => setShowModal(true)}
                        className="logout-btn"
                    >
                        Logout
                    </button>

                </div>

            </aside>

            {/* Logout Confirmation Modal */}
            {showModal && (

                <div className="logout-modal-overlay">

                    <div className="logout-modal">

                        <h2>Logout</h2>

                        <p>
                            Are you sure you want to logout?
                        </p>

                        <div className="logout-modal-buttons">

                            <button
                                className="cancel-logout-btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirm-logout-btn"
                                onClick={handleLogout}
                            >
                                Yes, Logout
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}

export default TeacherSidebar;
