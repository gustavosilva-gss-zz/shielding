from django.db import models

from website.models import Volunteer, Establishment, User

class Message(models.Model):
    sender = models.ForeignKey(User, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.serialize(),
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
        }

class Chat(models.Model):
    participants = models.ManyToManyField(User, related_name='chats', blank=True)
    messages = models.ManyToManyField(Message, blank=True)

    def serialize(self):
        return {
            "id": self.id,
            "participants": self.participants,
            "messages": self.messages
        }
