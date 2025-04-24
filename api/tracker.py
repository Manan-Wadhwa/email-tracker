from flask import Flask, request, send_file
import os

app = Flask(__name__)

@app.route('/tracker')
def tracker():
    user_id = request.args.get('id', 'unknown')
    print(f"[OPENED EMAIL] User ID: {user_id}")

    # Get the absolute path of pixel.png
    image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'pixel.png'))

    if not os.path.exists(image_path):
        print(f"[ERROR] Image not found at: {image_path}")
        return "Image not found", 404

    return send_file(image_path, mimetype='image/png')

# This will let you run locally
if __name__ == "__main__":
    app.run(debug=True)
