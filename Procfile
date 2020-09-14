release: python manage.py migrate
chat: daphne chat.asgi:channel_layer --port $PORT --bind 0.0.0.0 -v2
web: gunicorn shielding.wsgi --log-file -
worker: python manage.py runworker -v2
