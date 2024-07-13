import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/sidebar';
import Footer from '../Components/footer';
import '../Styles/DesignatedNodes.css';

const DesignatedNodes = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedRows, setSelectedRows] = useState(location.state.selectedNodes || []);
    const [roles, setRoles] = useState(selectedRows.map((node, index) => ({
        id: index + 1,
        slNo: index + 1,
        ipAddress: node.ip,
        hostname: node.hostname,
        roles: []
    })));

    const [bmcFormVisible, setBmcFormVisible] = useState(false);
    const [currentNode, setCurrentNode] = useState(null);
    const [bmcDetails, setBmcDetails] = useState({
        ip: '',
        username: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [deploymentCompleted, setDeploymentCompleted] = useState(false);

    const handleCheckboxChange = (event, row, role) => {
        const isChecked = event.target.checked;
        const updatedRoles = roles.map(item => {
            if (item.id === row.id) {
                const rolesSet = new Set(item.roles);
                if (isChecked) {
                    rolesSet.add(role);
                } else {
                    rolesSet.delete(role);
                }
                return { ...item, roles: Array.from(rolesSet) };
            }
            return item;
        });
        setRoles(updatedRoles);

        const updatedSelectedRows = isChecked
            ? [...selectedRows, row]
            : selectedRows.filter(selectedRow => selectedRow.id !== row.id);
        setSelectedRows(updatedSelectedRows);
    };

    const handleDeploy = (node) => {
        setCurrentNode(node);
        setBmcFormVisible(true);
    };

    // const handleBmcFormSubmit = async (event) => {
    //     event.preventDefault();
    //     setLoading(true);

    //     // Simulate API call or actual deployment logic here
    //     try {
    //         // Example asynchronous operation (replace with actual logic)
    //         await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating a 2-second delay

    //         // Mark deployment as completed
    //         setDeploymentCompleted(true);

    //         // Optionally reset form state
    //         setBmcDetails({
    //             ip: '',
    //             username: '',
    //             password: ''
    //         });

    //         // Close the form after successful deployment
    //         setBmcFormVisible(false);

    //         // Navigate to deployment info page
    //         navigate('/deploymentinfo');
    //     } catch (error) {
    //         console.error('Deployment error:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleCancel = () => {
    //     setBmcFormVisible(false);
    //     setLoading(false);
    // };

    return (
        <div>
        <div className='headers'>
                <center><h1>Designated Nodes</h1></center>
        </div>
        <div className="data-table-container">
            {/* <h1></h1> */}
            <div className="container">
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>IP Address</th>
                                <th>Hostname</th>
                                <th>Roles</th>
                                <th>Deploy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.slNo}</td>
                                    <td>{row.ipAddress}</td>
                                    <td>{row.hostname}</td>
                                    <td className="checkbox-column">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={row.roles.includes('Compute')}
                                                onChange={(event) => handleCheckboxChange(event, row, 'Compute')}
                                            />
                                            <span>HCI</span>
                                        </label>
                                        <br />
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={row.roles.includes('Control')}
                                                onChange={(event) => handleCheckboxChange(event, row, 'Control')}
                                            />
                                            <span>Compute&Storage</span>
                                        </label>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDeploy(row)}>Deploy</button>
                                        {loading && currentNode && currentNode.id === row.id && (
                                            <div className="loader"></div>
                                        )}
                                        {deploymentCompleted && currentNode && currentNode.id === row.id && (
                                            <div className="completed">Completed</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <Sidebar />
                <Footer />

                {/* BMC Form */}
                {/* {bmcFormVisible && (
                    <div className="bmc-form">
                        <h2>Enter BMC Details for {currentNode.hostname}</h2>
                        <form onSubmit={handleBmcFormSubmit}>
                            <label>
                                BMC IP Address:
                                <input
                                    type="text"
                                    value={bmcDetails.ip}
                                    onChange={(e) => setBmcDetails({ ...bmcDetails, ip: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                BMC Username:
                                <input
                                    type="text"
                                    value={bmcDetails.username}
                                    onChange={(e) => setBmcDetails({ ...bmcDetails, username: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                BMC Password:
                                <input
                                    type="password"
                                    value={bmcDetails.password}
                                    onChange={(e) => setBmcDetails({ ...bmcDetails, password: e.target.value })}
                                    required
                                />
                            </label>
                            <div>
                                <button type="submit">Submit</button>
                                <button type="button" onClick={handleCancel}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
 */}
            </div>
        </div>
        </div>
    );
};

export default DesignatedNodes;
