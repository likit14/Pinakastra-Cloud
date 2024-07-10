from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import socket
import ipaddress
from datetime import datetime
import json
from scapy.all import ARP, Ether, srp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_local_ip():
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    return local_ip

def get_network_range(local_ip):
    ip_interface = ipaddress.IPv4Interface(local_ip + '/24')
    network = ip_interface.network
    return network

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
            'last_seen': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        try:
            node_info['hostname'] = socket.gethostbyaddr(received.psrc)[0]
        except socket.herror:
            node_info['hostname'] = 'Unknown'
        active_nodes.append(node_info)

    return active_nodes

def get_hardware_info(ip):
    hardware_info = {}
    try:
        cpu_info = subprocess.check_output(["ipmitool", "-I", "lanplus", "-H", ip, "-U", "admin", "-P", "admin", "sdr", "type", "Processor"], universal_newlines=True)
        mem_info = subprocess.check_output(["ipmitool", "-I", "lanplus", "-H", ip, "-U", "admin", "-P", "admin", "sdr", "type", "Memory"], universal_newlines=True)
        storage_info = subprocess.check_output(["ipmitool", "-I", "lanplus", "-H", ip, "-U", "admin", "-P", "admin", "sdr", "type", "Drive Slot"], universal_newlines=True)

        hardware_info['cpu'] = cpu_info.strip()
        hardware_info['memory'] = mem_info.strip()
        hardware_info['storage'] = storage_info.strip()
    except subprocess.CalledProcessError as e:
        print(f"Failed to retrieve hardware info for node with IP {ip}: {e}")
    
    return hardware_info

def check_hardware_requirements(hardware_info, expected_requirements):
    for key, value in expected_requirements.items():
        if key not in hardware_info or hardware_info[key] != value:
            return False
    return True

def save_hardware_info_to_file(hardware_info, filename="hardware_info.json"):
    with open(filename, 'w') as file:
        json.dump(hardware_info, file, indent=4)
    print(f"Hardware information saved to {filename}")

def load_expected_hardware(filename="expected_hardware.json"):
    with open(filename, 'r') as file:
        expected_hardware = json.load(file)
    return expected_hardware

@app.route('/scan', methods=['GET'])
def scan():
    local_ip = get_local_ip()
    network = get_network_range(local_ip)
    active_nodes = scan_network(network)

    all_hardware_info = {}
    for node in active_nodes:
        hardware_info = get_hardware_info(node['ip'])
        all_hardware_info[node['ip']] = hardware_info

    save_hardware_info_to_file(all_hardware_info)
    return jsonify(active_nodes)

@app.route('/validate', methods=['POST'])
def validate():
    data = request.json
    ip = data['ip']
    expected_requirements = load_expected_hardware()
    hardware_info = get_hardware_info(ip)

    if check_hardware_requirements(hardware_info, expected_requirements):
        return jsonify({'status': 'pass', 'message': 'Hardware requirements met'})
    else:
        return jsonify({'status': 'fail', 'message': 'Hardware requirements not met'})

@app.route('/pxe-boot', methods=['POST'])
def pxe_boot():
    data = request.json
    ip = data['ip']
    expected_requirements = load_expected_hardware()
    hardware_info = get_hardware_info(ip)

    if check_hardware_requirements(hardware_info, expected_requirements):
        image_path = data['image_path']
        configure_pxe_boot(ip, image_path)
        pxe_boot_node(ip)
        return jsonify({'status': 'success', 'message': 'PXE boot triggered'})
    else:
        return jsonify({'status': 'failure', 'message': 'Hardware requirements not met'})

def configure_pxe_boot(ip, image_path):
    print(f"Configuring PXE boot for {ip} with image {image_path}")

def pxe_boot_node(ip):
    try:
        subprocess.run(["ipmitool", "-I", "lanplus", "-H", ip, "-U", "admin", "-P", "admin", "chassis", "power", "cycle"], check=True)
        print(f"Triggered PXE boot for node with IP {ip}")
    except subprocess.CalledProcessError as e:
        print(f"Failed to trigger PXE boot for node with IP {ip}: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
