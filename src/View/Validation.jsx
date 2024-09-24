import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from "../Styles/Validation.module.css";
import Swal from 'sweetalert2';
import validationData from '../Comparison/sample.json'
import requirementData from '../Comparison/min_requirements.json'

const Validation = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [validationResults, setValidationResults] = useState({});
    const [validatingNode, setValidatingNode] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [bmcFormVisible, setBmcFormVisible] = useState(false);
    const [currentNode, setCurrentNode] = useState(null);
    const [bmcDetails, setBmcDetails] = useState({ ip: '', username: '', password: '' });
    const [scanResults, setScanResults] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const itemsPerPage = 4;
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedNodes } = location.state || { selectedNodes: [] };

    useEffect(() => {
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
        setBmcDetails({ ...bmcDetails, ip: node.ip });
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
        const validationMemory=validationData.memory.replace("Gi","")
        // if(validationData.cpu_cores>"4"&&validationMemory>"16"){
            
        // }
        try {
            const response = await axios.post('http://127.0.0.1:8000/set_pxe_boot', bmcDetails);
            console.log(bmcDetails)
            setValidationResults(prevResults => ({
                ...prevResults,
                [currentNode.ip]: { status: 'PXE Boot on Progress' }
            }));
            
            Swal.fire({
                // icon: 'success',
                title: 'Success',
                text: 'Enabled Network Boot',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745', // Custom button color
            });

            setBmcFormVisible(false);
            setFormSubmitted(true);
        } catch (error) {
            console.error('Error setting PXE boot:', error);

            Swal.fire({
                // icon: 'error',
                title: 'Failed',
                text: 'Failed to set PXE boot. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545' // Custom button color
            });

            setBmcFormVisible(false);
            setFormSubmitted(true);
        }
    };

    const handleCancel = () => {
        setBmcFormVisible(false);
        setValidatingNode(null);
    };

    const handleInfoButtonClick = () => {
        const msg = `
            <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; color: #28a745;">TEST RESULT: PASSED</h1>
            <div style="cursor: pointer; font-size: 1.1rem; color: #007bff; margin-bottom: 10px;" id="toggleReport">
                Detailed Report <span id="arrow" style="font-size: 1.1rem;">▼</span>
            </div>
            <div id="reportWrapper" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
                <table style="width:100%; border-collapse: collapse; margin-top: 10px; border-radius: 10px; overflow: hidden;">
                    <thead style="background-color: #f8f9fa;">
                        <tr>
                            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">PARAMETER</th>
                            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Min Req Value</th>
                            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 1rem;">Result Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">CPU Cores</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">4</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">8</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">RAM</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">8 GB</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">16 GB</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">Disk Count</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">2</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">3</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
    
        Swal.fire({
            confirmButtonText: 'OK',
            confirmButtonColor: '#17a2b8',
            html: msg,
            didRender: () => {
                const toggleButton = document.getElementById('toggleReport');
                const reportWrapper = document.getElementById('reportWrapper');
                const arrow = document.getElementById('arrow');
    
                toggleButton.addEventListener('click', () => {
                    if (reportWrapper.style.maxHeight === '0px') {
                        reportWrapper.style.maxHeight = reportWrapper.scrollHeight + 'px';
                        arrow.textContent = '▲';  // Change arrow to up arrow
                    } else {
                        reportWrapper.style.maxHeight = '0px';
                        arrow.textContent = '▼';  // Change arrow to down arrow
                    }
                });
            }
        });
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
        </div>
    );
};

export default Validation;
