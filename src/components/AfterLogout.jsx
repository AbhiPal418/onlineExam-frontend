import { Link } from "react-router-dom";
import "../styles/AfterLogout.css";

function AfterLogout({ role }) {
    return (
        <div className="after-logout">
            <div className="logout-card">

                <h2>Session Expired</h2>

                <p>
                    You are no longer logged in.
                    Please log in again to access your {role} dashboard.
                </p>

                <Link to="/login" className="logout-login-btn">
                    Login to Continue
                </Link>

                <span className="logout-footer">
                    Your exams and data are safe.
                </span>

            </div>
        </div>
    );
}

export default AfterLogout;