from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Blog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model= User
        fields=['id','username','email','password']
        extra_kwargs={"password":{"write_only": True}}
        
    def create(self, validated_data):
        user= User.objects.create_user(**validated_data)
        return user
class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model= Blog
        fields =["id","title", "content", "created_at", "author"]
        extra_kwargs={"author":{"read_only": True}}