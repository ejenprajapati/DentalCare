# api/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.contrib.auth.models import Group, Permission
from django.db import transaction


class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
        
        email = self.normalize_email(email)
        
        # Determine user role based on email domain
        if email.endswith('@dentalcare.com'):
            extra_fields.setdefault('role', 'dentist')
        else:
            extra_fields.setdefault('role', 'patient')
            
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('dentist', 'Dentist'),
    )
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    profile_picture_url = models.CharField(max_length=255, default="/media/profile_pictures/default.jpg")

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    
    
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_groups',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_user_permissions',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.'
    )
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        # Auto-assign role based on email domain if not explicitly set
        if not self.role:
            if self.email.endswith('@dentalcare.com'):
                self.role = 'dentist'
            else:
                self.role = 'patient'
        if self.profile_picture and (self.profile_picture_url == "none" or self.profile_picture_url == "pending"):
            
            super().save(*args, **kwargs)
            self.profile_picture_url = self.profile_picture.url
           
            return super().save(update_fields=['profile_picture_url'])
        super().save(*args, **kwargs)
        
        
        
        if is_new:
            if self.role == 'dentist' and not hasattr(self, 'dentist'):
                Dentist.objects.create(user=self)
            elif self.role == 'patient' and not hasattr(self, 'patient'):
                Patient.objects.create(user=self, member_since=timezone.now().date())

    def delete(self, *args, **kwargs):
        with transaction.atomic():
            
            self.groups.clear()
            self.user_permissions.clear()
            
            super().delete(*args, **kwargs)


class Dentist(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, primary_key=True, related_name='dentist')
    specialization = models.CharField(max_length=50, blank=True, null=True)
    experience = models.CharField(max_length=10, blank=True, null=True)
    qualification = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - Dentist"


class Patient(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, primary_key=True, related_name='patient')
    emergency_contact = models.CharField(max_length=15, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    member_since = models.DateField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user.username} - Patient"


class Disease(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name


class DentalImage(models.Model):
    image = models.ImageField(upload_to='dental_images/')
    image_url = models.CharField(max_length=255, default="none")  
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Dental Image {self.id}"

class ImageAnalysis(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    original_image = models.ForeignKey(DentalImage, on_delete=models.CASCADE)
    analyzed_image_url = models.CharField(max_length=255, default="none")
    created_at = models.DateTimeField(auto_now_add=True)
    image_type = models.CharField(max_length=10, choices=[('normal', 'Normal'), ('xray', 'X-ray')], default='normal')
    diseases = models.ManyToManyField(Disease, through='ImageClassification')
    
    
    total_conditions = models.IntegerField(default=0)
    calculus_count = models.IntegerField(default=0)
    caries_count = models.IntegerField(default=0)
    gingivitis_count = models.IntegerField(default=0)
    hypodontia_count = models.IntegerField(default=0)
    tooth_discolation_count = models.IntegerField(default=0)
    ulcer_count = models.IntegerField(default=0)

    cavity_count = models.IntegerField(default=0)
    fillings_count = models.IntegerField(default=0)
    impacted_tooth_count = models.IntegerField(default=0)
    implant_count = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Analysis {self.id} for {self.user.username}"
    
    class Meta:
        verbose_name_plural = "Image Analyses"


class ImageClassification(models.Model):
    analysis = models.ForeignKey(ImageAnalysis, on_delete=models.CASCADE)
    disease = models.ForeignKey(Disease, on_delete=models.CASCADE)
    confidence = models.FloatField(default=0.0)
    
    class Meta:
        unique_together = ('analysis', 'disease')


class Appointment(models.Model):
    TREATMENT_CHOICES = [
        ("Pending", "Pending"),
        ("Missing", "Missing"),
        ("Regular Checkup", "Regular Checkup"),
        ("Teeth Cleaning", "Teeth Cleaning"),
        ("Toothache", "Toothache"),
        ("Cavity/Filling", "Cavity/Filling"),
        ("Root Canal", "Root Canal"),
        ("Crown/Bridge Work", "Crown/Bridge Work"),
        ("Dentures", "Dentures"),
        ("Implants", "Implants"),
        ("Teeth Whitening", "Teeth Whitening"),
        ("Orthodontic Consultation", "Orthodontic Consultation"),
        ("Wisdom Teeth", "Wisdom Teeth"),
        ("Gum Disease Treatment", "Gum Disease Treatment"),
        ("Other", "Other")
    ]
    
    detail = models.TextField(blank=True, null=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    approved = models.BooleanField(default=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointment')
    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    analyzed_image = models.ForeignKey(
        ImageAnalysis,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments'
    )
    treatment = models.CharField(
        max_length=100,
        choices=TREATMENT_CHOICES,
        default="Pending",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Appointment: {self.patient.user.username} with {self.dentist.user.username} on {self.date}"

class Treatment(models.Model):
    detail = models.TextField()
    date = models.DateField()
    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"Treatment by {self.dentist.user.username} on {self.date}"


class WorkSchedule(models.Model):
    dentist = models.ForeignKey(Dentist, related_name='work_schedules', on_delete=models.CASCADE)
    day = models.CharField(max_length=10)  # e.g., Monday, Tuesday, etc.
    start_hour = models.CharField(max_length=2, default='9')  # Default 9 AM
    end_hour = models.CharField(max_length=2, default='17')  # Default 5 PM
    
    class Meta:
        unique_together = ('dentist', 'day')
        ordering = ['day']
    
    def __str__(self):
        return f"{self.dentist.user.get_full_name()} - {self.day} ({self.start_hour}:00 - {self.end_hour}:00)"
    class Meta:
        unique_together = ('dentist', 'day')  # Each dentist can have only one schedule per day
        ordering = ['day']
    
    def __str__(self):
        return f"{self.dentist.user.get_full_name()} - {self.day} ({self.start_hour}:00 - {self.end_hour}:00)"


