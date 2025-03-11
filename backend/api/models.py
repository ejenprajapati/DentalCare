from django.db import models
from django.contrib.auth.models import User
# backend/crud/models.py
from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Blog(models.Model):
    title= models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add= True)
    author= models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title


class DentalAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    original_image = models.ImageField(upload_to='dental_images/')
    analyzed_image = models.ImageField(upload_to='dental_analyses/')
    teeth_count = models.IntegerField(default=0)
    caries_count = models.IntegerField(default=0)
    caries_percentage = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Analysis {self.id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        verbose_name_plural = "Dental Analyses"
        ordering = ['-created_at']
