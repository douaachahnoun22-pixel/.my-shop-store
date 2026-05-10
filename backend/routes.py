from flask import Blueprint, jsonify, request
from backend import bcrypt
from backend.models import db, User, Product, Order, OrderItem, Notification

api = Blueprint('api', __name__)
ADMIN_KEY = 'admin-2026'


def create_response(status, payload=None, message=''):
    return jsonify({'status': status, 'message': message, 'data': payload})


@api.route('/auth/register', methods=['POST'])
def register():
    payload = request.get_json() or {}
    name = payload.get('name', '').strip()
    email = payload.get('email', '').strip().lower()
    phone = payload.get('phone', '').strip()
    password = payload.get('password', '').strip()

    if not name or not email or not phone or not password:
        return create_response('error', message='All fields are required.'), 400

    if User.query.filter_by(email=email).first():
        return create_response('error', message='Email already exists.'), 409

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(name=name, email=email, phone=phone, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    return create_response('success', payload=user.to_dict(), message='Account created successfully.')


@api.route('/auth/login', methods=['POST'])
def login():
    payload = request.get_json() or {}
    email = (payload.get('email') or '').strip().lower()
    password = (payload.get('password') or '').strip()

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return create_response('error', message='Invalid email or password.'), 401

    return create_response('success', payload=user.to_dict(), message='Login successful.')


@api.route('/products', methods=['GET'])
def get_products():
    products = [product.to_dict() for product in Product.query.order_by(Product.best_seller.desc(), Product.created_at.desc()).all()]
    return create_response('success', payload=products)


@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return create_response('error', message='Product not found.'), 404
    return create_response('success', payload=product.to_dict())


@api.route('/products/filter', methods=['POST'])
def filter_products():
    payload = request.get_json() or {}
    min_price = float(payload.get('min_price', 0) or 0)
    max_price = float(payload.get('max_price', 9999) or 9999)
    category = (payload.get('category') or '').strip()
    best_seller = payload.get('best_seller')

    query = Product.query
    if category:
        query = query.filter(Product.category == category)
    if best_seller is True:
        query = query.filter(Product.best_seller == True)
    query = query.filter(Product.price >= min_price, Product.price <= max_price)

    products = [product.to_dict() for product in query.order_by(Product.best_seller.desc(), Product.created_at.desc()).all()]
    return create_response('success', payload=products)


@api.route('/checkout', methods=['POST'])
def checkout():
    payload = request.get_json() or {}
    user_id = payload.get('user_id')
    user_name = payload.get('user_name')
    email = payload.get('email')
    phone = payload.get('phone')
    address = payload.get('address')
    comments = payload.get('comments', '')
    items = payload.get('items', [])
    total = float(payload.get('total', 0) or 0)

    if not user_id or not user_name or not email or not phone or not address or not items:
        return create_response('error', message='Please complete checkout information.'), 400

    order = Order(
        user_id=user_id,
        user_name=user_name,
        email=email,
        phone=phone,
        address=address,
        comments=comments,
        total=total,
    )
    db.session.add(order)
    db.session.flush()

    for item in items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.get('product_id'),
            name=item.get('name'),
            image_url=item.get('image_url'),
            quantity=int(item.get('quantity', 1)),
            unit_price=float(item.get('unit_price', 0)),
        )
        db.session.add(order_item)

    db.session.commit()
    return create_response('success', payload=order.to_dict(), message='Order created successfully.')


def require_admin(payload):
    if payload.get('admin_key') != ADMIN_KEY:
        return None
    return True


@api.route('/admin/products', methods=['GET', 'POST'])
def admin_products():
    if request.method == 'GET':
        products = [product.to_dict() for product in Product.query.order_by(Product.created_at.desc()).all()]
        return create_response('success', payload=products)

    payload = request.get_json() or {}
    if not require_admin(payload):
        return create_response('error', message='Unauthorized admin access.'), 401

    product = Product(
        name=payload.get('name', 'New Item'),
        category=payload.get('category', 'Accessories'),
        price=float(payload.get('price', 0) or 0),
        description=payload.get('description', ''),
        image_url=payload.get('image_url', ''),
        gallery_json=str(payload.get('gallery', [])),
        stock=int(payload.get('stock', 0) or 0),
        best_seller=payload.get('best_seller', False),
        rating=float(payload.get('rating', 4.8) or 4.8),
        reviews_count=int(payload.get('reviews_count', 0) or 0),
    )
    db.session.add(product)
    db.session.commit()
    return create_response('success', payload=product.to_dict(), message='Product added.')


@api.route('/admin/products/<int:product_id>', methods=['PUT', 'DELETE'])
def admin_product_edit(product_id):
    payload = request.get_json() or {}
    if not require_admin(payload):
        return create_response('error', message='Unauthorized admin access.'), 401

    product = Product.query.get(product_id)
    if not product:
        return create_response('error', message='Product not found.'), 404

    if request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return create_response('success', message='Product deleted.')

    product.name = payload.get('name', product.name)
    product.category = payload.get('category', product.category)
    product.price = float(payload.get('price', product.price) or product.price)
    product.description = payload.get('description', product.description)
    product.image_url = payload.get('image_url', product.image_url)
    product.gallery_json = str(payload.get('gallery', product.gallery_json))
    product.stock = int(payload.get('stock', product.stock) or product.stock)
    product.best_seller = payload.get('best_seller', product.best_seller)
    product.rating = float(payload.get('rating', product.rating) or product.rating)
    product.reviews_count = int(payload.get('reviews_count', product.reviews_count) or product.reviews_count)
    db.session.commit()
    return create_response('success', payload=product.to_dict(), message='Product updated.')


@api.route('/admin/users', methods=['GET', 'POST'])
def admin_users():
    payload = request.get_json(silent=True) or {}
    if not payload and request.args:
        payload = request.args.to_dict()
    if not require_admin(payload):
        return create_response('error', message='Unauthorized admin access.'), 401
    users = [user.to_dict() for user in User.query.order_by(User.created_at.desc()).all()]
    return create_response('success', payload=users)


@api.route('/admin/orders', methods=['GET', 'POST'])
def admin_orders():
    payload = request.get_json(silent=True) or {}
    if not payload and request.args:
        payload = request.args.to_dict()
    if not require_admin(payload):
        return create_response('error', message='Unauthorized admin access.'), 401
    orders = [order.to_dict() for order in Order.query.order_by(Order.created_at.desc()).all()]
    return create_response('success', payload=orders)


@api.route('/admin/notifications', methods=['GET', 'POST'])
def admin_notifications():
    if request.method == 'GET':
        notices = [notice.to_dict() for notice in Notification.query.order_by(Notification.created_at.desc()).all()]
        return create_response('success', payload=notices)

    payload = request.get_json() or {}
    if not require_admin(payload):
        return create_response('error', message='Unauthorized admin access.'), 401

    notice = Notification(title=payload.get('title', ''), message=payload.get('message', ''))
    db.session.add(notice)
    db.session.commit()
    return create_response('success', payload=notice.to_dict(), message='Notification created.')


@api.route('/notifications', methods=['GET'])
def notifications():
    notices = [notice.to_dict() for notice in Notification.query.order_by(Notification.created_at.desc()).all()]
    return create_response('success', payload=notices)
