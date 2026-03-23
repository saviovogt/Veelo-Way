#!/usr/bin/env python3
"""
Veelo Way - Simple registration server
"""
import json
import os
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get('PORT', 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
REGISTRATIONS_FILE = os.path.join(DATA_DIR, 'registrations.json')
os.makedirs(DATA_DIR, exist_ok=True)

def load_registrations():
    try:
        with open(REGISTRATIONS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_registrations(data):
    with open(REGISTRATIONS_FILE, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

class VeeloHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Disable cache so browsers always get the latest version
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/register':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                data['receivedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                data['status'] = 'pending'
                regs = load_registrations()
                if not any(r.get('id') == data.get('id') for r in regs):
                    regs.append(data)
                    save_registrations(regs)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'id': data.get('id')}).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/registrations':
            regs = load_registrations()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(regs).encode())
        elif parsed.path == '/api/approve':
            qs = parse_qs(parsed.query)
            reg_id = qs.get('id', [''])[0]
            regs = load_registrations()
            for r in regs:
                if r.get('id') == reg_id:
                    r['status'] = 'approved'
                    r['approvedAt'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            save_registrations(regs)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())
        elif parsed.path == '/api/reject':
            qs = parse_qs(parsed.query)
            reg_id = qs.get('id', [''])[0]
            regs = load_registrations()
            for r in regs:
                if r.get('id') == reg_id:
                    r['status'] = 'rejected'
            save_registrations(regs)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())
        else:
            super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        pass  # silence logs

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), VeeloHandler)
    print(f'Veelo Way server running on port {PORT}')
    server.serve_forever()
