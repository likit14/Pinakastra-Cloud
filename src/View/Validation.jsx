import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API requests
import Sidebar from '../Components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from "../Styles/Validation.module.css";
import StatusPopup from './StatusPopup'; // Import StatusPopup component

const Validation = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [validatingNode, setValidatingNode] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [bmcFormVisible, setBmcFormVisible] = useState(false);
    const [currentNode, setCurrentNode] = useState(null);
    const [bmcDetails, setBmcDetails] = useState({ ip: '', username: '', password: '' });
    const [scanResults, setScanResults] = useState([]); // State to store scan results
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessages, setPopupMessages] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false); // State to track form submission

    const itemsPerPage = 4;
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedNodes } = location.state || { selectedNodes: [] };

    useEffect(() => {
        // Fetch initial scan results when the component mounts
        fetchScanResults();
    }, []);

    const fetchScanResults = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/scan');
            setScanResults(response.data);
        } catch (error) {
            console.error('Error fetching scan results:', error);
        }
    };

    const validateNode = (node) => {
        setValidatingNode(node);
        setCurrentNode(node);
        setBmcDetails({ ...bmcDetails, ip: node.ip }); // Set the BMC IP to the current node's IP
        setBmcFormVisible(true);
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

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBmcFormSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/set_pxe_boot', bmcDetails);

            // Update the validation result for the current node
            setValidationResults(prevResults => ({
                ...prevResults,
                [currentNode.ip]: { status: 'PXE Boot on Progress' }
            }));

            const successMessage = { type: 'success', text: 'Enabled Network Boot' };
            setPopupMessages([successMessage]);
            setPopupVisible(true);
            setBmcFormVisible(false); // Hide the form after successful submission
            setFormSubmitted(true); // Set form submission status to true
        } catch (error) {
            console.error('Error setting PXE boot:', error);
            const errorMessage = { type: 'error', text: 'Failed to set PXE boot. Please try again.' };
            setPopupMessages([errorMessage]);
            setPopupVisible(true); // Show the popup on error
            setBmcFormVisible(false); // Hide the form after successful submission
            setFormSubmitted(true); // Set form submission status to true
        }
    };

    const handleCancel = () => {
        setBmcFormVisible(false); // Hide the form when canceled
        setValidatingNode(null); // Reset validating node state
    };

    const handlePopupClose = () => {
        setPopupVisible(false);
    };

    const handleInfoButtonClick = () => {
        setPopupVisible(true); // Show popup with the same messages
    };

    const paginatedNodes = selectedNodes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                                                        {validatingNode !== null && validatingNode.ip === node.ip ? 'Validating' : 'Validate'}
                                                    </button>
                                                </td>
                                                <td style={{ color: 'red', fontFamily: 'Arial, sans-serif' }}>
                                                    {validationResults[node.ip] ? validationResults[node.ip].status : 'Not validated'}
                                                </td>
                                                <td>
                                                    {(validationResults[node.ip] || formSubmitted) ? (
                                                        <button onClick={handleInfoButtonClick}>Info</button>
                                                    ) : null}
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

            {/* BMC Form */}
            <div className={`${styles["bmc-form"]} ${bmcFormVisible ? styles.visible : ''}`}>
                <h2><strong>Enter BMC Details for {currentNode?.ip}</strong></h2>
                <form onSubmit={handleBmcFormSubmit}>
                    <label>
                        BMC IP Address:
                        <input
                            type="text"
                            value={bmcDetails.ip}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, ip: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        BMC Username:
                        <input
                            type="text"
                            value={bmcDetails.username}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, username: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        BMC Password:
                        <input
                            type="password"
                            value={bmcDetails.password}
                            onChange={(e) =>
                                setBmcDetails({ ...bmcDetails, password: e.target.value })
                            }
                            required
                        />
                    </label>
                    <div>
                        <button type="submit">Submit</button>
                        <button type="button" className={styles["cancel-button"]} onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Status Popup */}
            <StatusPopup
                isVisible={popupVisible}
                statusMessages={popupMessages}
                onClose={handlePopupClose}
            />
        </div>
    );
};

export default Validation;
