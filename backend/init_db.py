from backend import db, bcrypt
from backend.models import User, Product, Notification


def seed_database(app):
    with app.app_context():
        db.create_all()

        if not User.query.filter_by(email='admin@luxshop.com').first():
            admin = User(
                name='Store Manager',
                email='admin@luxshop.com',
                phone='+1234567890',
                password_hash=bcrypt.generate_password_hash('Admin2026!').decode('utf-8'),
                is_admin=True,
            )
            db.session.add(admin)

        if not Product.query.first():
            sample = [
                Product(
                    name='Aurelia Leather Tote',
                    category='Handbags',
                    price=198.00,
                    description='A modern white leather tote with minimalist hardware and luxe lining.',
                    image_url='https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
                    gallery_json='["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80"]',
                    stock=18,
                    best_seller=True,
                    rating=4.9,
                    reviews_count=76,
                ),
                Product(
                    name='Cielo Silk Scarf',
                    category='Accessories',
                    price=54.00,
                    description='Soft premium silk scarf with a subtle marble print and gentle drape.',
                    image_url='https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80&sat=-100',
                    gallery_json='["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80&sat=-100","https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"]',
                    stock=42,
                    best_seller=False,
                    rating=4.8,
                    reviews_count=34,
                ),
                Product(
                    name='Luna Gold Bracelet',
                    category='Jewelry',
                    price=125.00,
                    description='Minimal brushed gold bracelet with adjustable comfort fit and luxury polish.',
                    image_url='https://images.unsplash.com/photo-1517430816045-df4b7de1d7e4?auto=format&fit=crop&w=800&q=80',
                    gallery_json='["https://images.unsplash.com/photo-1517430816045-df4b7de1d7e4?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80"]',
                    stock=26,
                    best_seller=True,
                    rating=4.95,
                    reviews_count=89,
                ),
                Product(
                    name='Opal Statement Ring',
                    category='Jewelry',
                    price=76.00,
                    description='Elegant ring set with opal shimmer and sleek matte band details.',
                    image_url='https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80',
                    gallery_json='["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"]',
                    stock=14,
                    best_seller=False,
                    rating=4.7,
                    reviews_count=21,
                ),
                Product(
                    name='Velvet Evening Clutch',
                    category='Handbags',
                    price=142.00,
                    description='Soft velvet clutch with hidden magnetic closure and elegant chain strap.',
                    image_url='https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
                    gallery_json='["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1495121605193-b116b5b9c5d9?auto=format&fit=crop&w=800&q=80"]',
                    stock=21,
                    best_seller=True,
                    rating=4.9,
                    reviews_count=65,
                ),
                Product(
                    name='Nera Minimal Watch',
                    category='Accessories',
                    price=164.00,
                    description='Sleek matte watch with polished hands and understated luxury feel.',
                    image_url='https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80&sat=-60',
                    gallery_json='["https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80&sat=-60","https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80&sat=-20"]',
                    stock=32,
                    best_seller=False,
                    rating=4.8,
                    reviews_count=53,
                ),
            ]
            db.session.bulk_save_objects(sample)

        if not Notification.query.first():
            db.session.add(Notification(
                title='Spring Luxury Offer',
                message='Enjoy 15% off selected accessories through this weekend.',
            ))
            db.session.add(Notification(
                title='New Seasonal Collection',
                message='Discover our newest handbags and jewelry curated for a modern wardrobe.',
            ))

        db.session.commit()
