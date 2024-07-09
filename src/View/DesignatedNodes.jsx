import React, { useState } from 'react';
import Sidebar from '../Components/sidebar';
import Footer from '../Components/footer';

import '../Styles/DesignatedNodes.css'; // Import your CSS file for styling

const DataTable = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [roles, setRoles] = useState([
        { id: 1, slNo: 1, ipAddress: '192.168.1.1', hostname: 'example.com', roles: [] },
        { id: 2, slNo: 2, ipAddress: '192.168.1.2', hostname: 'example.net', roles: [] },
        // Add more data as needed
    ]);

    const [interface01, setInterface01] = useState('');
    const [interface02, setInterface02] = useState('');
    const [floatingIp, setFloatingIp] = useState('');

    const handleCheckboxChange = (event, row) => {
        const isChecked = event.target.checked;
        if (isChecked) {
            setSelectedRows([...selectedRows, row]);
        } else {
            setSelectedRows(selectedRows.filter(selectedRow => selectedRow.id !== row.id));
        }
    };

    const handleRoleChange = (event, row, role) => {
        const updatedRoles = roles.map(item => {
            if (item.id === row.id) {
                const rolesSet = new Set(item.roles);
                if (event.target.checked) {
                    rolesSet.add(role);
                } else {
                    rolesSet.delete(role);
                }
                return { ...item, roles: Array.from(rolesSet) };
            }
            return item;
        });
        setRoles(updatedRoles);
        console.log('Roles updated:', updatedRoles);
    };

    const handleDeploy = () => {
        console.log('Deploying:', selectedRows);
        // Implement actual deployment logic here, e.g., call an API
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
                                                checked={row.roles.includes('Control')}
                                                onChange={(event) => handleRoleChange(event, row, 'Control')}
                                            />
                                            <span>Control</span>
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={row.roles.includes('Compute')}
                                                onChange={(event) => handleRoleChange(event, row, 'Compute')}
                                            />
                                            <span>Compute</span>
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={row.roles.includes('Storage')}
                                                onChange={(event) => handleRoleChange(event, row, 'Storage')}
                                            />
                                            <span>Storage</span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Text fields centered below the table */}
                <div className="text-fields-container">
                    <div className="text-field">
                        <label htmlFor="interface01">INTERFACE_01:</label>
                        <input
                            type="text"
                            id="interface01"
                            value={interface01}
                            onChange={(e) => setInterface01(e.target.value)}
                        />
                    </div>
                    <div className="text-field">
                        <label htmlFor="interface02">INTERFACE_02:</label>
                        <input
                            type="text"
                            id="interface02"
                            value={interface02}
                            onChange={(e) => setInterface02(e.target.value)}
                        />
                    </div>
                    <div className="text-field">
                        <label htmlFor="floatingIp">FLOATING_IP:</label>
                        <input
                            type="text"
                            id="floatingIp"
                            value={floatingIp}
                            onChange={(e) => setFloatingIp(e.target.value)}
                        />
                    </div>
                </div>

                <Sidebar />
                <Footer />

                {/* Deployment button */}
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

export default DataTable;
