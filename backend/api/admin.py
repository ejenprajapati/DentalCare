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
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'phone_number')}),
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
    list_display = ('id', 'image_type', 'uploaded_at')
    list_filter = ('image_type', 'uploaded_at')

@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

class ImageClassificationInline(admin.TabularInline):
    model = ImageClassification
    extra = 1

@admin.register(ImageAnalysis)
class ImageAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'user__email')
    inlines = [ImageClassificationInline]

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'dentist', 'date', 'start_time', 'end_time', 'approved')
    list_filter = ('approved', 'date')
    search_fields = ('patient__user__username', 'dentist__user__username')

@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'dentist', 'date')
    list_filter = ('date',)
    search_fields = ('patient__user__username', 'dentist__user__username', 'detail')

@admin.register(WorkSchedule)
class WorkScheduleAdmin(admin.ModelAdmin):
    list_display = ('dentist', 'day', 'start_time', 'end_time')
    list_filter = ('day',)
    search_fields = ('dentist__user__username',)

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