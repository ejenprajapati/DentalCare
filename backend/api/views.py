#api/views.py
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
from django.shortcuts import render, get_object_or_404
from rest_framework import generics, viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser
from datetime import datetime, timedelta
from .models import (
    User, Dentist, Patient, DentalImage, Disease, 
    ImageAnalysis, Appointment, Treatment, 
    WorkSchedule, Blog, Comment
)
from .serializers import (
    UserSerializer, DentistSerializer, PatientSerializer, 
    RegisterDentistSerializer, RegisterPatientSerializer,
    DentalImageSerializer, DiseaseSerializer, 
    ImageAnalysisSerializer, AppointmentSerializer,
    TreatmentSerializer, WorkScheduleSerializer, 
    BlogSerializer, CommentSerializer
)
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.authentication import JWTAuthentication

User = get_user_model()  
# Keep your existing AnalyzeImageView

# User Registration

class CreateUserView(generics.CreateAPIView):
    queryset= User.objects.all()
    serializer_class= UserSerializer
    permission_classes= [AllowAny]

class RegisterDentistView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterDentistSerializer
    permission_classes = [AllowAny]

class RegisterPatientView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterPatientSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)
        return super().create(request, *args, **kwargs)

# User Profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        print(f"User ID: {user.id}, Username: {user.username}, Role: {getattr(user, 'role', 'unknown')}")
        print(f"User is authenticated: {self.request.user.is_authenticated}")
        print(f"Authentication used: {self.request.auth}")
        return user
        
    def retrieve(self, request, *args, **kwargs):
        print(f"Auth header: {request.headers.get('Authorization', 'None')}")
        print(f"Session auth: {request.session.get('_auth_user_id', 'None')}")
        return super().retrieve(request, *args, **kwargs)

# Dentist Views
class DentistViewSet(viewsets.ModelViewSet):
    serializer_class = DentistSerializer
    # permission_classes = [AllowAny]
    
    
    # def get_queryset(self):
    #     if self.request.user.role == 'dentist':
    #         return Dentist.objects.filter(user=self.request.user)
    #     else:
    #         return Dentist.objects.all()
    def get_queryset(self):
        
        return Dentist.objects.all()
    
    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            # Allow anyone to view the list of dentists
            permission_classes = [AllowAny]
        else:
            # Require authentication for create, update, delete
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

# Patient Views
class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'patient':
            return Patient.objects.filter(user=self.request.user)
        elif self.request.user.role == 'dentist':
            # Dentists can see patients who have appointments with them
            dentist = self.request.user.dentist
            return Patient.objects.filter(appointment__dentist=dentist).distinct()
        else:
            return Patient.objects.none()

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.role == 'patient':
                return Appointment.objects.filter(patient=user.patient)
            elif user.role == 'dentist':
                return Appointment.objects.filter(dentist=user.dentist)
        return Appointment.objects.none()
    def create(self, request, *args, **kwargs):
        user = self.request.user
        data = request.data.copy()  # Create a mutable copy of request data
        
        # Set patient ID if user is a patient and patient ID not provided
        if user.role == 'patient' and not data.get('patient'):
            if hasattr(user, 'patient'):
                data['patient'] = user.patient.pk
        
        serializer = self.get_serializer(data=data)
        
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    # def create(self, request, *args, **kwargs):
    #     user = self.request.user
    #     print(f"Creating appointment: User: {user}, Authenticated: {user.is_authenticated}, Role: {getattr(user, 'role', 'unknown')}")
    #     print(f"Request data: {request.data}")
        
    #     serializer = self.get_serializer(data=request.data)
        
    #     if not serializer.is_valid():
    #         print(f"Validation errors: {serializer.errors}")
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    #     # Set patient or dentist based on user role if not provided
    #     if user.role == 'patient':
    #         if not hasattr(user, 'patient'):
    #             return Response(
    #                 {"error": "User does not have associated patient profile"},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )
    #         serializer.validated_data['patient'] = user.patient
    #     elif user.role == 'dentist':
    #         if not hasattr(user, 'dentist'):
    #             return Response(
    #                 {"error": "User does not have associated dentist profile"},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )
    #         # If a dentist is creating appointment for a patient, patient must be provided
    #         if 'patient' not in serializer.validated_data:
    #             return Response(
    #                 {"patient": ["Patient ID is required when dentist creates appointment"]},
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )
    #         serializer.validated_data['dentist'] = user.dentist
    #     else:
    #         return Response(
    #             {"error": ["Only patients and dentists can create appointments"]},
    #             status=status.HTTP_403_FORBIDDEN
    #         )
            
    #     self.perform_create(serializer)
    #     headers = self.get_success_headers(serializer.data)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        appointment = self.get_object()
        if request.user.role != 'dentist' or request.user.dentist != appointment.dentist:
            return Response(
                {"error": "Only the assigned dentist can approve appointments"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        appointment.approved = True
        appointment.save()
        return Response({"status": "appointment approved"})
    
# Blog Views
class BlogViewSet(viewsets.ModelViewSet):
    serializer_class = BlogSerializer
    
    def get_queryset(self):
        return Blog.objects.all().order_by('-created_at')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'dentist':
            raise PermissionError("Only dentists can create blogs")
        serializer.save(dentist=user.dentist)

# Comment Views
class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        blog_id = self.kwargs.get('blog_pk')
        return Comment.objects.filter(blog_id=blog_id)
    
    def perform_create(self, serializer):
        blog_id = self.kwargs.get('blog_pk')
        blog = get_object_or_404(Blog, id=blog_id)
        serializer.save(user=self.request.user, blog=blog)

# Work Schedule Views
class WorkScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = WorkScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        dentist_id = self.kwargs.get('dentist_pk')
        return WorkSchedule.objects.filter(dentist_id=dentist_id)
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'dentist':
            raise PermissionError("Only dentists can create work schedules")
        serializer.save(dentist=user.dentist)

class AnalyzeImageView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    print("inside analye image")
    def post(self, request, *args, **kwargs):
        print("AnalyzeImageView post method called!")
        image_file = request.FILES.get('image')
        if not image_file:
            return Response(
                {'error': 'No image provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        print("inside post image")
        
        try:
            print("inside try   ")
            # Save uploaded image to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                for chunk in image_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            # Load the YOLO model
            
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(BASE_DIR, 'model', 'best_model.pt')
            print(f"Attempting to load model from: {os.path.abspath(model_path)}")
            try:
                
                model = YOLO(model_path)
            except Exception as e:
                return Response(
                    {'error': f'Failed to load model: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Run inference
            results = model(temp_file_path)
            
            # Extract boxes
            boxes = results[0].boxes
            
            # Define colors for each class
            colors = {
                "calculus": "#FFD700",  # Gold
                "caries": "#FF0000",    # Red
                "gingivitis": "#FF69B4", # Hot pink
                "hypodontia": "#800080", # Purple
                "tooth_discolation": "#A0522D", # Brown
                "ulcer": "#FFA500"      # Orange
            }
            
            # Count detections for each class
            class_counts = {
                "calculus": 0,
                "caries": 0,
                "gingivitis": 0,
                "hypodontia": 0,
                "tooth_discolation": 0,
                "ulcer": 0
            }
            
            # Extract boxes for each class
            class_boxes = {class_name: [] for class_name in class_counts.keys()}
            
            # Process boxes and count detections
            for box in boxes:
                class_index = int(box.cls.cpu().numpy()[0])
                class_name = results[0].names[class_index].lower()  # Convert to lowercase for consistency
                
                # Store box coordinates for each class
                if class_name in class_counts:
                    box_coords = [int(v) for v in box.xyxy.cpu().numpy()[0]]
                    class_boxes[class_name].append(box_coords)
                    class_counts[class_name] += 1
            
            # Draw boxes on image
            img = Image.open(temp_file_path)
            draw = ImageDraw.Draw(img)
            
            # Draw boxes for each class with their respective colors
            for class_name, boxes_list in class_boxes.items():
                for box in boxes_list:
                    draw.rectangle(box, outline=colors[class_name], width=3)
                    # Add label to the box
                    draw.text((box[0], box[1] - 15), f"{class_name}: {class_counts[class_name]}", fill=colors[class_name])
            
            # Save the annotated image
            annotated_img_path = temp_file_path + "_annotated.jpg"
            img.save(annotated_img_path)
            
            # Converting images to base64 for response
            with open(temp_file_path, "rb") as img_file:
                original_img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            
            with open(annotated_img_path, "rb") as img_file:
                analyzed_img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            
            # Prepare response data
            response_data = {
                'originalImage': f"data:image/jpeg;base64,{original_img_base64}",
                'analyzedImage': f"data:image/jpeg;base64,{analyzed_img_base64}",
                'totalConditionsDetected': sum(class_counts.values())
            }
            
            # Add counts for each dental condition
            for condition in class_counts.keys():
                count = class_counts[condition]
                
                # Convert snake_case to camelCase for JSON response
                if condition == "tooth_discolation":
                    key = "toothDiscolation"
                else:
                    key = condition
                
                response_data[key + "Count"] = count
            
            # Clean up temporary files
            os.unlink(temp_file_path)
            os.unlink(annotated_img_path)
            
            # Return response
            return Response(response_data)
        
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
        
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get statistics for the dentist dashboard
        """
        print("inside get")
        if request.user.role != 'dentist':
            return Response(
                {"error": "Only dentists can access dashboard stats"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        dentist = request.user.dentist
        today = timezone.now().date()
        print("if  satisfied")
        # Get appointment counts
        total_appointments = Appointment.objects.filter(dentist=dentist).count()
        
        # Get patient stats
        new_patients_count = Patient.objects.filter(
            appointment__dentist=dentist, 
            member_since__gte=today - timedelta(days=30)
        ).distinct().count()
        
        total_patients = Patient.objects.filter(
            appointment__dentist=dentist
        ).distinct().count()
        
        # Get today's appointments
        today_appointments = Appointment.objects.filter(
            dentist=dentist,
            date=today
        ).select_related('patient__user')
        
        # Format appointments for the response
        appointment_list = []
        for appointment in today_appointments:
            patient_user = appointment.patient.user
            appointment_list.append({
                'id': appointment.id,
                'patient_name': f"{patient_user.first_name} {patient_user.last_name}",
                'patient_id': appointment.patient.user.id,
                'time': f"{appointment.start_time.strftime('%H:%M')} - {appointment.end_time.strftime('%H:%M')}",
                'status': 'Confirmed' if appointment.approved else 'Pending',
                'gender': 'Male' if patient_user.first_name.endswith('o') else 'Female',  # This is an approximation, you might want to add a gender field
                'date': appointment.date.strftime('%m/%d/%y'),
                'detail': appointment.detail
            })
        
        # Get recent patients
        recent_patients = Patient.objects.filter(
            appointment__dentist=dentist
        ).distinct().order_by('-appointment__date')[:5]
        
        recent_patients_list = []
        for patient in recent_patients:
            last_visit = Appointment.objects.filter(
                dentist=dentist,
                patient=patient
            ).order_by('-date').first()
            
            if last_visit:
                patient_user = patient.user
                recent_patients_list.append({
                    'id': patient_user.id,
                    'name': f"{patient_user.first_name} {patient_user.last_name}",
                    'visit_id': f"{'OPD' if patient.emergency_contact else 'IPD'}-{1000 + patient_user.id}",
                    'date': last_visit.date.strftime('%m/%d/%y'),
                    'gender': 'Male' if patient_user.first_name.endswith('o') else 'Female'  # Approximation
                })
        
        # Get gender distribution (simplified for this example)
        # In a real app, you'd have a gender field in your User or Patient model
        male_count = total_patients * 0.45  # Approximated based on the pie chart
        female_count = total_patients * 0.3
        child_count = total_patients * 0.25
        
        return Response({
            'total_appointments': total_appointments,
            'new_patients_count': new_patients_count,
            'total_patients': total_patients,
            'appointments': appointment_list,
            'recent_patients': recent_patients_list,
            'gender_distribution': {
                'male': int(male_count),
                'female': int(female_count),
                'child': int(child_count)
            }
        })