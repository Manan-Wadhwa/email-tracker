from flask import Flask, request, send_file
from datetime import datetime

app = Flask(__name__)

@app.route('/tracker')
def tracker():
    user_id = request.args.get('id', 'unknown')
    user_agent = request.headers.get('User-Agent', 'No-UA')
    ip = request.remote_addr
    timestamp = datetime.utcnow().isoformat()

    with open("log.txt", "a") as f:
        f.write(f"{timestamp} | IP: {ip} | User ID: {user_id} | UA: {user_agent}\n")

    return send_file("pixel.png", mimetype='image/png')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
