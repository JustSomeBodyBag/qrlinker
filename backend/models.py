from extensions import db
from sqlalchemy.sql import func

class QRCode(db.Model):
    __tablename__ = 'qrcodes'

    id = db.Column(db.Integer, primary_key=True)
    original_url = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())

    color = db.Column(db.String(32), default="black", nullable=False)
    bg_color = db.Column(db.String(32), default="white", nullable=False)
    box_size = db.Column(db.Integer, default=10, nullable=False)
    border = db.Column(db.Integer, default=4, nullable=False)

    scans = db.relationship(
        "Scan",
        backref="qrcode",
        lazy=True,
        cascade="all, delete-orphan"
    )


class Scan(db.Model):
    __tablename__ = 'scans'

    id = db.Column(db.Integer, primary_key=True)
    qr_id = db.Column(
        db.Integer,
        db.ForeignKey('qrcodes.id', ondelete="CASCADE"),
        nullable=False
    )
    ip_address = db.Column(db.String(45))  # поддержка IPv6
    user_agent = db.Column(db.String)
    timestamp = db.Column(db.DateTime, default=func.now())
