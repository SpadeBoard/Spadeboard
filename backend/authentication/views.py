from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .models import User
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError
from rest_framework import status
from rest_framework.permissions import AllowAny

# Create your views here
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        access_token = AccessToken.for_user(user)
        refresh_token =RefreshToken.for_user(user)

        return Response({
            "user": serializer.data,
            "access_token" : str(access_token),
            "refresh_token" : str(refresh_token)
        })

class Loginview(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data["username"]
        password = request.data["password"]
        
        try:
            user = User.objects.get(username = username)
        except User.DoesNotExist:
            raise AuthenticationFailed("Account does  not exist")
        if user is None:
            raise AuthenticationFailed("User does not exist")
        if not user.check_password(password):
            raise AuthenticationFailed("Incorrect Password")

        access_token = AccessToken.for_user(user)
        refresh_token =RefreshToken.for_user(user)

        return Response({
            "access_token" : str(access_token),
            "refresh_token" : str(refresh_token)
        })
    
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data['refresh_token']

            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response("Logout Successful", status=status.HTTP_200_OK)
        except TokenError:
            raise AuthenticationFailed("Invalid Token")