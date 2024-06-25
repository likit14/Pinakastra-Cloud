// DeploymentOptions.js
import React, { useState } from 'react';
import Sidebar from '../Components/sidebar';
import '../Styles/DeploymentOptions.css'; // Import the CSS file
import Footer from '../Components/footer';

const DeploymentOptions = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    setSelectedOption(option === selectedOption ? null : option); // Toggle selection
  };

  const handleNextClick = () => {
    // Handle next button click action here
    console.log("Next button clicked");
  };

  return (
    <div className="container">
      <Sidebar>
        <div className="sidebar-content">
          {/* Add sidebar-specific content here if needed */}
        </div>
      </Sidebar>
      <div className="main-content">
        <h1>Deployment Options 🚀</h1>
        <div className="options-container">
          <div
            className={`option-box ${selectedOption === "Standalone Cloud Setup" ? 'selected' : ''}`}
            onClick={() => handleOptionClick("Standalone Cloud Setup")}
          >
            <div className="option">
              <div className="option-content">
                <div className="option-text">Standalone Cloud Setup</div>
              </div>
            </div>
          </div>
          <div
            className={`option-box ${selectedOption === "Distributed Cloud Setup" ? 'selected' : ''}`}
            onClick={() => handleOptionClick("Distributed Cloud Setup")}
          >
            <div className="option">
              <div className="option-content">
                <div className="option-text">Distributed Cloud Setup</div>
              </div>
            </div>
          </div>
        </div>
        <button className="nextButton" onClick={handleNextClick} disabled={!selectedOption}>
          Next
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default DeploymentOptions;
