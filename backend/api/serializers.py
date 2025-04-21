
# api/serializers.py
from rest_framework import serializers
from .models import (
    User, Dentist, Patient, DentalImage, Disease, 
    ImageAnalysis, Appointment, Treatment, 
    WorkSchedule, Blog, Comment
)
from django.contrib.auth import get_user_model

User = get_user_model()  
class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'gender', 'profile_picture', 'profile_picture_url']
        extra_kwargs = {
            'password': {'write_only': True},
        }

class UserSerializer(serializers.ModelSerializer):
    patient = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(required=False)
    

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 
                 'phone_number', 'role', 'gender', 'patient', 'profile_picture', 'profile_picture_url']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def get_patient(self, obj):
        if obj.role == 'patient' and hasattr(obj, 'patient'):
            return PatientSerializer(obj.patient).data
        return None

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Handle profile picture
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            instance.profile_picture = profile_picture
            instance.profile_picture_url = "pending"
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Set password if provided
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

class DentistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Dentist
        fields = ['user', 'specialization', 'experience', 'qualification']

class DentalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DentalImage
        fields = ['id', 'image', 'image_url', 'uploaded_at']

class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = ['id', 'name', 'description']

# Update in serializers.py
class ImageAnalysisSerializer(serializers.ModelSerializer):
    diseases = DiseaseSerializer(many=True, read_only=True)
    original_image = DentalImageSerializer(read_only=True)
    
    class Meta:
        model = ImageAnalysis
        fields = ['id', 'user', 'original_image', 'analyzed_image_url', 'created_at', 
                  'diseases', 'total_conditions', 'calculus_count', 'caries_count', 
                  'gingivitis_count', 'hypodontia_count', 'tooth_discolation_count', 
                  'ulcer_count']



class AppointmentSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())
    dentist = serializers.PrimaryKeyRelatedField(queryset=Dentist.objects.all())
    analyzed_image = ImageAnalysisSerializer(read_only=True, required=False)
    analyzed_image_id = serializers.PrimaryKeyRelatedField(
        queryset=ImageAnalysis.objects.all(),
        source='analyzed_image',
        required=False,
        allow_null=True
    )

    class Meta:
        model = Appointment
        fields = [
            'id', 'detail', 'date', 'start_time', 'end_time',
            'approved', 'patient', 'dentist', 'created_at',
            'analyzed_image', 'analyzed_image_id', 'treatment'
        ]

    def validate(self, data):
        """
        Custom validation to handle the comparison that was causing errors.
        """
        # Check if this is a partial update for just the treatment field
        if self.partial and set(data.keys()) == {'treatment'}:
            # Skip other validations if we're only updating the treatment
            return data
            
        # Get the start and end times, either from validated data or original instance
        instance = self.instance
        start_time = data.get('start_time', instance.start_time if instance else None)
        end_time = data.get('end_time', instance.end_time if instance else None)
        
        # Only do comparison if both times are provided
        if start_time is not None and end_time is not None:
            if start_time >= end_time:
                raise serializers.ValidationError({"end_time": "End time must be after start time."})
        
        return data
class PatientSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    id = serializers.IntegerField(source='user_id', read_only=True)
    appointments = AppointmentSerializer(many=True, read_only=True, source='appointment')

    class Meta:
        model = Patient
        fields = ['id', 'user', 'emergency_contact', 'allergies', 'member_since', 'appointments']

class RegisterDentistSerializer(serializers.ModelSerializer):
    gender = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)
    specialization = serializers.CharField(required=False)
    experience = serializers.CharField(required=False)
    qualification = serializers.CharField(required=False)
    work_schedule = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                 'phone_number', 'specialization', 'experience', 'qualification', 
                 'gender', 'work_schedule']
    
    def validate_email(self, value):
        if not value.endswith('@dentalcare.com'):
            raise serializers.ValidationError("Dentist email must end with @dentalcare.com")
        return value
    
    def validate_work_schedule(self, value):
        if not value:
            raise serializers.ValidationError("At least one working day is required")
        
        for schedule in value:
            if 'day' not in schedule or 'start_hour' not in schedule or 'end_hour' not in schedule:
                raise serializers.ValidationError("Each schedule must have day, start_hour, and end_hour")
            
            try:
                start_hour = int(schedule['start_hour'])
                end_hour = int(schedule['end_hour'])
                
                if start_hour >= end_hour:
                    raise serializers.ValidationError(f"End time must be after start time for {schedule['day']}")
                
                if end_hour - start_hour < 5:
                    raise serializers.ValidationError(f"Working hours must be at least 5 hours for {schedule['day']}")
            except ValueError:
                raise serializers.ValidationError("Hours must be integers")
        
        return value
    
    def create(self, validated_data):
        specialization = validated_data.pop('specialization', None)
        experience = validated_data.pop('experience', None)
        qualification = validated_data.pop('qualification', None)
        gender = validated_data.pop('gender', None)
        work_schedule = validated_data.pop('work_schedule', [])
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role='dentist',
            gender=gender
        )
        
        dentist = user.dentist
        if specialization:
            dentist.specialization = specialization
        if experience:
            dentist.experience = experience
        if qualification:
            dentist.qualification = qualification
        dentist.save()
        
        # Create work schedule
        if work_schedule:
            for schedule in work_schedule:
                WorkSchedule.objects.create(
                    dentist=dentist,
                    day=schedule['day'],
                    start_hour=schedule['start_hour'],
                    end_hour=schedule['end_hour']
                )
        
        return user

class RegisterPatientSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)
    emergency_contact = serializers.CharField(required=False)
    allergies = serializers.CharField(required=False)
    gender = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                 'phone_number', 'emergency_contact', 'allergies', 'gender']
    
    def validate_email(self, value):
        if value.endswith('@dentalcare.com'):
            raise serializers.ValidationError("Patient email cannot end with @dentalcare.com")
        return value
    
    def create(self, validated_data):
        emergency_contact = validated_data.pop('emergency_contact', None)
        allergies = validated_data.pop('allergies', None)
        gender = validated_data.pop('gender', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            role='patient',
            gender=gender
        )
        
        patient = user.patient
        if emergency_contact:
            patient.emergency_contact = emergency_contact
        if allergies:
            patient.allergies = allergies
        patient.save()
        
        return user



class TreatmentSerializer(serializers.ModelSerializer):
    dentist_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Treatment
        fields = ['id', 'detail', 'date', 'dentist', 'patient', 'dentist_name']
    
    def get_dentist_name(self, obj):
        return f"{obj.dentist.user.first_name} {obj.dentist.user.last_name}"

class WorkScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields = ['id', 'dentist', 'day', 'start_hour', 'end_hour']

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'blog', 'user', 'text', 'created_at', 'username']
        read_only_fields = ['user']
    
    def get_username(self, obj):
        return obj.user.username

class BlogSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    dentist_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Blog
        fields = ['id', 'title', 'content', 'created_at', 'dentist', 'comments', 'dentist_name']
        read_only_fields = ['dentist']
    
    def get_dentist_name(self, obj):
        return f"{obj.dentist.user.first_name} {obj.dentist.user.last_name}"