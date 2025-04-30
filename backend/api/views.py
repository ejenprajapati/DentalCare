#api/views.py
from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

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
    WorkSchedule, 
)
from .serializers import (
    UserSerializer, DentistSerializer, PatientSerializer, 
    RegisterDentistSerializer, RegisterPatientSerializer,
    DentalImageSerializer, DiseaseSerializer, 
    ImageAnalysisSerializer, AppointmentSerializer,
    TreatmentSerializer, WorkScheduleSerializer
   
)
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.files.base import ContentFile
from django.contrib.auth import authenticate

User = get_user_model()  


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
class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
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
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        self.perform_destroy(user)
        return Response({"detail": "Account successfully deleted."}, status=status.HTTP_204_NO_CONTENT)

# Dentist Views
class DentistViewSet(viewsets.ModelViewSet):
    serializer_class = DentistSerializer
    
    def get_queryset(self):
        
        return Dentist.objects.all()
    
    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            
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
            return Patient.objects.filter(user=self.request.user).prefetch_related(
                'appointment',
                'appointment__analyzed_image',
                'appointment__analyzed_image__diseases'
            ).select_related('user')
        elif self.request.user.role == 'dentist':
            dentist = self.request.user.dentist
            return Patient.objects.filter(appointment__dentist=dentist).distinct().prefetch_related(
                'appointment',
                'appointment__analyzed_image',
                'appointment__analyzed_image__diseases'
            ).select_related('user')
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
                return Appointment.objects.filter(patient=user.patient).select_related(
                    'analyzed_image', 'analyzed_image__original_image', 
                    'patient__user', 'dentist__user'  
                ).prefetch_related('analyzed_image__diseases')
            elif user.role == 'dentist':
                return Appointment.objects.filter(dentist=user.dentist).select_related(
                    'analyzed_image', 'analyzed_image__original_image', 
                    'patient__user', 'dentist__user' 
                ).prefetch_related('analyzed_image__diseases')
        return Appointment.objects.none()

    def create(self, request, *args, **kwargs):
        user = self.request.user
        data = request.data.copy()
        
        if user.role == 'patient' and not data.get('patient'):
            if hasattr(user, 'patient'):
                data['patient'] = user.patient.pk
        
        serializer = self.get_serializer(data=data)
        
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response({
            'status': 'success',
            'data': serializer.data,
            'redirect': '/appointments'
        }, status=status.HTTP_201_CREATED, headers=headers)
        
    def perform_create(self, serializer):
        serializer.save()
    
    
    def partial_update(self, request, *args, **kwargs):
        """
        Handle PATCH requests to update an appointment partially.
        """
        instance = self.get_object()
        
        # Print debugging information
        print(f"PATCH request data: {request.data}")
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            print(f"Update successful: {serializer.data}")
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in partial_update: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        try:
            
            appointment = Appointment.objects.get(pk=pk)
            
            
            if request.user.role != 'dentist' or request.user.dentist != appointment.dentist:
                return Response(
                    {"error": "Only the assigned dentist can approve appointments"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            appointment.approved = True
            appointment.save()
            return Response({"status": "appointment approved"})
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    



# Work Schedule Views
class WorkScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = WorkScheduleSerializer
    # permission_classes = [IsAuthenticated]
    
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if hasattr(user, 'dentist_profile'):
                return Appointment.objects.filter(dentist=user.dentist_profile)
            elif hasattr(user, 'patient_profile'):
                return Appointment.objects.filter(patient=user.patient_profile)
        return Appointment.objects.none()

    def post(self, request, *args, **kwargs):
        print("AnalyzeImageView post method called!")
        image_file = request.FILES.get('image')
        image_type = request.POST.get('image_type', 'normal')
        
        if not image_file:
            return Response(
                {'error': 'No image provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        print(f"Processing uploaded {image_type} image")
        
        try:
            # Save the original image
            original_dental_image = DentalImage.objects.create(image=image_file)
            original_dental_image.image_url = original_dental_image.image.url
            original_dental_image.save()
            print("Original image saved")
            
            # Save uploaded image to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                for chunk in image_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            # Load the appropriate YOLO model
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            
            if image_type == 'xray':
                model_path = os.path.join(BASE_DIR, 'model', 'x-ray_model.pt')
                class_names = ['cavity', 'fillings', 'impacted_tooth', 'implant']
                colors = {
                    "cavity": "#FF0000",
                    "fillings": "#0000FF",
                    "impacted_tooth": "#00FF00",
                    "implant": "#800080"
                }
            else:
                model_path = os.path.join(BASE_DIR, 'model', 'best_model.pt')
                class_names = ['calculus', 'caries', 'gingivitis', 'hypodontia', 'tooth_discolation', 'ulcer']
                colors = {
                    "calculus": "#FFD700",
                    "caries": "#FF0000",
                    "gingivitis": "#FF69B4",
                    "hypodontia": "#800080",
                    "tooth_discolation": "#A0522D",
                    "ulcer": "#FFA500"
                }
            
            print(f"Loading model from: {os.path.abspath(model_path)}")
            class_counts = {name: 0 for name in class_names}
            
            try:
                model = YOLO(model_path)
                print(f"YOLO model class names: {model.names}")
            except Exception as e:
                return Response(
                    {'error': f'Failed to load model: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Run inference
            results = model(temp_file_path)
            boxes = results[0].boxes
            
            # Normalize class names
            class_name_mapping = {
                'calculuss': 'calculus',
                'tooth_discolations': 'tooth_discolation',
                'fillings': 'fillings',
                'impacted tooth': 'impacted_tooth'
            }
            class_boxes = {name: [] for name in class_names}
            
            # Process boxes and count detections
            for box in boxes:
                class_index = int(box.cls.cpu().numpy()[0])
                class_name = results[0].names[class_index].lower()
                class_name = class_name_mapping.get(class_name, class_name)
                
                if class_name in class_counts:
                    box_coords = [int(v) for v in box.xyxy.cpu().numpy()[0]]
                    class_boxes[class_name].append(box_coords)
                    class_counts[class_name] += 1
                else:
                    print(f"Warning: Unrecognized class name {class_name}")
            
            print(f"Class counts: {class_counts}")
            
            # Draw boxes on image
            img = Image.open(temp_file_path)
            draw = ImageDraw.Draw(img)
            
            for class_name, boxes_list in class_boxes.items():
                for box in boxes_list:
                    draw.rectangle(box, outline=colors[class_name], width=3)
                    draw.text((box[0], box[1] - 15), f"{class_name}: {class_counts[class_name]}", 
                            fill=colors[class_name])
            
            # Convert image to RGB before saving as JPEG
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Save the annotated image
            annotated_img_path = temp_file_path + "_annotated.jpg"
            img.save(annotated_img_path, format='JPEG')
            print("Annotated image saved to temporary file")
            
            # Save the annotated image to Django storage
            with open(annotated_img_path, 'rb') as f:
                annotated_image_name = f"analyzed_{image_file.name}"
                analyzed_dental_image = DentalImage.objects.create(
                    image=ContentFile(f.read(), name=annotated_image_name)
                )
                analyzed_dental_image.image_url = analyzed_dental_image.image.url
                analyzed_dental_image.save()
            print("Annotated image saved to Django storage")
            
            # Calculate total conditions
            total_conditions = sum(class_counts.values())
            
            # Create ImageAnalysis record
            analysis_data = {
                'user': request.user,
                'original_image': original_dental_image,
                'analyzed_image_url': analyzed_dental_image.image.url,
                'total_conditions': total_conditions,
                'image_type': image_type
            }
            
            if image_type == 'xray':
                analysis_data.update({
                    'calculus_count': 0,
                    'caries_count': 0,
                    'gingivitis_count': 0,
                    'hypodontia_count': 0,
                    'tooth_discolation_count': 0,
                    'ulcer_count': 0,
                    'cavity_count': class_counts.get('cavity', 0),
                    'fillings_count': class_counts.get('fillings', 0),
                    'impacted_tooth_count': class_counts.get('impacted_tooth', 0),
                    'implant_count': class_counts.get('implant', 0)
                })
            else:
                analysis_data.update({
                    'calculus_count': class_counts.get('calculus', 0),
                    'caries_count': class_counts.get('caries', 0),
                    'gingivitis_count': class_counts.get('gingivitis', 0),
                    'hypodontia_count': class_counts.get('hypodontia', 0),
                    'tooth_discolation_count': class_counts.get('tooth_discolation', 0),
                    'ulcer_count': class_counts.get('ulcer', 0),
                    'cavity_count': 0,
                    'fillings_count': 0,
                    'impacted_tooth_count': 0,
                    'implant_count': 0
                })
            
            print(f"Creating ImageAnalysis with data: {analysis_data}")
            analysis = ImageAnalysis.objects.create(**analysis_data)
            print("ImageAnalysis created successfully")
            
            # Create disease records
            for disease_name, count in class_counts.items():
                if count > 0:
                    display_name = disease_name.replace('_', ' ').capitalize()
                    print(f"Creating disease: {display_name}")
                    disease, created = Disease.objects.get_or_create(
                        name=display_name,
                        defaults={'description': f'AI detected {display_name}'}
                    )
                    analysis.diseases.add(disease, through_defaults={'confidence': 0.9})
            
            # Convert images to base64
            with open(temp_file_path, "rb") as img_file:
                original_img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            
            with open(annotated_img_path, "rb") as img_file:
                analyzed_img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            
            # Prepare response
            response_data = {
                'originalImage': f"data:image/jpeg;base64,{original_img_base64}",
                'analyzedImage': f"data:image/jpeg;base64,{analyzed_img_base64}",
                'totalConditionsDetected': total_conditions,
                'analysisId': analysis.id,
                'imageType': image_type
            }
            
            if image_type == 'xray':
                response_data.update({
                    'cavityCount': class_counts.get('cavity', 0),
                    'fillingsCount': class_counts.get('fillings', 0),
                    'impactedToothCount': class_counts.get('impacted_tooth', 0),
                    'implantCount': class_counts.get('implant', 0),
                    'calculusCount': 0,
                    'cariesCount': 0,
                    'gingivitisCount': 0,
                    'hypodontiaCount': 0,
                    'toothDiscolationCount': 0,
                    'ulcerCount': 0
                })
            else:
                response_data.update({
                    'calculusCount': class_counts.get('calculus', 0),
                    'cariesCount': class_counts.get('caries', 0),
                    'gingivitisCount': class_counts.get('gingivitis', 0),
                    'hypodontiaCount': class_counts.get('hypodontia', 0),
                    'toothDiscolationCount': class_counts.get('tooth_discolation', 0),
                    'ulcerCount': class_counts.get('ulcer', 0),
                    'cavityCount': 0,
                    'fillingsCount': 0,
                    'impactedToothCount': 0,
                    'implantCount': 0
                })
            
            # Clean up temporary files
            os.unlink(temp_file_path)
            os.unlink(annotated_img_path)
            
            print("Returning response")
            return Response(response_data)
        
        except Exception as e:
            import traceback
            traceback.print_exc()
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
        if request.user.role != 'dentist':
            return Response(
                {"error": "Only dentists can access dashboard stats"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        dentist = request.user.dentist
        today = timezone.now().date()
        
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
        
        all_appointments = Appointment.objects.filter(
            dentist=dentist
        ).select_related('patient__user')
        
        # Format appointments for the response
        appointment_list = []
        for appointment in all_appointments:
            patient_user = appointment.patient.user
            appointment_list.append({
                'id': appointment.id,
                'patient_name': f"{patient_user.first_name} {patient_user.last_name}",
                'patient_id': appointment.patient.user.id,
                'time': f"{appointment.start_time.strftime('%H:%M')} - {appointment.end_time.strftime('%H:%M')}",
                'status': 'Confirmed' if appointment.approved else 'Pending',
                'gender': patient_user.gender or 'Unknown',  # Get actual gender from User model
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
                visit_id= 1000+patient_user.id
                recent_patients_list.append({
                    'id': patient_user.id,
                    'name': f"{patient_user.first_name} {patient_user.last_name}",
                    
                    'visit_id': visit_id,
                    'date': last_visit.date.strftime('%m/%d/%y'),
                    'gender': patient_user.gender or 'Unknown'  # Get actual gender from User model
                })
        
        # Get actual gender distribution from patients who have appointments with this dentist
        gender_counts = {
            'male': 0,
            'female': 0,
            'others': 0
        }
        
        # Query all patients of this dentist and count their genders
        patients_with_appointments = Patient.objects.filter(
            appointment__dentist=dentist
        ).distinct().select_related('user')
        
        for patient in patients_with_appointments:
            user_gender = patient.user.gender
            
            
            if user_gender == 'male':
                gender_counts['male'] += 1
            elif user_gender == 'female':
                gender_counts['female'] += 1
            else:
                # For 'other' 
                gender_counts['others'] += 1
        
        return Response({
            'total_appointments': total_appointments,
            'new_patients_count': new_patients_count,
            'total_patients': total_patients,
            'appointments': appointment_list,
            'recent_patients': recent_patients_list,
            'gender_distribution': gender_counts
        })
    
class UserAnalysisListView(generics.ListAPIView):
    serializer_class = ImageAnalysisSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ImageAnalysis.objects.filter(user=self.request.user).order_by('-created_at')
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response(
                {'error': 'Both current and new password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify current password
        if not authenticate(username=user.username, password=current_password):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({'success': True})
class CheckUsernameView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        username = request.query_params.get('username', '')
        if not username:
            return Response({'error': 'Username parameter is required'}, status=400)
            
        exists = User.objects.filter(username=username).exists()
        return Response({'exists': exists})
    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user_exists = User.objects.filter(username=username).exists()
        if user_exists:
            return Response({"exists": True}, status=status.HTTP_200_OK)
        else:
            return Response({"exists": False}, status=status.HTTP_404_NOT_FOUND)