#!/usr/bin/env python3
"""
Redash API Proxy Server
Fetches BDE utilization data from Redash and serves it with CORS headers enabled.
This solves browser CORS restrictions when calling Redash directly.

Usage:
    python3 run-live.py
    
Then access the dashboard at: http://localhost:8000/index.html
"""

import json
import http.server
import socketserver
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional

# Configuration
PORT = 8000
REDASH_API_URL = "https://data.testbook.com/api/queries/22653/results.json?api_key=OEvdupK6l18PK5ijC1qjLpDiJ7CCA5XuzczxnnU1"

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS support"""
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/api/results':
            self.serve_redash_data()
        else:
            super().do_GET()
    
    def serve_redash_data(self):
        """Fetch and serve Redash data with CORS headers"""
        try:
            print(f"[{self.client_address[0]}] Fetching Redash data...")
            
            # Fetch from Redash
            with urllib.request.urlopen(REDASH_API_URL, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            print(f"[{self.client_address[0]}] ✓ Data served successfully")
            
        except urllib.error.URLError as e:
            print(f"[{self.client_address[0]}] ✗ Redash fetch failed: {e}")
            self.send_error(502, "Bad Gateway - Redash unreachable")
        except Exception as e:
            print(f"[{self.client_address[0]}] ✗ Error: {e}")
            self.send_error(500, "Internal Server Error")
    
    def log_message(self, format, *args):
        """Custom logging"""
        if '/api/results' not in args[0]:
            print(f"[{self.client_address[0]}] {format % args}")


def start_server():
    """Start the local development server"""
    handler = CORSRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"╔════════════════════════════════════════════════════════════╗")
            print(f"║  BDE Utilization Dashboard - Live Server                  ║")
            print(f"╠════════════════════════════════════════════════════════════╣")
            print(f"║  🌐 Server running at:                                     ║")
            print(f"║     http://localhost:{PORT}/index.html                       ║")
            print(f"║                                                            ║")
            print(f"║  📊 API Proxy:                                             ║")
            print(f"║     http://localhost:{PORT}/api/results                     ║")
            print(f"║                                                            ║")
            print(f"║  Press Ctrl+C to stop                                      ║")
            print(f"╚════════════════════════════════════════════════════════════╝")
            print()
            
            httpd.serve_forever()
    
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
    except OSError as e:
        print(f"✗ Error: {e}")
        print(f"  Port {PORT} may already be in use. Try a different port:")
        print(f"  PORT=8001 python3 run-live.py")


if __name__ == "__main__":
    start_server()
