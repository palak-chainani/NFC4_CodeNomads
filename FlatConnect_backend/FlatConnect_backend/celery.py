from __future__ import absolute_import
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FlatConnect_backend.settings')

app = Celery('FlatConnect_backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# For development, use in-memory broker if no broker is configured
if not app.conf.broker_url:
    app.conf.broker_url = 'memory://'
    app.conf.result_backend = 'rpc://'

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')