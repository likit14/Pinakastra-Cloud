from flask import Flask, jsonify, request
from flask_cors import CORS
import socket
import ipaddress
from datetime import datetime
from scapy.all import ARP, Ether, srp
import nmap
import netifaces
import subprocess
import concurrent.futures

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Mapping detailed OS names to simpler labels
os_mapping = {
    'Apple Mac OS X 10.7.0 (Lion) - 10.12 (Sierra) or iOS 4.1 - 9.3.3 (Darwin 10.0.0 - 16.4.0)': 'Apple',
    'Linux 2.6.32 - 3.13': 'Linux',
    'Linux 2.6.32': 'Linux',
    'Linux 3.2 - 4.9': 'Linux',
    'Linux 4.15 - 5.6': 'Linux',
    'FreeBSD 6.2-RELEASE': 'FreeBSD 6.2'
    'Fortinet FortiGate 100D firewall': 'Fortinet 100D firewall'
    # Add more mappings as needed
}

def get_local_network_ip():
    interfaces = netifaces.interfaces()
    for interface in interfaces:
        addresses = netifaces.ifaddresses(interface)
        if netifaces.AF_INET in addresses:  # Check if the interface has an IPv4 address
            for link in addresses[netifaces.AF_INET]:
                if 'addr' in link and not link['addr'].startswith('127.'):
                    return link['addr']
    return None  # Return None if no suitable IP address is found

def get_network_range(local_ip):
    ip_interface = ipaddress.IPv4Interface(local_ip + '/24')
    network = ip_interface.network
    return network

def get_os_type(ip):
    nm = nmap.PortScanner()
    try:
        nm.scan(ip, arguments='-O')  # OS detection
        os_info = nm[ip].get('osmatch', [])
        if os_info:
            os_name = os_info[0]['name']
            return os_mapping.get(os_name, os_name)  # Return simplified label if available
    except Exception as e:
        print(f"Error scanning {ip}: {e}")
    return 'Unknown'

def resolve_hostname(ip):
    try:
        return socket.gethostbyaddr(ip)[0]
    except socket.herror:
        return 'Unknown'

def scan_network(network):
    arp_request = ARP(pdst=str(network))
    broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast / arp_request
    answered_list = srp(arp_request_broadcast, timeout=2, verbose=False)[0]

    active_nodes = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for sent, received in answered_list:
            node_info = {
                'ip': received.psrc,
                'mac': received.hwsrc,
                'last_seen': datetime.now().strftime('%Y-%m-%d')
            }
            futures.append(executor.submit(resolve_hostname, received.psrc))
            futures.append(executor.submit(get_os_type, received.psrc))
            active_nodes.append(node_info)

        for i in range(0, len(futures), 2):
            hostname_future = futures[i]
            os_type_future = futures[i + 1]
            active_nodes[i // 2]['hostname'] = hostname_future.result()
            active_nodes[i // 2]['os_type'] = os_type_future.result()

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
