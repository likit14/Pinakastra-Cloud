import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import Sidebar from '../Components/sidebar';
import Footer from '../Components/footer';

import '../Styles/DiscoveredMachines.css'; // Import your CSS file for styling

const DiscoveredMachines = () => {
    const navigate = useNavigate(); // Get navigate function from useNavigate

    // Example data, replace with actual data fetching logic
    const [selectedRow, setSelectedRow] = useState(null); // Track single selected row

    const data = [
        { id: 1, slNo: 1, ipAddress: '192.168.1.1', hostname: 'example.com', deploymentSection: 'Deploy' },
        { id: 2, slNo: 2, ipAddress: '192.168.1.2', hostname: 'example.net', deploymentSection: 'Deploy' },
        // Add more data as needed
    ];

    const handleCheckboxChange = (row) => {
        if (selectedRow && selectedRow.id === row.id) {
            setSelectedRow(null); // Unselect if already selected
        } else {
            setSelectedRow(row); // Select the row
        }
    };

    const handleValidate = (rowData) => {
        // Example: Simulate validation
        setTimeout(() => {
            const updatedData = data.map(item => {
                if (item.id === rowData.id) {
                    return { ...item, validationStatus: 'PASS' }; // Replace with actual validation result
                }
                return item;
            });
            console.log('Validation complete:', updatedData);
            // Update state or perform further actions based on validation
        }, 1000); // Simulate API delay
    };

    const handleDeploy = () => {
        // Example: Simulate deployment
        console.log('Deploying:', selectedRow);
        // Implement actual deployment logic here, e.g., call an API

        // Navigate to '/designatednodes' after deployment using navigate
        navigate('/designatednodes');
    };

    return (
        <div className="data-table-container">
            <h1>Discovered Machines</h1>
            <div className="container">
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>IP Address</th>
                                <th>Hostname</th>
                                <th>Designating<br />Validation</th>
                                <th>Result</th>
                                <th>Deployment<br />Section</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.slNo}</td>
                                    <td>{row.ipAddress}</td>
                                    <td>{row.hostname}</td>
                                    <td>
                                        <button onClick={() => handleValidate(row)}>Validate</button>
                                    </td>
                                    <td style={{ color: 'green', fontFamily: 'Arial, sans-serif' }}><b>PASS</b></td>
                                    <td className="checkbox-column">
                                        <label>
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange(row)}
                                                checked={selectedRow && selectedRow.id === row.id} // Check based on selectedRow state
                                            />
                                            <span>{row.deploymentSection}</span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Sidebar />
                <Footer />

                {/* Deploy button with external CSS class */}
                <button
                    className="button-deploy"
                    onClick={handleDeploy}
                    disabled={!selectedRow}
                >
                    Deploy
                </button>
            </div>
        </div>
    );
};

export default DiscoveredMachines;
