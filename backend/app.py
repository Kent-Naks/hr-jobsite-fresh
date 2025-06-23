from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Root route for Render health check or base access
@app.route('/')
def home():
    return jsonify({"message": "HR Jobsite backend is running!"})

# Sample job data
jobs = [
    {
        "id": 1,
        "title": "Administrative Assistant",
        "description": "Responsible for managing office tasks and communications."
    },
    {
        "id": 2,
        "title": "Software Developer",
        "description": "Develop and maintain web applications."
    }
]

@app.route('/jobs', methods=['GET'])
def get_jobs():
    search = request.args.get('search', '').lower()
    if search:
        filtered = [job for job in jobs if search in job['title'].lower()]
        return jsonify(filtered)
    return jsonify(jobs)

@app.route('/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    for job in jobs:
        if job['id'] == job_id:
            return jsonify(job)
    return jsonify({"error": "Job not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
