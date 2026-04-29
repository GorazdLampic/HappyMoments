#!/usr/bin/env python3
"""
HappyMoments Local Server
Run this to test the app on your Android phone over your local network.

Usage:
    python serve.py

Then open the displayed URL on your Android phone's browser.
"""

import http.server
import socketserver
import os
import socket

PORT = 8080
DIRECTORY = "web"

def get_local_ip():
    """Get the local IP address for network access"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add headers for PWA support
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    local_ip = get_local_ip()

    print("\n" + "="*60)
    print("  HappyMoments Local Server")
    print("="*60)
    print(f"\n  Local URL:   http://localhost:{PORT}")
    print(f"  Network URL: http://{local_ip}:{PORT}")
    print("\n  Open the Network URL on your Android phone!")
    print("  Make sure your phone is on the same WiFi network.")
    print("\n  To install as an app:")
    print("  1. Open Chrome on Android")
    print("  2. Go to the Network URL above")
    print("  3. Tap the menu (3 dots) > 'Add to Home screen'")
    print("\n  Press Ctrl+C to stop the server")
    print("="*60 + "\n")

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
