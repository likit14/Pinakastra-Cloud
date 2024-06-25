import React from 'react';
import { Link } from 'react-router-dom';
import img1 from '../Images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faArrowUp, faArrowDown, faCog } from '@fortawesome/free-solid-svg-icons';
import '../Styles/Sidebar.css'; // Ensure to have Sidebar.css for styling

const Sidebar = ({ children }) => {

  return (
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
    );
};

export default Sidebar;
