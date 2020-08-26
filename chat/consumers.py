#https://channels.readthedocs.io/en/latest/tutorial/part_3.html

import json
import datetime

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from .models import Chat, Message
from website.models import User

class ChatConsumer(WebsocketConsumer):
    chat = Chat()
    user = User()

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)

        if text_data_json["type"] == "load":
            self.chat = Chat.objects.get(pk=text_data_json["chatId"])
            self.user = User.objects.get(pk=text_data_json["userId"])

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'load'
                }
            )

        elif text_data_json["type"] == "send":
            event = {
                'type': 'send_message',
                'message': text_data_json['message'],
            }

            #first, add the message to the map, then save the chat
            event["message"] = self.save(event)

            self.chat.save()

            async_to_sync(self.channel_layer.group_send)(self.room_group_name, event)

    #needed a way to make this only be called once
    loaded = False
    def load(self, event):
        #a little to explain here
        #this is NOT the best approach, ideally I'd find a way to only load for one of the participants
        #currently, though it only loads for one of them, this is called for all participants
        #I could avod doing that by making this part of the API, however the cost in speed wouldn't be worth it
        #the other approach would be to implement the Django Channels authentication, also not worth it because there will always be only two participants
        
        if self.loaded:
            return

        messages = self.chat.messages.all()

        messages_serialized = []

        for message in messages: 
            messages_serialized.append(message.serialize())

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'messages': messages_serialized
        }))

        self.loaded = True

    def send_message(self, event):
        messages = []
        messages.append(event["message"])

        self.send(text_data=json.dumps({
            'messages': messages
        }))

    def save(self, event):
        #create and save message in the chat model
        message = Message.objects.create(
            sender=self.user,
            content=event['message'])

        self.chat.messages.add(message)

        return message.serialize()
