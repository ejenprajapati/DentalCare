from django.urls import path
from . import views
from .views import AnalyzeImageView

urlpatterns=[
    path("blogs/", views.BlogListCreate.as_view(), name="blog-list"),
    path("blogs/delete/<int:pk>/", views.BlogDelete.as_view(), name="delete-blog"),
    path('analyze-image/', AnalyzeImageView.as_view(), name='analyze-image'),
]







