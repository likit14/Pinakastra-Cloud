from flask import Flask, jsonify, request
from flask_cors import CORS
import socket
import ipaddress
from datetime import datetime
from scapy.all import ARP, Ether, srp
import nmap
import netifaces
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_local_network_ip():
    interfaces = netifaces.interfaces()
    for interface in interfaces:
        addresses = netifaces.ifaddresses(interface)
        if netifaces.AF_INET in addresses:  # Check if the interface has IPv4 address
            for link in addresses[netifaces.AF_INET]:
                if 'addr' in link and not link['addr'].startswith('127.'):
                    return link['addr']
    return None  # Return None if no suitable IP address found

def get_network_range(local_ip):
    ip_interface = ipaddress.IPv4Interface(local_ip + '/24')
    network = ip_interface.network
    return network

def get_os_type(ip):
    # Use nmap to detect the OS
    nm = nmap.PortScanner()
    try:
        nm.scan(ip, arguments='-O')  # OS detection
        os_info = nm[ip].get('osmatch', [])
        if os_info:
            return os_info[0]['name']
    except Exception as e:
        print(f"Error scanning {ip}: {e}")
    return 'Unknown'

def scan_network(network):
    arp_request = ARP(pdst=str(network))
    broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast / arp_request
    answered_list = srp(arp_request_broadcast, timeout=2, verbose=False)[0]

    active_nodes = []
    for sent, received in answered_list:
        node_info = {
            'ip': received.psrc,
            'mac': received.hwsrc,
            'last_seen': datetime.now().strftime('%Y-%m-%d')
        }
        try:
            node_info['hostname'] = socket.gethostbyaddr(received.psrc)[0]
        except socket.herror:
            node_info['hostname'] = 'Unknown'
        
        # Get the OS type
        node_info['os_type'] = get_os_type(received.psrc)

        active_nodes.append(node_info)

    return active_nodes

@app.route('/scan', methods=['GET', 'POST'])
def scan_network_api():
    if request.method == 'POST':
        data = request.get_json()
        local_ip = data.get('local_ip')

        if not local_ip:
            return jsonify({"error": "Local IP address is required in the request body."}), 400
    else:
        local_ip = get_local_network_ip()
        if not local_ip:
            return jsonify({"error": "Failed to retrieve local network IP address."}), 500

    network = get_network_range(local_ip)
    active_nodes = scan_network(network)

    return jsonify(active_nodes)

@app.route('/set_pxe_boot', methods=['POST'])
def set_pxe_boot():
    data = request.json
    bmc_ip = data['ip']
    bmc_username = data['username']
    bmc_password = data['password']
    role = data['role']
    
    try:
        result = subprocess.run(['python3', 'set_pxe_boot.py', bmc_ip, bmc_username, bmc_password, role],
                                capture_output=True, text=True)
        if result.returncode == 0:
            return jsonify({"status": "success", "message": result.stdout})
        else:
            return jsonify({"status": "error", "message": result.stderr})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
