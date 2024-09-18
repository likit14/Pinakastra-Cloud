from flask import Flask, request, jsonify
from flask_cors import CORS
from scapy.all import ARP, Ether, srp
import ipaddress
import netifaces
import concurrent.futures
import logging
from datetime import datetime
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Setup logging
logging.basicConfig(level=logging.INFO)

# File upload configuration
UPLOAD_FOLDER = '/home/HardwareDetails'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

def scan_network(network):
    arp_request = ARP(pdst=str(network))
    broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast / arp_request
    answered_list = srp(arp_request_broadcast, timeout=5, retry=3, verbose=False)[0]  # Increased timeout and retries

    active_nodes = []
    for sent, received in answered_list:
        node_info = {
            'ip': received.psrc,
            'mac': received.hwsrc,
            'last_seen': datetime.now().strftime('%Y-%m-%d')
        }
        active_nodes.append(node_info)

    return active_nodes

@app.route('/hardware-info', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    return jsonify({'message': f'File {file.filename} uploaded successfully'}), 200

@app.route('/scan', methods=['GET', 'POST'])
def scan_network_api():
    logging.info("Received scan request")
    if request.method == 'POST':
        data = request.get_json()
        local_ip = data.get('local_ip')

        if not local_ip:
            logging.error("Local IP address is required in the request body.")
            return jsonify({"error": "Local IP address is required in the request body."}), 400
    else:
        local_ip = get_local_network_ip()
        if not local_ip:
            logging.error("Failed to retrieve local network IP address.")
            return jsonify({"error": "Failed to retrieve local network IP address."}), 500

    network = get_network_range(local_ip)
    logging.info(f"Scanning network: {network}")
    active_nodes = scan_network(network)
    logging.info(f"Active nodes found: {active_nodes}")

    return jsonify(active_nodes)

@app.route('/set_pxe_boot', methods=['POST'])
def set_pxe_boot():
    data = request.json
    bmc_ip = data.get('ip')
    username = data.get('username')
    password = data.get('password')

    if not all([bmc_ip, username, password]):
        return jsonify({'status': 'error', 'message': 'Missing BMC details'}), 400

    try:
        # Change boot order to PXE
        subprocess.run([
            'ipmitool', '-I', 'lanplus', '-H', bmc_ip, '-U', username, '-P', password,
            'chassis', 'bootdev', 'pxe'
        ], check=True)

        # Restart the system
        subprocess.run([
            'ipmitool', '-I', 'lanplus', '-H', bmc_ip, '-U', username, '-P', password,
            'chassis', 'power', 'reset'
        ], check=True)

        return jsonify({'status': 'success', 'message': 'Boot order changed to PXE and system restarted'}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
