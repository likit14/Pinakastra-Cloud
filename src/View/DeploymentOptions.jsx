import React, { useState } from 'react';
import Sidebar from '../Components/sidebar';
const DeploymentOptions = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <Sidebar>
    <div className="container">
      <h1>Deployment Options</h1>
      <div className="options">
        <div className="option">
          <input
            type="radio"
            id="standalone"
            name="deployment"
            value="Standalone Cloud Setup"
            checked={selectedOption === "Standalone Cloud Setup"}
            onChange={handleOptionChange}
          />
          <label htmlFor="standalone">Standalone Cloud Setup</label>
        </div>
        <div className="option">
          <input
            type="radio"
            id="distributed"
            name="deployment"
            value="Distributed Cloud Setup"
            checked={selectedOption === "Distributed Cloud Setup"}
            onChange={handleOptionChange}
          />
          <label htmlFor="distributed">Distributed Cloud Setup</label>
        </div>
      </div>
      {selectedOption && <p>Selected Option: {selectedOption}</p>}
    </div>
    </Sidebar>
  );
};

export default DeploymentOptions;
