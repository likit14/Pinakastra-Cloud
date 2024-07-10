import React, { useState } from 'react';
import Sidebar from '../Components/sidebar';
import Footer from '../Components/footer';

import '../Styles/DiscoveredMachines.css'; // Import your CSS file for styling

const DataTable = () => {
    // Example data, replace with actual data fetching logic
    const [selectedRows, setSelectedRows] = useState([]);

    const data = [
        { id: 1, slNo: 1, ipAddress: '192.168.1.1', hostname: 'example.com', deploymentSection: 'Deploy' },
        { id: 2, slNo: 2, ipAddress: '192.168.1.2', hostname: 'example.net', deploymentSection: 'Deploy' },
        // Add more data as needed
    ];

    const handleCheckboxChange = (event, row) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, row]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.id !== row.id));
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
        console.log('Deploying:', selectedRows);
        // Implement actual deployment logic here, e.g., call an API
    };

    return (
        <div className="data-table-container">
            <h1>Discovered Machines</h1>
            <div className="container">
                <div className="data-table-container">
                    {/* <h2>Data Table</h2> */}
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
                                    <td>
                                        <input type="checkbox" onChange={(event) => handleCheckboxChange(event, row)} />
                                        {row.deploymentSection}
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
                    disabled={selectedRows.length === 0}
                >
                    Deploy
                </button>
            </div>
        </div>
    );
};

export default DataTable;