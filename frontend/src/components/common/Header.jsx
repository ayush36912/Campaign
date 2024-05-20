import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', {replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleAddCampaignClick = () => {
    // Perform any additional logic if needed
    // Reload the page
    //window.location.reload('/createcampign');
  };

  return (
    <header>
        <nav className="navbar navbar-expand-lg navbar-dark px-3" style={{ backgroundColor: '#ff8a00' }}>
          <NavLink to="/" className="navbar-brand">
            <span>My app</span>
          </NavLink>
          <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" className="nav-link">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="campaigns" className="nav-link">Campaigns</NavLink>
            </li>
            {(isLoggedIn && user) ? (
              <>
            <li className="nav-item">
              <NavLink to="enrolledCampaigns" className="nav-link">Enrolled Campaigns</NavLink>
            </li>
            </>
            ):(<></>)}
            {(isLoggedIn && user && user.email === 'niralipatel13006@gmail.com') ? (
              <>
            <li className="nav-item">
              <NavLink to="createcampaign" className="nav-link" onClick={handleAddCampaignClick}>Add Campaign</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="updatecampaign" className="nav-link">Update Campaign</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="deleteUser" className="nav-link">Delete User</NavLink>
            </li>
            </>
            ):(<></>)}
            </ul>
            <ul className="navbar-nav">
            {isLoggedIn ? (
            <>
              <li className="nav-item">
                <button className="nav-link" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
            <li className="nav-item">
              <NavLink to="login" className="nav-link">Login</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="signup" className="nav-link">SignUp</NavLink>
            </li>
             </>
             )}
          </ul>
          </div>
        </nav>
    </header>
  )
}

export default Header
