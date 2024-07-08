import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/sidebar';
import Footer from '../Components/footer';
import '../Styles/Datatable.css'; // Import your CSS file for styling

const DataTable = () => {
    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Replace 'http://your-python-backend-url/api/data' with your actual API endpoint
            const response = await fetch('http://your-python-backend-url/api/data');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const jsonData = await response.json();
            setData(jsonData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCheckboxChange = (event, row) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, row]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.id !== row.id));
        }
    };

    const handleValidate = async (rowData) => {
        try {
            // Replace 'http://your-python-backend-url/api/validate' with your validation endpoint
            const response = await fetch('http://your-python-backend-url/api/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rowData),
            });
            if (!response.ok) {
                throw new Error('Validation failed');
            }
            const updatedData = await response.json();
            setData(updatedData); // Assuming the backend returns updated data after validation
        } catch (error) {
            console.error('Error validating:', error);
        }
    };

    const handleDeploy = async () => {
        try {
            // Replace 'http://your-python-backend-url/api/deploy' with your deployment endpoint
            const response = await fetch('http://your-python-backend-url/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedRows),
            });
            if (!response.ok) {
                throw new Error('Deployment failed');
            }
            console.log('Deployment successful');
            // Implement further actions based on successful deployment
        } catch (error) {
            console.error('Error deploying:', error);
        }
    };

    return (
        <div className="data-table-container">
            <h1>Discovery Machines</h1>
            <div className="container">
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
                                <td>{row.validationStatus || '-'}</td>
                                <td>
                                    <input type="checkbox" onChange={(event) => handleCheckboxChange(event, row)} />
                                    {row.deploymentSection}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Sidebar />
                <Footer />
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