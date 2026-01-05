from flask import Blueprint, jsonify
import requests

uf_bp = Blueprint("uf", __name__)

@uf_bp.route("/uf", methods=["GET"])
def get_uf():
    try:
        resp = requests.get("https://mindicador.cl/api", timeout=5)
        data = resp.json()

        if "uf" not in data:
            return jsonify({"msg": "Valor UF no disponible"}), 404

        return jsonify({
            "fecha": data["uf"]["fecha"],
            "valorUF": data["uf"]["valor"]
        }), 200

    except Exception as e:
        return jsonify({
            "msg": "Error al obtener UF",
            "error": str(e)
        }), 500
