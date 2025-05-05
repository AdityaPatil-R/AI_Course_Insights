import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/NavBar.css";

export default function NavBar() {
    const { loggedIn, logout } = useContext(AuthContext);
    const navigate = useNavigate(); // Add navigate

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/'); // 👈 FORCE move to Home page
    };

    return (
        <div className="nav-bar">
            <ul className="nav-list">
                <li className="nav-items"><Link to="/">HOME</Link></li>

                {loggedIn && (
                    <>
                        <li className="nav-items"><Link to="/create">CREATE</Link></li>
                        <li className="nav-items"><Link to="/upload">UPLOAD</Link></li>
                        <li className="nav-items"><Link to="/insights">INSIGHTS</Link></li>
                        <li className="nav-items"><a href="/" onClick={handleLogout}>SIGN OUT</a></li>
                    </>
                )}

                {!loggedIn && (
                    <>
                        <li className="nav-items"><Link to="/login">LOGIN</Link></li>
                        <li className="nav-items"><Link to="/signup">SIGNUP</Link></li>
                    </>
                )}
            </ul>
        </div>
    );
}
