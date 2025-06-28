from flask import Blueprint, request, jsonify, current_app, redirect
from extensions import db
from models import QRCode, Scan
from user_agents import parse
from collections import defaultdict
from datetime import datetime
import geoip2.database
import os
import uuid

main = Blueprint("main", __name__)

@main.route("/api/generate", methods=["POST"])
def create_qr():
    data = request.get_json() or {}
    url = data.get("url", "").strip()
    if not url:
        return jsonify({"error": "Missing 'url' parameter"}), 400

    qr = QRCode(
        original_url=url,
        created_at=datetime.utcnow(),
        color=data.get("color", "black"),
        bg_color=data.get("bg_color", "white"),
        box_size=int(data.get("box_size", 10)),
        border=int(data.get("border", 4))
    )
    db.session.add(qr)
    db.session.commit()

    frontend_domain = current_app.config.get("FRONTEND_DOMAIN", "http://localhost:3000").rstrip("/")
    redirect_url = f"{frontend_domain}/r/{qr.id}"

    from services.qr_generator import generate_qr_code
    qr_image = generate_qr_code(redirect_url, qr.color, qr.bg_color, qr.box_size, qr.border)

    current_app.logger.info(f"QR created: ID {qr.id} for {url}")

    return jsonify({"qr_id": qr.id, "qr_image_base64": qr_image, "redirect_url": redirect_url})

@main.route("/r/<int:qr_id>")
def redirect_qr(qr_id):
    """
    При заходе на /r/<id> просто редиректим без записи сканирования,
    чтобы избежать CORS и двойных записей.
    """
    qr = QRCode.query.get(qr_id)
    if not qr:
        return "QR code not found", 404

    url = qr.original_url.strip()
    if url.lower().startswith(("http://", "https://")):
        return redirect(url, code=302)
    else:
        return f"<pre>{url}</pre>"

@main.route("/api/record-scan", methods=["POST"])
def record_scan_api():
    """
    Эндпоинт для фронтенда, чтобы отправлять данные о сканировании:
    ip и user-agent сервер возьмет сам.
    """
    data = request.get_json() or {}
    qr_id = data.get("qr_id")
    user_agent = data.get("user_agent", "unknown")
    ip = request.headers.get('X-Forwarded-For', request.remote_addr) or "unknown"
    timestamp = datetime.utcnow()

    if not qr_id:
        return jsonify({"error": "Missing qr_id"}), 400

    try:
        scan = Scan(
            qr_id=qr_id,
            ip_address=ip,
            user_agent=user_agent,
            timestamp=timestamp
        )
        db.session.add(scan)
        db.session.commit()
        return jsonify({"message": "Scan recorded"})
    except Exception as e:
        current_app.logger.error(f"Failed to record scan: {e}")
        return jsonify({"error": "Failed to record scan"}), 500

@main.route("/api/redirect/<int:qr_id>")
def api_redirect_qr(qr_id):
    """
    API для фронтенда, чтобы понять, показывать редирект или текст.
    """
    qr = QRCode.query.get(qr_id)
    if not qr:
        return jsonify({"error": "QR code not found"}), 404

    content = qr.original_url.strip()
    is_url = content.lower().startswith(("http://", "https://"))

    return jsonify({
        "type": "url" if is_url else "text",
        "content": content
    })

@main.route("/api/stats/<int:qr_id>")
def qr_stats(qr_id):
    qr = QRCode.query.get(qr_id)
    if not qr:
        return jsonify({"error": "QR code not found"}), 404

    scans = Scan.query.filter_by(qr_id=qr_id).all()
    by_date = defaultdict(int)
    devices = {"mobile": 0, "desktop": 0}
    locations = defaultdict(int)

    geoip_path = current_app.config.get("GEOIP_DB_PATH", "./data/GeoLite2-Country.mmdb")
    geo_reader = geoip2.database.Reader(geoip_path) if os.path.exists(geoip_path) else None

    for scan in scans:
        by_date[scan.timestamp.strftime("%Y-%m-%d")] += 1
        ua = parse(scan.user_agent or "")
        devices["mobile" if ua.is_mobile or ua.is_tablet else "desktop"] += 1
        country = "Unknown"
        if geo_reader:
            try:
                country = geo_reader.country(scan.ip_address).country.name or "Unknown"
            except Exception:
                pass
        locations[country] += 1

    if geo_reader:
        geo_reader.close()

    return jsonify({
        "total": len(scans),
        "by_date": dict(sorted(by_date.items())),
        "devices": devices,
        "locations": dict(locations)
    })

@main.route("/api/qrcodes")
def get_qrcodes():
    qrcodes = QRCode.query.order_by(QRCode.created_at.desc()).all()
    return jsonify([{
        "id": qr.id,
        "original_url": qr.original_url,
        "created_at": qr.created_at.isoformat(),
        "color": qr.color,
        "bg_color": qr.bg_color,
        "box_size": qr.box_size,
        "border": qr.border
    } for qr in qrcodes])

@main.route("/api/qrcode-image/<int:qr_id>")
def get_qrcode_image(qr_id):
    qr = QRCode.query.get(qr_id)
    if not qr:
        return jsonify({"error": "QR code not found"}), 404

    use_redirect = request.args.get("redirect") == "true"
    frontend_domain = current_app.config.get("FRONTEND_DOMAIN", "http://localhost:3000").rstrip("/")
    content_url = f"{frontend_domain}/r/{qr.id}" if use_redirect else qr.original_url

    from services.qr_generator import generate_qr_code
    image_base64 = generate_qr_code(
        content_url,
        color=qr.color,
        bg_color=qr.bg_color,
        box_size=qr.box_size,
        border=qr.border
    )
    return jsonify({"qr_image_base64": image_base64})

@main.route("/api/qrcodes/<int:qr_id>", methods=["DELETE"])
def delete_qrcode(qr_id):
    qr = QRCode.query.get(qr_id)
    if not qr:
        return jsonify({"error": "QR code not found"}), 404

    Scan.query.filter_by(qr_id=qr_id).delete()
    db.session.delete(qr)
    db.session.commit()

    current_app.logger.info(f"QR {qr_id} deleted")
    return jsonify({"message": "QR code deleted"})

@main.route("/api/config")
def get_config():
    return jsonify({
        "FRONTEND_DOMAIN": current_app.config.get("FRONTEND_DOMAIN", "http://localhost:3000"),
        "BACKEND_DOMAIN": current_app.config.get("BACKEND_DOMAIN", "http://localhost:5000"),
    })
