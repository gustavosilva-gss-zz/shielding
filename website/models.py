from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    #users can be health establishments or volunteers
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
        }

class Establishment(models.Model):
    #decided to create a separate class to have options that wont be in volunteers
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="establishment")
    name = models.CharField(max_length=60)
    #ideally there'd be a verification for if the establishment is real, but I wont bother
    address = models.CharField(max_length=80)
    need = models.PositiveIntegerField() #ammount of face shields needed
    image_url = models.URLField(blank=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "name": self.name,
            "address": self.address,
            "need": self.need,
            "image_url": self.image_url
        }

class Volunteer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="volunteer")
    #wont need to give the address, only if tehy want the establishment to go and get the face shields
    address = models.CharField(max_length=80, blank=True)
    
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "address": self.address
        }

class Donation(models.Model):
    STATUS = (
        ('S', 'submitted'),
        ('D', 'delivered'),
        ('C', 'canceled'),
    )

    volunteer = models.ForeignKey(Volunteer, on_delete=models.CASCADE, related_name="donations")
    establishment = models.ForeignKey(Establishment, on_delete=models.CASCADE, related_name="donations")
    quantity = models.PositiveIntegerField()
    volunteer_delivering = models.BooleanField()
    status = models.CharField(max_length=1, null=False, choices=STATUS, default='S')
    submission_time = models.DateTimeField(auto_now_add=True)
    estimated_time = models.DateTimeField()
    delivered_time = models.DateTimeField(null=True)

    def serialize(self):
        return {
            "id": self.id,
            "volunteer": self.volunteer.id,
            "establishment": self.establishment.id,
            "quantity": self.quantity,
            "volunteer_delivering": self.volunteer_delivering,
            "status": self.get_status_display(),
            "submission_time": self.submission_time.strftime("%b %-d %Y, %-I:%M %p"),
            "estimated_time": self.estimated_time.strftime("%b %-d %Y, %-I:%M %p"),
            "delivered_time": self.delivered_time.strftime("%b %-d %Y, %-I:%M %p") if self.delivered_time else None,
        }
