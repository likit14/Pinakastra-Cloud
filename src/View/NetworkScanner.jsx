import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import '../Styles/NetworkScanner.css';

const DataTable = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [validationResults, setValidationResults] = useState({});

    useEffect(() => {
        scanNetwork();
    }, []);

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

    const handleRefresh = () => {
        scanNetwork();
    };

    return (
        <div>
            <div className='header'>
                <center><h1>Discovered Machines</h1></center>
                <button className='button' onClick={handleRefresh}>
                    <FontAwesomeIcon icon={faSync} />
                </button>
            </div>
            <div className='main'>
                <div className="data-table-container">
                    <div className="container">
                        {nodes.length > 0 && (
                            <div>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Sl <br></br>No.</th>
                                            <th>IP Address</th>
                                            <th>Hostname</th>
                                            <th>Last <br></br>Seen</th>
                                            <th>Validate</th>
                                            <th>Validation <br></br>Result</th>
                                            <th>Info</th>
                                            <th>Deploy</th>
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
                                                    {validationResults[node.ip] && validationResults[node.ip].status === 'failure' && (
                                                        <button onClick={() => alert(validationResults[node.ip].message)}>Info</button>
                                                    )}
                                                </td>
                                                <td className="checkbox-column">
                                                    <input type="checkbox" onChange={(event) => handleCheckboxChange(event, node)} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <Sidebar />
                        {/* <Footer /> */}
                        {/* <button
                            className="button-deploy"
                            onClick={handleDeploy}
                            disabled={selectedRows.length === 0}
                        >
                            Deploy
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
