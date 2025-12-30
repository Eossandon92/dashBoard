from flask import request, jsonify, Blueprint
from base64 import b64encode
from werkzeug.security import generate_password_hash
from datetime import datetime
import os
import cloudinary.uploader as uploader
import re

from api.models import db, User

register_api = Blueprint("register_api", __name__)


def valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)


@register_api.route("/register", methods=["POST"])
def register():

    data_form = request.form
    data_files = request.files

    full_name = data_form.get("full_name")
    email = data_form.get("email")
    password = data_form.get("password")
    birthdate = data_form.get("birthdate")
    gender = data_form.get("gender")
    avatar_db = data_files.get("avatar")

    if not full_name or not email or not birthdate or not gender or not password:
        return jsonify({"message": "Please put all the information to register."}), 400

    if not valid_email(email):
        return jsonify({"message": "The email format is not valid. Ex: example@gmail.com"}), 400

    user_exist = User.query.filter_by(email=email).first()
    if user_exist:
        return jsonify({"message": "The email is already used"}), 409

    birthdate = datetime.strptime(birthdate, "%Y-%m-%d").date()
    salt = b64encode(os.urandom(32)).decode("utf-8")
    hashed_password = generate_password_hash(f"{password}{salt}")

    avatar = "https://i.pravatar.cc/300"
    if avatar_db:
        uploaded = uploader.upload(avatar_db)
        avatar = uploaded["secure_url"]

    rol = "USER"
    if email == "patitasfelicess123@gmail.com":
        rol = "ADMIN"

    new_user = User(
        email=email,
        full_name=full_name,
        birthdate=birthdate,
        gender=gender,
        avatar=avatar,
        password=hashed_password,
        role=rol,
        status="ACTIVE",
        salt=salt
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201
