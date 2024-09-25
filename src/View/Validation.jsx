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
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/set_pxe_boot', bmcDetails);
            console.log(bmcDetails);
            
            // Comparison logic
            const comparisonResults = compareSpecs(validationData, requirementData);
    
            // Store results in validationResults
            setValidationResults(prevResults => ({
                ...prevResults,
                [currentNode.ip]: {
                    status: 'PXE Boot on Progress',
                    cpuCoresPassed: comparisonResults.cpuCoresPassed,
                    memoryPassed: comparisonResults.memoryPassed
                }
            }));
    
            Swal.fire({
                title: 'Success',
                text: 'Validation Done',
                confirmButtonText: 'OK',
                confirmButtonColor: '#28a745',
            });
    
            setBmcFormVisible(false);
            setFormSubmitted(true);
        } catch (error) {
            console.error('Error setting PXE boot:', error);
    
            Swal.fire({
                title: 'Failed',
                text: 'Failed to set PXE boot. Please try again.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545'
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
           // Check if the validation results exist for the current node
    if (!validationResults || !currentNode || !validationResults[currentNode.ip]) {
        Swal.fire({
            // icon: 'error',
            title: 'Error',
            text: 'Validation not done or BMC details are incorrect. Please check and try again.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc3545'
        });
        return;
    }

    // Get the current validation result for the node
    const result = validationResults[currentNode.ip];

    // // Check if the necessary validation data exists
    // if (!result || !result.cpuCoresPassed || !result.memoryPassed) {
    //     Swal.fire({
    //         // icon: 'error',
    //         title: 'Error',
    //         text: 'Validation data is missing or incomplete. Please ensure the validation is complete.',
    //         confirmButtonText: 'OK',
    //         confirmButtonColor: '#dc3545'
    //     });
    //     return;
    // }

        // Fetch min requirements and result values
        const minCpuCores = requirementData.cpu_cores;
        const minMemory = requirementData.memory;
    
        const validationCpuCores = validationData.cpu_cores;
        const validationMemory = validationData.memory;
    
        // Determine heading color based on status
        const headingColor = result.cpuCoresPassed && result.memoryPassed ? "#28a745" : "#dc3545";
        
        // Create HTML message with Min Req Value and Result Value
        const msg = `
            <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; color: ${headingColor};">
                TEST RESULT: ${result.cpuCoresPassed && result.memoryPassed ? "PASSED" : "FAILED"}
            </h1>
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
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minCpuCores}</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationCpuCores}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">RAM</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${minMemory}</td>
                            <td style="border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 1rem;">${validationMemory}</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
        
        // Display the Swal modal
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
    const compareSpecs = (validationData, requirementData) => {
        const validationMemory = parseInt(validationData.memory.replace(" Gi", ""));
        const validationCpuCores = parseInt(validationData.cpu_cores);
    
        const minCpuCores = requirementData.cpu_cores;
        const minMemory = parseInt(requirementData.memory.replace(" Gi", ""));
    
        return {
            cpuCoresPassed: validationCpuCores >= minCpuCores,
            memoryPassed: validationMemory >= minMemory
        };
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
                                        <th>Validation Status</th>
                                        <th>Result</th>
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
