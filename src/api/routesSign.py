"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from flask_cors import CORS
from base64 import b64encode
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os
import cloudinary.uploader as uploader
from api.models import db, User
from werkzeug.security import check_password_hash

signin_api = Blueprint("signin_api", __name__)
# Allow CORS requests to this API
CORS(signin_api)


@signin_api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@signin_api.route('/health-check', methods=['GET'])
def health_check():
    return jsonify({"status": "OK"}), 200

@signin_api.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "condominium_id": user.condominio_id,
            "roles": [r.name for r in user.roles]
        }
    }), 200
