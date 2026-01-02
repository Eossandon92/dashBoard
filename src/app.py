"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routesSign import signin_api
from api.routesCondominio import condominios_bp
from api.admin import setup_admin
from api.commands import setup_commands
from api.routesUser import users_bp
from flask_jwt_extended import JWTManager
from api.routesRoles import roles_bp

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"

static_file_dir = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "../dist/"
)

app = Flask(__name__)
app.url_map.strict_slashes = False
jwt = JWTManager(app)

# --------------------
# Database config
# --------------------
db_url = os.getenv("DATABASE_URL")

if db_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace(
        "postgres://", "postgresql://"
    )
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////tmp/test.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

Migrate(app, db, compare_type=True)
db.init_app(app)

# --------------------
# Admin & commands
# --------------------
setup_admin(app)
setup_commands(app)

# --------------------
# CORS
# --------------------
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://localhost:5173"
            ]
        }
    },
    supports_credentials=True
)

# --------------------
# Blueprints (API)
# --------------------
app.register_blueprint(signin_api, url_prefix="/api")
app.register_blueprint(condominios_bp, url_prefix="/api")
app.register_blueprint(users_bp, url_prefix="/api")
app.register_blueprint(roles_bp, url_prefix="/api")

# --------------------
# Error handling
# --------------------
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# --------------------
# Sitemap
# --------------------
@app.route("/")
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, "index.html")

# --------------------
# Static files
# --------------------
@app.route("/<path:path>", methods=["GET"])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = "index.html"

    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

# --------------------
# Run server
# --------------------
if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=PORT, debug=True)
