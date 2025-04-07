# api/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.contrib.auth.models import Group, Permission

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
    
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    
    # Fix the related_name conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.'
    )
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        # Auto-assign role based on email domain if not explicitly set
        if not self.role:
            if self.email.endswith('@dentalcare.com'):
                self.role = 'dentist'
            else:
                self.role = 'patient'
        super().save(*args, **kwargs)
        
        # Automatically create related Dentist or Patient record
        if self.role == 'dentist' and not hasattr(self, 'dentist'):
            Dentist.objects.create(user=self)
        elif self.role == 'patient' and not hasattr(self, 'patient'):
            Patient.objects.create(user=self, member_since=timezone.now().date())
    def delete(self, *args, **kwargs):
        """Ensure related records are deleted before user deletion."""
        if hasattr(self, 'dentist'):
            self.dentist.delete()
        if hasattr(self, 'patient'):
            self.patient.delete()
        super().delete(*args, **kwargs)

class Dentist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='dentist')
    specialization = models.CharField(max_length=50, blank=True, null=True)
    experience = models.CharField(max_length=10, blank=True, null=True)
    qualification = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - Dentist"

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='patient')
    emergency_contact = models.CharField(max_length=15, blank=True, null=True)
    allergies = models.TextField(blank=True, null=True)
    member_since = models.DateField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user.username} - Patient"

class DentalImage(models.Model):
    image = models.ImageField(upload_to='dental_images/')
    image_type = models.CharField(max_length=10)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Dental Image {self.id} - {self.image_type}"

class Disease(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class ImageAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    original_image = models.ForeignKey(DentalImage, on_delete=models.CASCADE)
    analyzed_image_url = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    diseases = models.ManyToManyField(Disease, through='ImageClassification')
    
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
    detail = models.TextField(blank=True, null=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    approved = models.BooleanField(default=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
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
    DAYS_CHOICES = (
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    )
    
    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE)
    day = models.CharField(max_length=10, choices=DAYS_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    class Meta:
        unique_together = ('dentist', 'day')
    
    def __str__(self):
        return f"{self.dentist.user.username} schedule for {self.day}"

class Blog(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return self.title

class Comment(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.blog.title}"