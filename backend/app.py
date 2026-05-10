from backend import create_app
from backend.init_db import seed_database

app = create_app()

with app.app_context():
    seed_database(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
