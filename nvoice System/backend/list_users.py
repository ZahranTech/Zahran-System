import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
users = User.objects.all()
with open('users_list.txt', 'w') as f:
    for u in users:
        f.write(f"{u.username}\n")
