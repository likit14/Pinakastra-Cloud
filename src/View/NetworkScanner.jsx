import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import '../Styles/NetworkScanner.css';

const DataTable = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [validatingNode, setValidatingNode] = useState(null); // Track which node is being validated
    const navigate = useNavigate();

    useEffect(() => {
        scanNetwork();
    }, []);

    const scanNetwork = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:7000/scan');
            setNodes(prevNodes => {
                const newNodes = response.data.filter(node => !prevNodes.some(prevNode => prevNode.ip === node.ip));
                return [...prevNodes, ...newNodes];
            });
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
        setValidatingNode(node);
        try {
            const response = await axios.post('http://127.0.0.1:7000/validate', { ip: node.ip });
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
        } finally {
            setValidatingNode(null); // Reset validatingNode state after validation
        }
    };

    const handleRefresh = () => {
        scanNetwork();
    };

    const handleDeploy = () => {
        navigate('/designatednodes', { state: { selectedNodes: selectedRows } });
    };

    return (
        <div>
            <div className='header'>
                <center><h1>Discovered Machines<button className='button' onClick={handleRefresh}><FontAwesomeIcon icon={faArrowsRotate} size="2x" /></button></h1></center>
            </div>
            <div className='main'>
                <div className="data-table-container">
                    <div className="container">
                        <div>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Sl<br/>No.</th>
                                        <th>IP Address</th>
                                        <th>Hostname</th>
                                        <th>Last<br/>Seen</th>
                                        <th>Validate</th>
                                        <th>Validation<br/>Result</th>
                                        <th>Info</th>
                                        <th>Select</th>
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
                                                <button
                                                    disabled={validatingNode !== null && validatingNode.ip === node.ip}
                                                    onClick={() => validateNode(node)}
                                                >
                                                    {validatingNode !== null && validatingNode.ip === node.ip ? 'Validating...' : 'Validate'}
                                                </button>
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
                            <button
                                className="next-button"
                                onClick={handleDeploy}
                                disabled={selectedRows.length === 0}
                            >
                                <strong>Next</strong>
                            </button>
                        </div>
                        <Sidebar />
                        {/* <footer/> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
