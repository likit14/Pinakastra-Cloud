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
        {/* Add Google Fonts import */}
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
          `}
        </style>

        <h1 >Deployment Options 🚀</h1>
        <div className="options-container">
          <div
            className={`option-box ${selectedOption === "Standalone Cloud Setup" ? 'selected' : ''}`}
            onClick={() => handleOptionClick("Standalone Cloud Setup")}
          >
            <div className="option">
              <div className="option-content front">
                <div  className="option-text"><b>Standalone Cloud Setup</b></div>
              </div>
              <div className="option-content back">
                <div className="option-text"><strong>A self-contained cloud infrastructure managed by a single node.</strong></div>
              </div>
            </div>
          </div>
          <div
            className={`option-box ${selectedOption === "Distributed Cloud Setup" ? 'selected' : ''}`}
            onClick={() => handleOptionClick("Distributed Cloud Setup")}
          >
            <div className="option">
              <div className="option-content front">
                <div className="option-text"><b>Distributed Cloud Setup</b></div>
              </div>
              <div className="option-content back">
                <div className="option-text"><strong>A Distributed cloud setup across multiple nodes.</strong></div>
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
