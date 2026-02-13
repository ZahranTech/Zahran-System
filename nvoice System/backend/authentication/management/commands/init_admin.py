from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = 'Creates a superuser automatically if it does not exist (Free Tier Mode)'

    def handle(self, *args, **options):
        # Default credentials for free SQLite tier
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin') # Default simple password

        if not User.objects.filter(username=username).exists():
            print(f'Creating superuser: {username}')
            try:
                User.objects.create_superuser(username, email, password)
                print(f'Superuser "{username}" created successfully with password "{password}".')
            except Exception as e:
                print(f'Error creating superuser: {e}')
        else:
            print(f'Superuser "{username}" already exists.')
