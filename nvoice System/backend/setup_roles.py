import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User, Group

# Create Data Entry group
data_entry_group, _ = Group.objects.get_or_create(name='DataEntry')
# Create Supervisor group
supervisor_group, _ = Group.objects.get_or_create(name='Supervisor')

# Create Data Entry User
if not User.objects.filter(username='data_entry').exists():
    user = User.objects.create_user('data_entry', password='password123')
    user.groups.add(data_entry_group)
    print("Created data_entry user")

# Create Supervisor User
if not User.objects.filter(username='supervisor').exists():
    user = User.objects.create_user('supervisor', password='password123')
    user.groups.add(supervisor_group)
    print("Created supervisor user")
