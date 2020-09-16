release: docker run -p 6379:6379 -d redis:5
web: daphne shielding.asgi:application --port $PORT --bind 0.0.0.0 -v2 
worker: python manage.py runworker channels --settings=shielding.settings -v2
