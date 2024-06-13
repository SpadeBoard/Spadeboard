from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# Create your models here.

# https://docs.djangoproject.com/en/5.0/topics/auth/

# Do we even need a user model?
# https://github.com/7s9n/django-login-and-register/blob/master/users/models.py

class UserManager(BaseUserManager):
    def _create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError("The username field must be set.")
        username = self.normalize_email(username)
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_user(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(username, password, **extra_fields)
    
    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(username, password, **extra_fields)

class User(AbstractUser):
    username = models.CharField(max_length=320, unique=True)
    email = models.CharField(max_length=320, unique=True)
    password = models.CharField(max_length=320)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    objects = UserManager()

    def __str__(self):
        return self.username
