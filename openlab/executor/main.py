import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from ec2_manager import EC2Manager

# Load environment variables
load_dotenv()

app = Flask(__name__)
ec2_manager = EC2Manager()

@app.route('/create', methods=['POST'])
def create_instance():
    data = request.json
    try:
        result = ec2_manager.create_instance(
            data['instance_type'],
            data['os_version']
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/start/<instance_id>', methods=['POST'])
def start_instance(instance_id):
    try:
        result = ec2_manager.start_instance(instance_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/stop/<instance_id>', methods=['POST'])
def stop_instance(instance_id):
    try:
        result = ec2_manager.stop_instance(instance_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/restart/<instance_id>', methods=['POST'])
def restart_instance(instance_id):
    try:
        result = ec2_manager.restart_instance(instance_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/instance/<instance_id>', methods=['DELETE'])
def delete_instance(instance_id):
    try:
        result = ec2_manager.delete_instance(instance_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 