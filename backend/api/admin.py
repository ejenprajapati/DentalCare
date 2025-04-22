# api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User as AuthUser
from django.utils.translation import gettext_lazy as _
from .models import (
    User, Dentist, Patient, DentalImage, Disease, 
    ImageAnalysis, ImageClassification, Appointment, 
    Treatment, WorkSchedule, Blog, Comment
)


class DentistInline(admin.StackedInline):
    model = Dentist
    can_delete = False
    verbose_name_plural = 'Dentist Info'

class PatientInline(admin.StackedInline):
    model = Patient
    can_delete = False
    verbose_name_plural = 'Patient Info'

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'gender','role', 'is_staff','profile_picture', 'profile_picture_url')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'phone_number','gender','profile_picture_url')}),
        (_('Role'), {'fields': ('role',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role'),
        }),
    )
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

    def get_inlines(self, request, obj=None):
        if obj:
            if obj.role == 'dentist':
                return [DentistInline]
            elif obj.role == 'patient':
                return [PatientInline]
        return []
    def delete_queryset(self, request, queryset):
        """
        Override bulk deletion in the admin interface.
        This ensures the custom User.delete() method is called for each user.
        """
        for user in queryset:
            user.delete()  # Calls your custom delete() method

    def delete_model(self, request, obj):
        """
        Override single object deletion in the admin interface.
        This ensures the custom User.delete() method is called.
        """
        obj.delete()  # Calls your custom delete() method
    def get_deleted_objects(self, objs, request):
        """Customize the deletion confirmation page if needed."""
        from django.contrib.admin.utils import get_deleted_objects
        return get_deleted_objects(objs, request, self.admin_site)

@admin.register(Dentist)
class DentistAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'experience', 'qualification')
    search_fields = ('user__username', 'user__email', 'specialization')

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'emergency_contact', 'allergies', 'member_since')
    search_fields = ('user__username', 'user__email', 'allergies')
    list_filter = ('member_since',)


@admin.register(DentalImage)
class DentalImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'image_url', 'uploaded_at')
    list_filter = ('uploaded_at',)



@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

class ImageClassificationInline(admin.TabularInline):
    model = ImageClassification
    extra = 1

@admin.register(ImageAnalysis)
class ImageAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'original_image', 'analyzed_image_url', 
                   'total_conditions', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email')
    inlines = [ImageClassificationInline]
    readonly_fields = ('total_conditions', 'calculus_count', 'caries_count', 
                       'gingivitis_count', 'hypodontia_count', 'tooth_discolation_count', 
                       'ulcer_count')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'dentist', 'detail','date', 'start_time', 'end_time', 'treatment','approved', 'analyzed_image_id')
    list_filter = ('approved', 'date')
    search_fields = ('patient__user__username', 'dentist__user__username')

@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'dentist', 'date')
    list_filter = ('date',)
    search_fields = ('patient__user__username', 'dentist__user__username', 'detail')

@admin.register(WorkSchedule)
class WorkScheduleAdmin(admin.ModelAdmin):
    list_display = ['dentist', 'day', 'start_hour', 'end_hour']
    list_filter = ['day']
    search_fields = ['dentist__user__first_name', 'dentist__user__last_name', 'day']

@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ('title', 'dentist', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'content', 'dentist__user__username')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('blog', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('text', 'user__username', 'blog__title')