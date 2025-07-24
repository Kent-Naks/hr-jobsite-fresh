from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_restx import Api, Resource

app = Flask(__name__)
CORS(app)

# ─── Setup Swagger / OpenAPI via Flask-RESTX ─────────────────────────
api = Api(
    app,
    version="1.0",
    title="HR Jobsite API",
    description="Interactive API docs for your job listings",
    doc="/docs"             # ← swagger-ui at http://localhost:8000/docs
)

ns = api.namespace("jobs", description="Job operations")

# ─── Sample job data ─────────────────────────────────────────────────
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

# ─── Jobs list & filter ───────────────────────────────────────────────
@ns.route("/")
class JobsList(Resource):
    def get(self):
        """List all jobs, or filter by ?search=term"""
        search = request.args.get("search", "").lower()
        if search:
            return [j for j in jobs if search in j["title"].lower()]
        return jobs

# ─── Single job by ID ────────────────────────────────────────────────
@ns.route("/<int:job_id>")
class JobItem(Resource):
    def get(self, job_id):
        """Fetch a single job by its ID"""
        for j in jobs:
            if j["id"] == job_id:
                return j
        api.abort(404, "Job not found")

# ─── Health check for uptime probes ─────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    """Simple health check endpoint"""
    return jsonify({"status": "ok"}), 200

# ─── (Optional) Root route for Render or sanity check ───────────────
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "HR Jobsite backend is running!"})

# ─── Launch via Flask CLI in dev, or via Gunicorn in Docker ──────────
if __name__ == "__main__":
    app.run(debug=True)
