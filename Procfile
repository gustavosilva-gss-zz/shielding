release: python3 manage.py migrate
web: daphne -b 0.0.0.0 -p 6379 asgi:application
worker: python manage.py runworker channels --settings=shielding.settings -v2
