import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import img1 from '../Images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faArrowUp, faArrowDown, faCog, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Sidebar.css'; // Ensure to have Sidebar.css for styling

const Sidebar = ({ children }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userData,setUserData]=useState({})

  useEffect(()=>{
    const data=JSON.parse(localStorage.getItem('loginDetails')).data
    setUserData(data)
  },[])
  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  return (
    <div className="layout">
      <div className="user-profile" onClick={toggleProfileMenu}>
        <FontAwesomeIcon icon={faUser} className="profile-icon" />
        <span className="user-name">{userData.companyName}</span>
        {profileMenuOpen && (
          <div className="profile-menu">
            <button className="logout-button">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={img1} alt="Logo" className="logo-image" />
        </div>
        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard">
              <FontAwesomeIcon icon={faTachometerAlt} />
              <span className="menu-text">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/scaleup">
              <FontAwesomeIcon icon={faArrowUp} />
              <span className="menu-text">Scale Up</span>
            </Link>
          </li>
          <li>
            <Link to="/scaledown">
              <FontAwesomeIcon icon={faArrowDown} />
              <span className="menu-text">Scale Down</span>
            </Link>
          </li>
          <li>
            <Link to="/administration">
              <FontAwesomeIcon icon={faCog} />
              <span className="menu-text">Administration</span>
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
