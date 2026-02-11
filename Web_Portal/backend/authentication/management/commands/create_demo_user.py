from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create a demo user for testing'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='demo').exists():
            User.objects.create_user(
                username='demo',
                email='demo@zahrantech.com',
                password='Demo@123',
                first_name='Demo',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS('✅ Demo user created: demo / Demo@123'))
        else:
            self.stdout.write(self.style.WARNING('⚠ Demo user already exists'))
