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

    const handleDeploy = () => {
        console.log('Deploying:', selectedRows);
        // Implement actual deployment logic here, e.g., call an API
        navigate('/deploymentinfo');
    };

    return (
        <div className="data-table-container">
            <h1>Designated Nodes</h1>
            <div className="container">
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>IP Address</th>
                                <th>Hostname</th>
                                <th>Roles</th>
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
                                        <br />
                                        {/* <label>
                                            <input
                                                type="checkbox"
                                                checked={row.roles.includes('Storage')}
                                                onChange={(event) => handleCheckboxChange(event, row, 'Storage')}
                                            />
                                            <span>Storage</span>
                                        </label> */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <Sidebar />
                <Footer />

                <button
                    className="button-deploy"
                    onClick={handleDeploy}
                    disabled={selectedRows.length === 0}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default DesignatedNodes;