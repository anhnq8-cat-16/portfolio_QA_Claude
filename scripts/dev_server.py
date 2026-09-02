"""Local dev-only static server that disables caching, so edits always show up
on reload. Plain `python3 -m http.server` looks cached forever in Chrome once
a response without cache headers has been served once on that origin/port.
Usage: python3 dev_server.py <directory> <port>
Not needed to view or deploy the site — only useful while developing it.
"""
import http.server, functools, sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

if __name__ == "__main__":
    handler = functools.partial(NoCacheHandler, directory=sys.argv[1])
    http.server.ThreadingHTTPServer(("", int(sys.argv[2])), handler).serve_forever()
