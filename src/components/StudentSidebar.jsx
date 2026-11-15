
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";

function StudentSidebar() {

    const navigate = useNavigate();
    const location = useLocation();

    const [showModal, setShowModal] = useState(false);
    const [student, setStudent] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    // Fetch student information
    const fetchStudentData = async () => {
        try {
            const response = await axios.get("/api/v1/student/dashboard");
            setStudent(response.data.data);

        } catch (error) {
            console.error("Error fetching student data:", error);
        }
    };


    // Handle logout
    const handleLogout = async () => {

        try {
            setIsLoggingOut(true);

            const response = await axios.post("/api/v1/student/logout");

            if (response.data.success) {
                navigate("/login", {
                    replace: true,
                    state: {
                        role: "student"
                    }
                });
            }

        } catch (error) {

            console.error("Error while logging out:", error);
            setIsLoggingOut(false);

        }

    };


    // Fetch data on component mount
    useEffect(() => {
        fetchStudentData();
    }, []);


    // Check active route
    const isActive = (path) => location.pathname === path;


    return (

        <>

            {/* Mobile Menu Button */}
            <button
                className="menu-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle sidebar"
                aria-expanded={isOpen}
            >
                ☰
            </button>


            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}


            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? "show" : ""}`}>

                <div className="sidebar-logo">
                    <span>Test Zone</span>
                </div>


                <nav className="sidebar-menu">

                    {isOpen && (

                        <div className="sidebarlogo">

                            <span className="sidebar-logo-avatar">
                                {student.fullName?.[0]?.toUpperCase()}
                            </span>

                            <p>@{student.username}</p>

                        </div>

                    )}


                    <Link
                        to={`/student/${student.username}/dashboard`}
                        onClick={() => setIsOpen(false)}
                        className={`sidebar-link ${
                            isActive(`/student/${student.username}/dashboard`)
                                ? "active"
                                : ""
                        }`}
                    >
                        Dashboard
                    </Link>


                    <Link
                        to={`/student/${student.username}/available-exams`}
                        onClick={() => setIsOpen(false)}
                        className={`sidebar-link ${
                            isActive(`/student/${student.username}/available-exams`)
                                ? "active"
                                : ""
                        }`}
                    >
                        Available Exams
                    </Link>


                    <Link
                        to={`/student/${student.username}/results`}
                        onClick={() => setIsOpen(false)}
                        className={`sidebar-link ${
                            isActive(`/student/${student.username}/results`)
                                ? "active"
                                : ""
                        }`}
                    >
                        My Results
                    </Link>


                    <Link
                        to={`/student/${student.username}/profile`}
                        onClick={() => setIsOpen(false)}
                        className={`sidebar-link ${
                            isActive(`/student/${student.username}/profile`)
                                ? "active"
                                : ""
                        }`}
                    >
                        Profile
                    </Link>

                </nav>


                {/* Sidebar Bottom */}
                <div className="sidebar-bottom">

                    <button
                        onClick={() => setShowModal(true)}
                        className="logout-btn"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* Logout Modal - Rendered outside Sidebar */}
            {showModal && createPortal(

                <div
                    className="logout-modal-overlay"
                    onClick={() => !isLoggingOut && setShowModal(false)}
                >

                    <div
                        className="logout-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-title"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <h2 id="logout-title">
                            Logout
                        </h2>

                        <p>
                            Are you sure you want to logout?
                        </p>


                        <div className="logout-modal-buttons">

                            <button
                                className="cancel-logout-btn"
                                onClick={() => setShowModal(false)}
                                disabled={isLoggingOut}
                            >
                                Cancel
                            </button>


                            <button
                                className="confirm-logout-btn"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? "Logging out..." : "Yes, Logout"}
                            </button>

                        </div>

                    </div>

                </div>,

                document.body

            )}

        </>

    );

}

export default StudentSidebar;
