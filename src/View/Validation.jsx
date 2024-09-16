import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from "../Styles/Validation.module.css";

const Validation = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [validatingNode, setValidatingNode] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedNodes } = location.state || { selectedNodes: [] };

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

    const handleBack = () => {
        navigate(-1);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleCheckboxChange = (event, node) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, node]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.ip !== node.ip));
        }
    };

    const handleDeploy = () => {
        navigate('/designatednode', { state: { selectedNodes: selectedRows } });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const paginatedNodes = selectedNodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            <div className={styles.header}>
                <button className={styles["back-button"]} onClick={handleBack}>
                    <FontAwesomeIcon icon={faArrowLeft} size="2x" />
                </button>
                <center>
                    <h1>Validation</h1>
                </center>
            </div>
            <div className={styles.main}>
                <div className={styles["data-table-container"]}>
                    <div className={styles.container}>
                        <div>
                            <table className={styles["data-table"]}>
                                <thead>
                                    <tr>
                                        <th>Sl No.</th>
                                        <th>IP Address</th>
                                        <th>Validate</th>
                                        <th>Validation Result</th>
                                        <th>Info</th>
                                        <th>Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedNodes.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className={styles["no-device-message"]}><center>No devices selected</center></td>
                                        </tr>
                                    ) : (
                                        paginatedNodes.map((node, index) => (
                                            <tr key={node.ip}>
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td>{node.ip}</td>
                                                <td>
                                                    <button 
                                                        disabled={validatingNode !== null && validatingNode.ip === node.ip}
                                                        onClick={() => validateNode(node)}
                                                    >
                                                        {validatingNode !== null && validatingNode.ip === node.ip ? 'Validating...' : 'Validate'}
                                                    </button>
                                                </td>
                                                <td style={{ color: 'red', fontFamily: 'Arial, sans-serif' }}>
                                                    {validationResults[node.ip] ? validationResults[node.ip].status : 'Not validated'}
                                                </td>
                                                <td>
                                                    {validationResults[node.ip] && validationResults[node.ip].status === 'failure' && (
                                                        <button onClick={() => alert(validationResults[node.ip].message)}>Info</button>
                                                    )}
                                                </td>
                                                <td className={styles["checkbox-column"]}>
                                                    <label className={styles["checkbox-label"]}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.some(row => row.ip === node.ip)}
                                                            onChange={(event) => handleCheckboxChange(event, node)}
                                                        />
                                                        <span className={styles["checkbox-custom"]}></span>
                                                    </label>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div className={styles.pagination}>
                                {Array.from({ length: Math.ceil(selectedNodes.length / itemsPerPage) }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={styles[currentPage === i + 1 ? 'active' : '']}
                                    >
                                        {i + 1}
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

export default Validation;
