from flask import Flask, jsonify, request
from flask_cors import CORS
import socket
import ipaddress
from datetime import datetime
from scapy.all import ARP, Ether, srp

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
    app.run(host='0.0.0.0', port=7000)