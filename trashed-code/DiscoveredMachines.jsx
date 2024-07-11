

import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../Components/sidebar';
import Footer from '../Components/footer';

import '../Styles/DiscoveredMachines.css'; // Import your CSS file for styling

const NetworkScanner = () => {
    const [nodes, setNodes] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [imagePath, setImagePath] = useState('');

    const scanNetwork = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:6000/scan');
            setNodes(response.data);
            setValidationResults({});
        } catch (error) {
            console.error('Error scanning network:', error);
        }
    };

    // const validateNode = async (node) => {
    //     try {
    //         const response = await axios.post('http://127.0.0.1:5000/validate', { ip: node.ip });
    //         setValidationResults(prevResults => ({
    //             ...prevResults,
    //             [node.ip]: response.data
    //         }));
    //     } catch (error) {
    //         console.error('Error validating node:', error);
    //         setValidationResults(prevResults => ({
    //             ...prevResults,
    //             [node.ip]: { status: 'fail', message: 'Validation failed due to an error.' }
    //         }));
    //     }
    // };

    // const handleCheckboxChange = (event, row) => {
    //     const isChecked = event.target.checked;
    //     if (isChecked) {
    //         setSelectedRows([...selectedRows, row]);
    //     } else {
    //         setSelectedRows(selectedRows.filter(selectedRow => selectedRow.ip !== row.ip));
    //     }
    // };

    // const handlePxeBoot = async () => {
    //     try {
    //         const response = await axios.post('http://127.0.0.1:5000/pxe-boot', {
    //             ip: selectedRows[0].ip, // Assume first selected node for simplicity
    //             image_path: imagePath
    //         });
    //         alert(response.data.message);
    //     } catch (error) {
    //         console.error('Error triggering PXE boot:', error);
    //     }
    // };

    // const handleDeploy = () => {
    //     console.log('Deploying:', selectedRows);
    //     // Implement actual deployment logic here, e.g., call an API
    // };

    return (
        <div className="data-table-container">
            <h1>Discovered Machines</h1>
            <div className="container">
                <button onClick={scanNetwork}>Scan Network</button>
                {nodes.length > 0 && (
                    <div>
                        <h3>Discovered Nodes</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sl No.</th>
                                    <th>IP Address</th>
                                    <th>Hostname</th>
                                    <th>Last Seen</th>
                                    <th>Validate</th>
                                    <th>Validation Result</th>
                                    <th>Info</th>
                                    <th>Deployment<br />Section</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nodes.map((node, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{node.ip}</td>
                                        <td>{node.hostname}</td>
                                        <td>{node.last_seen}</td>
                                        <td>
                                        <button >Validate</button>
                                            
                                            {/* <button onClick={() => validateNode(node)}>Validate</button> */}
                                        </td>
                                        <td>
                                            {validationResults[node.ip] ? validationResults[node.ip].status : 'Not validated'}
                                        </td>
                                        <td>
                                            {validationResults[node.ip] && validationResults[node.ip].status === 'fail' && (
                                                <button onClick={() => alert(validationResults[node.ip].message)}>Info</button>
                                            )}
                                        </td>
                                        <td>
                                            {/* <input type="checkbox" onChange={(event) => handleCheckboxChange(event, node)} /> */}
                                            {/* Deploy */}
                                            <input type="checkbox"/>
                                            Deploy

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {selectedRows.length > 0 && (
                            <div>
                                <h3>Selected Node: {selectedRows[0].ip}</h3>
                                <input
                                    type="text"
                                    value={imagePath}
                                    onChange={(e) => setImagePath(e.target.value)}
                                    placeholder="Enter PXE boot image path"
                                />
                                <button >PXE Boot</button>
                                {/* <button onClick={handlePxeBoot}>PXE Boot</button> */}
                            </div>
                        )}
                    </div>
                )}
                <Sidebar />
                <Footer />
                {/* <button
                    className="button-deploy"
                    onClick={handleDeploy}
                    disabled={selectedRows.length === 0}
                >
                    
                </button> */}
            </div>
        </div>
    );
};

export default NetworkScanner;






import React, { useState } from 'react';
import Sidebar from '../Components/sidebar';
import Footer from '../Components/footer';
import axios from 'axios';

import '../Styles/DiscoveredMachines.css'; // Import your CSS file for styling

const DataTable = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [imagePath, setImagePath] = useState('');

    const scanNetwork = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/scan');
            setNodes(response.data);
            setValidationResults({});
        } catch (error) {
            console.error('Error scanning network:', error);
        }
    };

    const handleCheckboxChange = (event, node) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, node]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.ip !== node.ip));
        }
    };

    const validateNode = async (node) => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/validate', { ip: node.ip });
            setValidationResults(prevResults => ({
                ...prevResults,
                [node.ip]: response.data
            }));
        } catch (error) {
            console.error('Error validating node:', error);
            setValidationResults(prevResults => ({
                ...prevResults,
                [node.ip]: { status: 'failure', message: 'Validation failed due to an error.' }
            }));
        }
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
                <button onClick={scanNetwork}>Scan Network</button>
                {nodes.length > 0 && (
                    <div>
                        <h3>Discovered Nodes</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sl No.</th>
                                    <th>IP Address</th>
                                    <th>Hostname</th>
                                    <th>Last Seen</th>
                                    <th>Validate</th>
                                    <th>Validation Result</th>
                                    <th>Info</th>
                                    <th>Deployment<br />Section</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nodes.map((node, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{node.ip}</td>
                                        <td>{node.hostname}</td>
                                        <td>{node.last_seen}</td>
                                        <td>
                                            <button onClick={() => validateNode(node)}>Validate</button>
                                        </td>
                                        <td style={{ color: 'green', fontFamily: 'Arial, sans-serif' }}>
                                            {validationResults[node.ip] ? validationResults[node.ip].status : 'Not validated'}
                                        </td>
                                        <td>
                                            {validationResults[node.ip] && validationResults[node.ip].status === 'fail' && (
                                                <button onClick={() => alert(validationResults[node.ip].message)}>Info</button>
                                            )}
                                        </td>
                                        <td>
                                            <input type="checkbox" onChange={(event) => handleCheckboxChange(event, node)} />
                                            Deploy
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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