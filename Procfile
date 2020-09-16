release: python3 manage.py migrate
web: daphne asgi:application --port 6379 --bind 0.0.0.0 -v2 
worker: python manage.py runworker channels --settings=shielding.settings -v2
