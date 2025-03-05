from fastapi import FastAPI, BackgroundTasks
from scapy.all import sniff
from collections import defaultdict
import time
import os

app = FastAPI()

IP_THRESHOLD = 1000  # Maximum packets allowed per TIME_WINDOW
BLOCK_TIME = 120      # Time (in seconds) to block an IP
TIME_WINDOW = 60      # Time (in seconds) for counting packets

packet_counts = defaultdict(int)
start_time = time.time()
blocked_ips = set()

def block_ip(ip_src):
    """Block IP using Windows Firewall"""
    os.system(f"netsh advfirewall firewall add rule name=\"Block {ip_src}\" dir=in action=block remoteip={ip_src}")
    blocked_ips.add(ip_src)

def unblock_ip(ip_src):
    """Unblock IP using Windows Firewall"""
    os.system(f"netsh advfirewall firewall delete rule name=\"Block {ip_src}\"")
    blocked_ips.discard(ip_src)

def detect_ddos_attack(pkt):
    global start_time
    current_time = time.time()
    
    if pkt.haslayer('IP'):
        ip_src = pkt['IP'].src
        packet_counts[ip_src] += 1
        
        if packet_counts[ip_src] > IP_THRESHOLD:
            block_ip(ip_src)
            packet_counts[ip_src] = 0  
        
        if current_time - start_time > TIME_WINDOW:
            packet_counts.clear()
            start_time = current_time

def sniff_packets():
    sniff(prn=detect_ddos_attack, store=0)

@app.get("/")
def home():
    return {"message": "DDoS Detection API is running"}

@app.get("/packet_counts")
def get_packet_counts():
    return {"packet_counts": dict(packet_counts)}

@app.get("/blocked_ips")
def get_blocked_ips():
    return {"blocked_ips": list(blocked_ips)}

@app.get("/unblock_ip/{ip}")
def api_unblock_ip(ip: str):
    if ip in blocked_ips:
        unblock_ip(ip)
        return {"message": f"IP {ip} unblocked."}
    return {"message": f"IP {ip} is not blocked."}

@app.get("/start_sniffing")
def start_sniffing(background_tasks: BackgroundTasks):
    background_tasks.add_task(sniff_packets)
    return {"message": "Packet sniffing started."}