import json
from datetime import datetime
from backend import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat(),
        }


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(180), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(300), nullable=False)
    gallery_json = db.Column(db.Text, nullable=False)
    stock = db.Column(db.Integer, default=15)
    best_seller = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=4.9)
    reviews_count = db.Column(db.Integer, default=42)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        gallery = []
        try:
            gallery = json.loads(self.gallery_json or '[]')
        except Exception:
            gallery = []

        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price': round(self.price, 2),
            'description': self.description,
            'image_url': self.image_url,
            'gallery': gallery,
            'stock': self.stock,
            'best_seller': self.best_seller,
            'rating': self.rating,
            'reviews_count': self.reviews_count,
        }


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(180), nullable=False)
    image_url = db.Column(db.String(300), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'name': self.name,
            'image_url': self.image_url,
            'quantity': self.quantity,
            'unit_price': round(self.unit_price, 2),
            'subtotal': round(self.quantity * self.unit_price, 2),
        }


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    user_name = db.Column(db.String(180), nullable=False)
    email = db.Column(db.String(180), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    address = db.Column(db.String(300), nullable=False)
    comments = db.Column(db.Text, nullable=True)
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(60), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'comments': self.comments,
            'total': round(self.total, 2),
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'items': [item.to_dict() for item in self.items],
        }


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(180), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'created_at': self.created_at.isoformat(),
        }
