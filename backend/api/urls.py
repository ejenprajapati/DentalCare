

# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import DashboardStatsView
from .views import (
    # UserViewSet,
    DentistViewSet, PatientViewSet, AppointmentViewSet,
    BlogViewSet, CommentViewSet, WorkScheduleViewSet,
    UserProfileView, AnalyzeImageView,
    # Import the registration views that you have or will create
    RegisterPatientView, RegisterDentistView, UserAnalysisListView,ChangePasswordView
)
from django.conf import settings
from django.conf.urls.static import static
router = DefaultRouter()
router.register(r'dentists', DentistViewSet, basename='dentist')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'blogs', BlogViewSet, basename='blog')

# Nested routes
blog_comments = router.register(r'blogs/(?P<blog_pk>\d+)/comments', 
                             CommentViewSet, 
                             basename='blog-comments')

dentist_schedule = router.register(r'dentists/(?P<dentist_pk>\d+)/schedule', 
                                WorkScheduleViewSet, 
                                basename='dentist-schedule')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User registration endpoints
    path('user/register/dentist/', RegisterDentistView.as_view(), name='register-dentist'),
    path('user/register/patient/', RegisterPatientView.as_view(), name='register-patient'),
    
    # Backwards compatibility with old endpoints
    path('register/dentist/', RegisterDentistView.as_view(), name='register-dentist-old'),
    path('register/patient/', RegisterPatientView.as_view(), name='register-patient-old'),
    
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/', UserProfileView.as_view(), name='user-profile-old'),
    
    path('analyze-image/', AnalyzeImageView.as_view(), name='analyze-image'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('user/analyses/', UserAnalysisListView.as_view(), name='user-analyses'),
    path('user/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
