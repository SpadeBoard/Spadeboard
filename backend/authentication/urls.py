from django.contrib import admin
from django.urls import path, include
from .views import Loginview, RegisterView, LogoutView

from rest_framework_simplejwt import views as jwt_views


urlpatterns = [
    path('register', RegisterView.as_view(), name="register"),
    path('login', Loginview.as_view(), name="login"),
    path('logout', LogoutView.as_view(), name = "logout"),
    
    path('token/',  jwt_views.TokenObtainPairView.as_view(), name ='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name ='token_refresh')
]