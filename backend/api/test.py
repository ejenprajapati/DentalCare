from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from api.models import (
    User, Dentist, Patient, DentalImage, Disease, ImageAnalysis,
    Appointment, WorkSchedule
)
from api.serializers import (
    UserSerializer, RegisterDentistSerializer, RegisterPatientSerializer,
    DentistSerializer, PatientSerializer, AppointmentSerializer,
    ImageAnalysisSerializer, WorkScheduleSerializer
)
from rest_framework import status
from unittest.mock import patch
import tempfile
import os
import torch
from PIL import Image
import io
from datetime import date, time
from django.utils import timezone

User = get_user_model()

class UserModelTests(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'gender': 'male'
        }

    def test_create_patient_user(self):
        """Test creating a patient user and associated Patient object."""
        print("Running test_create_patient_user...")
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.role, 'patient')
        self.assertTrue(hasattr(user, 'patient'))
        self.assertEqual(user.patient.user, user)
        self.assertEqual(str(user), 'testuser')
        print("test_create_patient_user: PASSED")

    def test_create_dentist_user(self):
        """Test creating a dentist user with @dentalcare.com email."""
        print("Running test_create_dentist_user...")
        dentist_data = self.user_data.copy()
        dentist_data['email'] = 'test@dentalcare.com'
        user = User.objects.create_user(**dentist_data)
        self.assertEqual(user.role, 'dentist')
        self.assertTrue(hasattr(user, 'dentist'))
        self.assertEqual(user.dentist.user, user)
        print("test_create_dentist_user: PASSED")

    def test_user_delete_clears_relations(self):
        """Test that deleting a user clears related groups and permissions."""
        print("Running test_user_delete_clears_relations...")
        user = User.objects.create_user(**self.user_data)
        group = Group.objects.create(name='testgroup')
        user.groups.add(group)
        user.delete()
        self.assertFalse(User.objects.filter(username='testuser').exists())
        self.assertFalse(group.custom_user_groups.filter(username='testuser').exists())
        print("test_user_delete_clears_relations: PASSED")

class SerializerTests(TestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            username='patient1', email='patient@example.com', password='pass123',
            first_name='John', last_name='Doe', gender='male'
        )
        self.dentist_user = User.objects.create_user(
            username='dentist1', email='dentist@dentalcare.com', password='pass123',
            first_name='Jane', last_name='Smith', gender='female'
        )

    def test_register_patient_serializer(self):
        """Test RegisterPatientSerializer validation and creation."""
        print("Running test_register_patient_serializer...")
        data = {
            'username': 'newpatient',
            'email': 'newpatient@example.com',
            'password': 'testpass123',
            'first_name': 'New',
            'last_name': 'Patient',
            'gender': 'female',
            'emergency_contact': '1234567890',
            'allergies': 'None'
        }
        serializer = RegisterPatientSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.role, 'patient')
        self.assertEqual(user.patient.emergency_contact, '1234567890')
        print("test_register_patient_serializer: PASSED")

    def test_register_dentist_serializer_invalid_email(self):
        """Test RegisterDentistSerializer rejects non-dentalcare.com email."""
        print("Running test_register_dentist_serializer_invalid_email...")
        data = {
            'username': 'newdentist',
            'email': 'newdentist@example.com',
            'password': 'testpass123',
            'first_name': 'New',
            'last_name': 'Dentist',
            'gender': 'male',
            'specialization': 'Orthodontics',
            'work_schedule': [{'day': 'Monday', 'start_hour': '9', 'end_hour': '17'}]
        }
        serializer = RegisterDentistSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
        print("test_register_dentist_serializer_invalid_email: PASSED")

    def test_appointment_serializer_validation(self):
        """Test AppointmentSerializer validates start_time < end_time."""
        print("Running test_appointment_serializer_validation...")
        data = {
            'patient': self.patient_user.patient.pk,
            'dentist': self.dentist_user.dentist.pk,
            'date': '2025-05-01',
            'start_time': '10:00',
            'end_time': '09:00',  # Invalid: end_time before start_time
            'detail': 'Checkup',
            'treatment': 'Regular Checkup'
        }
        serializer = AppointmentSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('end_time', serializer.errors)
        print("test_appointment_serializer_validation: PASSED")

class AppointmentViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.patient_user = User.objects.create_user(
            username='patient1', email='patient@example.com', password='pass123'
        )
        self.dentist_user = User.objects.create_user(
            username='dentist1', email='dentist@dentalcare.com', password='pass123'
        )
        self.appointment_data = {
            'patient': self.patient_user.patient.pk,
            'dentist': self.dentist_user.dentist.pk,
            'date': '2025-05-01',
            'start_time': '10:00:00',
            'end_time': '11:00:00',
            'detail': 'Regular checkup',
            'treatment': 'Regular Checkup'
        }

    def test_create_appointment_as_patient(self):
        """Test that a patient can create an appointment."""
        print("Running test_create_appointment_as_patient...")
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.post(reverse('appointment-list'), self.appointment_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)
        self.assertEqual(Appointment.objects.first().patient, self.patient_user.patient)
        print("test_create_appointment_as_patient: PASSED")

    def test_approve_appointment_as_dentist(self):
        """Test that a dentist can approve their own appointment."""
        print("Running test_approve_appointment_as_dentist...")
        appointment = Appointment.objects.create(
            patient=self.patient_user.patient,
            dentist=self.dentist_user.dentist,
            date='2025-05-01',
            start_time='10:00:00',
            end_time='11:00:00',
            detail='Checkup'
        )
        self.client.force_authenticate(user=self.dentist_user)
        url = reverse('appointment-approve', kwargs={'pk': appointment.pk})
        print(f"Attempting to PATCH: {url}")
        response = self.client.patch(url, format='json')
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        appointment.refresh_from_db()
        self.assertTrue(appointment.approved)
        print("test_approve_appointment_as_dentist: PASSED")

    def test_approve_appointment_as_wrong_dentist(self):
        """Test that a different dentist cannot approve an appointment."""
        print("Running test_approve_appointment_as_wrong_dentist...")
        from django.urls import get_resolver
        print("Available URL names:", get_resolver().reverse_dict.keys())
        other_dentist = User.objects.create_user(
            username='dentist2', email='dentist2@dentalcare.com', password='pass123'
        )
        appointment = Appointment.objects.create(
            patient=self.patient_user.patient,
            dentist=self.dentist_user.dentist,
            date='2025-05-01',
            start_time='10:00:00',
            end_time='11:00:00',
            detail='Checkup'
        )
        self.client.force_authenticate(user=other_dentist)
        url = reverse('appointment-approve', kwargs={'pk': appointment.pk})
        print(f"Attempting to PATCH: {url}")
        response = self.client.patch(url, format='json')
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("test_approve_appointment_as_wrong_dentist: PASSED")

    def test_approve_nonexistent_appointment(self):
        """Test approving a non-existent appointment returns 404."""
        print("Running test_approve_nonexistent_appointment...")
        self.client.force_authenticate(user=self.dentist_user)
        url = reverse('appointment-approve', kwargs={'pk': 9999})
        print(f"Attempting to PATCH: {url}")
        response = self.client.patch(url, format='json')
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        print("test_approve_nonexistent_appointment: PASSED")

class AnalyzeImageViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='pass123'
        )
        self.client.force_authenticate(user=self.user)
        # Create a valid JPEG image
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        self.image = SimpleUploadedFile(
            "test.jpg", image_io.read(), content_type="image/jpeg"
        )

    @patch('api.views.YOLO')
    def test_analyze_image_success(self, mock_yolo):
        """Test successful image analysis with mocked YOLO model."""
        print("Running test_analyze_image_success...")
        # Mock YOLO model and results
        mock_result = type('MockResult', (), {
            'boxes': [
                type('MockBox', (), {
                    'cls': torch.tensor([0]),
                    'xyxy': torch.tensor([[10, 10, 50, 50]])
                })()
            ],
            'names': {0: 'caries'}
        })()
        mock_model = mock_yolo.return_value
        mock_model.return_value = [mock_result]

        response = self.client.post(
            reverse('analyze-image'),
            {'image': self.image, 'image_type': 'normal'},
            format='multipart'
        )
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('originalImage', response.data)
        self.assertIn('analyzedImage', response.data)
        self.assertEqual(ImageAnalysis.objects.count(), 1)
        self.assertEqual(DentalImage.objects.count(), 2)  # Original + annotated
        print("test_analyze_image_success: PASSED")

    def test_analyze_image_no_image(self):
        """Test image analysis fails when no image is provided."""
        print("Running test_analyze_image_no_image...")
        response = self.client.post(
            reverse('analyze-image'),
            {'image_type': 'normal'},
            format='multipart'
        )
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'No image provided')
        print("test_analyze_image_no_image: PASSED")

class DashboardStatsViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.dentist_user = User.objects.create_user(
            username='dentist1', email='dentist@dentalcare.com', password='pass123'
        )
        self.patient_user = User.objects.create_user(
            username='patient1', email='patient@example.com', password='pass123',
            gender='male'
        )
        self.appointment = Appointment.objects.create(
            patient=self.patient_user.patient,
            dentist=self.dentist_user.dentist,
            date='2025-05-01',
            start_time='10:00:00',
            end_time='11:00:00',
            detail='Checkup'
        )

    def test_dashboard_stats_as_dentist(self):
        """Test dashboard stats for a dentist."""
        print("Running test_dashboard_stats_as_dentist...")
        self.client.force_authenticate(user=self.dentist_user)
        response = self.client.get(reverse('dashboard-stats'))
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_appointments'], 1)
        self.assertEqual(response.data['total_patients'], 1)
        self.assertEqual(response.data['gender_distribution']['male'], 1)
        print("test_dashboard_stats_as_dentist: PASSED")

    def test_dashboard_stats_as_patient(self):
        """Test that a patient cannot access dashboard stats."""
        print("Running test_dashboard_stats_as_patient...")
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get(reverse('dashboard-stats'))
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("test_dashboard_stats_as_patient: PASSED")

class UserProfileViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='pass123',
            first_name='Test', last_name='User', gender='male'
        )
        self.client.force_authenticate(user=self.user)

    def test_retrieve_user_profile(self):
        """Test retrieving user profile data."""
        print("Running test_retrieve_user_profile...")
        response = self.client.get(reverse('user-profile'))
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        print("test_retrieve_user_profile: PASSED")

    def test_update_user_profile(self):
        """Test updating user profile data."""
        print("Running test_update_user_profile...")
        update_data = {'first_name': 'Updated', 'last_name': 'Name'}
        response = self.client.patch(reverse('user-profile'), update_data, format='json')
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
        print("test_update_user_profile: PASSED")

    def test_delete_user_profile(self):
        """Test deleting user profile."""
        print("Running test_delete_user_profile...")
        response = self.client.delete(reverse('user-profile'))
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='testuser').exists())
        print("test_delete_user_profile: PASSED")

class ChangePasswordViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='oldpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        """Test changing password with correct current password."""
        print("Running test_change_password_success...")
        data = {'current_password': 'oldpass123', 'new_password': 'newpass123'}
        response = self.client.post(reverse('change-password'), data, format='json')
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass123'))
        print("test_change_password_success: PASSED")

    def test_change_password_invalid_current(self):
        """Test changing password with incorrect current password."""
        print("Running test_change_password_invalid_current...")
        data = {'current_password': 'wrongpass', 'new_password': 'newpass123'}
        response = self.client.post(reverse('change-password'), data, format='json')
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Current password is incorrect', str(response.data))
        print("test_change_password_invalid_current: PASSED")

class CheckUsernameViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', email='test@example.com', password='pass123'
        )

    def test_check_existing_username(self):
        """Test checking an existing username."""
        print("Running test_check_existing_username...")
        response = self.client.get(reverse('check-username') + '?username=testuser')
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['exists'])
        print("test_check_existing_username: PASSED")

    def test_check_non_existing_username(self):
        """Test checking a non-existing username."""
        print("Running test_check_non_existing_username...")
        response = self.client.get(reverse('check-username') + '?username=nonexistent')
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['exists'])
        print("test_check_non_existing_username: PASSED")

class WorkScheduleViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.dentist_user = User.objects.create_user(
            username='dentist1', email='dentist@dentalcare.com', password='pass123'
        )
        self.client.force_authenticate(user=self.dentist_user)

    def test_create_work_schedule(self):
        """Test creating a work schedule for a dentist."""
        print("Running test_create_work_schedule...")
        data = {
            'dentist': self.dentist_user.dentist.pk,  # Add the dentist field
            'day': 'Monday', 
            'start_hour': '09', 
            'end_hour': '17'
        }
        response = self.client.post(
            reverse('dentist-schedule-list', kwargs={'dentist_pk': self.dentist_user.dentist.pk}),
            data, format='json'
        )
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkSchedule.objects.count(), 1)
        self.assertEqual(WorkSchedule.objects.first().day, 'Monday')
        print("test_create_work_schedule: PASSED")

    def test_retrieve_work_schedule(self):
        """Test retrieving a dentist's work schedule."""
        print("Running test_retrieve_work_schedule...")
        WorkSchedule.objects.create(
            dentist=self.dentist_user.dentist,
            day='Monday', start_hour='09', end_hour='17'
        )
        response = self.client.get(
            reverse('dentist-schedule-list', kwargs={'dentist_pk': self.dentist_user.dentist.pk})
        )
        print(f"Response status: {response.status_code}, Response data: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['day'], 'Monday')
        print("test_retrieve_work_schedule: PASSED")