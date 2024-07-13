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
    const [validatingNode, setValidatingNode] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const navigate = useNavigate();
    const [isRotating, setIsRotating] = useState(false);

    useEffect(() => {
        scanNetwork();
    }, []);

    const scanNetwork = async () => {
        setIsScanning(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/scan');
            setNodes(response.data);
            setValidationResults({});
        } catch (error) {
            console.error('Error scanning network:', error);
        } finally {
            setIsScanning(false);
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
            const response = await axios.post('http://127.0.0.1:8000/validate', { ip: node.ip });
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
            setValidatingNode(null);
        }
    };

    const handleRefresh = () => {
        scanNetwork();
        setIsRotating(true);
        setTimeout(() => {
            setIsRotating(false);
          }, 1000);
    };

    const handleDeploy = () => {
        navigate('/designatednodes', { state: { selectedNodes: selectedRows } });
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const paginatedNodes = nodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className='header'>
                <center><h1>Discovered Machines<button className={`button ${isRotating ? 'rotating' : ''}`} onClick={handleRefresh}>
          <FontAwesomeIcon icon={faArrowsRotate} size="2x" />
        </button></h1></center>
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
                                        <th>Device<br/>Type</th>
                                        <th>Validate</th>
                                        <th>Validation<br/>Result</th>
                                        <th>Info</th>
                                        <th>Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isScanning && (
                                        <tr>
                                            <td colSpan="8" className="scanning-message"><center>Scanning...</center></td>
                                        </tr>
                                    )}
                                    {!isScanning && nodes.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="no-device-message"><center>No device found</center></td>
                                        </tr>
                                    )}
                                    {!isScanning && paginatedNodes.map((node, index) => (
                                        <tr key={index}>
                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td>{node.ip}</td>
                                            <td>{node.hostname}</td>
                                            <td>{node.device_type}</td>
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
                            <div className="pagination">
                                {Array.from({ length: Math.ceil(nodes.length / itemsPerPage) }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={currentPage === i + 1 ? 'active' : ''}
                                    >
                                        {i + 1.}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="next-button"
                                onClick={handleDeploy}
                                disabled={selectedRows.length === 0}
                            >
                                <strong>Next</strong>
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
