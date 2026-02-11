import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User, Group

# Create groups
data_entry_group, _ = Group.objects.get_or_create(name='DataEntry')
supervisor_group, _ = Group.objects.get_or_create(name='Supervisor')

def setup_user(username, password, group_name=None, is_superuser=False):
    user, created = User.objects.get_or_create(username=username)
    user.set_password(password)
    user.is_superuser = is_superuser
    user.is_staff = is_superuser
    user.save()
    
    if group_name:
        group = Group.objects.get(name=group_name)
        user.groups.clear()
        user.groups.add(group)
    
    status = "Created" if created else "Updated"
    print(f"{status} user: {username} with role: {group_name or 'Admin'}")

# 1. Admin Account (Separated)
setup_user('admin', 'admin123', is_superuser=True)

# 2. Supervisor Account
setup_user('supervisor', 'super123', group_name='Supervisor')

# 3. Data Entry Account
setup_user('data_entry', 'entry123', group_name='DataEntry')
