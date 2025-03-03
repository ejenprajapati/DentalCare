from django.urls import path
from . import views

urlpatterns=[
    path("blogs/", views.BlogListCreate.as_view(), name="blog-list"),
    path("blogs/delete/<int:pk>/", views.BlogDelete.as_view(), name="delete-blog")
]