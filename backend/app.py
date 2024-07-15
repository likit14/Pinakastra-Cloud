from flask import Flask, jsonify, request
from flask_cors import CORS
import socket
import ipaddress
from datetime import datetime
from scapy.all import ARP, Ether, srp
import nmap
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_local_network_ip():
    import netifaces
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

def get_device_type(ip, mac):
    nm = nmap.PortScanner()
    try:
        nm.scan(ip, arguments='-O -sV')  # OS and service detection
        os_info = nm[ip].get('osmatch', [])
        for os in os_info:
            os_name = os['name'].lower()
            if 'server' in os_name:
                return 'Server'
            if 'router' in os_name or 'switch' in os_name:
                return 'Network Device'
            if 'windows' in os_name:
                return 'Laptop/Desktop'
            if 'android' in os_name or 'ios' in os_name:
                return 'Phone'

        services = nm[ip].get('tcp', {})
        for port, service in services.items():
            service_name = service['name'].lower()
            if 'http' in service_name or 'ssh' in service_name:
                return 'Server'
            if 'printer' in service_name:
                return 'Printer'
            if 'ftp' in service_name:
                return 'Network Storage'
            if 'rdp' in service_name:
                return 'Laptop/Desktop'

        # Additional checks based on MAC address vendor
        vendor = lookup_mac_vendor(mac)
        if 'apple' in vendor.lower():
            return 'Phone' if 'ios' in vendor.lower() else 'Laptop/Desktop'
        if 'samsung' in vendor.lower() or 'oneplus' in vendor.lower():
            return 'Phone'
    except Exception as e:
        print(f"Error scanning {ip}: {e}")
    return 'Other'

def lookup_mac_vendor(mac_address):
    try:
        response = requests.get(f"https://macvendors.com/{mac_address}")
        if response.status_code == 200:
            return response.text
    except Exception as e:
        print(f"Error looking up MAC vendor for {mac_address}: {e}")
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
            'last_seen': datetime.now().strftime('%Y-%m-%d'),
            'mac_vendor': lookup_mac_vendor(received.hwsrc)
        }
        try:
            node_info['hostname'] = socket.gethostbyaddr(received.psrc)[0]
        except socket.herror:
            node_info['hostname'] = 'Unknown'
        
        # Get the device type
        node_info['device_type'] = get_device_type(received.psrc, received.hwsrc)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
