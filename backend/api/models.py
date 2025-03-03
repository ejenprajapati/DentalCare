# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with email as unique identifier."""
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class DentalService(models.Model):
    """Model for dental services offered."""
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to='service_icons/')
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class Appointment(models.Model):
    """Model for managing patient appointments."""
    
    APPOINTMENT_STATUS = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    service = models.ForeignKey(DentalService, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    time = models.TimeField()
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=APPOINTMENT_STATUS, default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    dentist = models.ForeignKey('Dentist', on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.TextField(blank=True, null=True)
    is_emergency = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.email} - {self.date} {self.time}"

    class Meta:
        ordering = ['-date', '-time']


class DentalRecord(models.Model):
    """Model for storing patient dental records."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dental_records')
    record_date = models.DateField()
    treatment = models.CharField(max_length=200)
    diagnosis = models.TextField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    dentist = models.ForeignKey('Dentist', on_delete=models.SET_NULL, null=True, blank=True)
    attachments = models.ManyToManyField('DentalRecordAttachment', blank=True)
    follow_up_date = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.record_date}"


class DentalRecordAttachment(models.Model):
    """Model for storing attachments to dental records."""
    
    file = models.FileField(upload_to='dental_record_attachments/')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class AIAnalysis(models.Model):
    """Model for AI-based dental analysis."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_analyses')
    image = models.ImageField(upload_to='dental_images/')
    analysis_result = models.JSONField()
    confidence_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    recommendations = models.TextField(blank=True, null=True)
    is_reviewed_by_dentist = models.BooleanField(default=False)
    dentist_feedback = models.TextField(blank=True, null=True)
    dentist_reviewer = models.ForeignKey('Dentist', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.created_at.strftime('%Y-%m-%d')}"


class Dentist(models.Model):
    """Model for storing dentist information."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dentist_profile')
    specialization = models.CharField(max_length=100, blank=True, null=True)
    license_number = models.CharField(max_length=50, unique=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Dr. {self.user.full_name}"


class Blog(models.Model):
    """Model for dental blog posts."""
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    featured_image = models.ImageField(upload_to='blog_images/', blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    categories = models.ManyToManyField('BlogCategory', related_name='blogs')
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-published_at', '-created_at']


class BlogCategory(models.Model):
    """Model for categorizing blog posts."""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Blog Categories"


class Review(models.Model):
    """Model for patient reviews."""
    
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]  # 1-5 star rating
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    dentist = models.ForeignKey(Dentist, on_delete=models.CASCADE, related_name='reviews', blank=True, null=True)
    service = models.ForeignKey(DentalService, on_delete=models.CASCADE, related_name='reviews', blank=True, null=True)
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.email} - {self.rating} stars"


class ContactMessage(models.Model):
    """Model for contact form messages."""
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True, null=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    responded = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} - {self.subject}"