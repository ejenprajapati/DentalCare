from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, BlogSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Blog
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
import os
import cv2
import numpy as np
import tempfile
import base64
from PIL import Image, ImageDraw
import torch
from ultralytics import YOLO


# Create your views here.
class BlogListCreate(generics.ListCreateAPIView):
    serializer_class= BlogSerializer
    permission_classes= [IsAuthenticated]

    def get_queryset(self):
       user= self.request.user
       return Blog.objects.filter(author=user)
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)
        
class BlogDelete(generics.DestroyAPIView):
    serializer_class= BlogSerializer
    permission_classes= [IsAuthenticated]
    
    def get_queryset(self):
       user= self.request.user
       return Blog.objects.filter(author=user)


class CreateUserView(generics.CreateAPIView):
    queryset= User.objects.all()
    serializer_class= UserSerializer
    permission_classes= [AllowAny]


class AnalyzeImageView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        print("AnalyzeImageView post method called!")
        image_file = request.FILES.get('image')
        if not image_file:
            return Response(
                {'error': 'No image provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Save uploaded file to temp directory
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                for chunk in image_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            # Load YOLO model - fix model path
            model_path = os.environ.get('YOLO_MODEL_PATH', 'model/best.pt')
            try:
                # Use absolute path from environment variable instead of relative path
                model = YOLO(model_path)
            except Exception as e:
                return Response(
                    {'error': f'Failed to load model: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Run inference
            results = model(temp_file_path)
            
            # Process the results
            boxes = results[0].boxes
            
            # Extract tooth boxes
            tooth_boxes = []
            for box in boxes:
                class_index = int(box.cls.cpu().numpy()[0])
                class_name = results[0].names[class_index]
                if class_name == "Tooth":
                    box_coords = [int(v) for v in box.xyxy.cpu().numpy()[0]]
                    tooth_boxes.append(box_coords)
            
            # Extract caries boxes
            caries_boxes = []
            for box in boxes:
                class_index = int(box.cls.cpu().numpy()[0])
                class_name = results[0].names[class_index]
                if class_name == "Caries":
                    box_coords = [int(v) for v in box.xyxy.cpu().numpy()[0]]
                    caries_boxes.append(box_coords)
            
            # Extract crack boxes
            crack_boxes = []
            for box in boxes:
                class_index = int(box.cls.cpu().numpy()[0])
                class_name = results[0].names[class_index]
                if class_name == "Crack":
                    box_coords = [int(v) for v in box.xyxy.cpu().numpy()[0]]
                    crack_boxes.append(box_coords)
            
            # Draw boxes on image
            img = Image.open(temp_file_path)
            draw = ImageDraw.Draw(img)
            
            # Draw tooth boxes in green
            for box in tooth_boxes:
                draw.rectangle(box, outline="#00FF00", width=3)
            
            # Draw caries boxes in red
            for box in caries_boxes:
                draw.rectangle(box, outline="#FF0000", width=3)
            
            # Draw crack boxes in orange
            for box in crack_boxes:
                draw.rectangle(box, outline="#FFA500", width=3)
            
            # Save the annotated image
            annotated_img_path = temp_file_path + "_annotated.jpg"
            img.save(annotated_img_path)
            
            # Convert images to base64 for response
            with open(temp_file_path, "rb") as img_file:
                original_img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            
            with open(annotated_img_path, "rb") as img_file:
                analyzed_img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            
            # Calculate metrics
            teeth_count = len(tooth_boxes)
            caries_count = len(caries_boxes)
            crack_count = len(crack_boxes)
            
            # Calculate percentages
            caries_percentage = (caries_count / teeth_count * 100) if teeth_count > 0 else 0
            crack_percentage = (crack_count / teeth_count * 100) if teeth_count > 0 else 0
            
            # Clean up temporary files
            os.unlink(temp_file_path)
            os.unlink(annotated_img_path)
            
            # Return response
            return Response({
                'originalImage': f"data:image/jpeg;base64,{original_img_base64}",
                'analyzedImage': f"data:image/jpeg;base64,{analyzed_img_base64}",
                'teethCount': teeth_count,
                'cariesCount': caries_count,
                'crackCount': crack_count,
                'cariesPercentage': caries_percentage,
                'crackPercentage': crack_percentage
            })
        
        except Exception as e:
            # Clean up in case of error
            if 'temp_file_path' in locals():
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                if os.path.exists(temp_file_path + "_annotated.jpg"):
                    os.unlink(temp_file_path + "_annotated.jpg")
            
            return Response(
                {'error': f'Error processing image: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )