import json
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from .models import Message
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        token = self.scope['query_string'].decode().split('token=')[1] if 'token=' in self.scope['query_string'].decode() else None
        if not token:
            print("No token provided, closing connection")
            await self.close()
            return

        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            self.user = await sync_to_async(User.objects.get)(id=user_id)
            self.room_group_name = f'chat_{self.user.id}'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            print(f"User {self.user.username} connected to WebSocket")
        except Exception as e:
            print(f"Authentication error: {e}")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            print(f"User {self.user.username} disconnected")

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(f"Received data: {text_data_json}")
        message = text_data_json['message']
        receiver_username = text_data_json['receiver']
        try:
            receiver = await sync_to_async(User.objects.get)(username=receiver_username)
            msg = await sync_to_async(Message.objects.create)(
                sender=self.user, receiver=receiver, content=message
            )
            data = {
                'content': message,
                'sender': self.user.username,
                'timestamp': msg.timestamp.isoformat(),  # Dùng timestamp từ DB
                'receiver': receiver.username  # Thêm receiver để frontend lọc
            }
            # Gửi đến group của receiver
            await self.channel_layer.group_send(
                f'chat_{receiver.id}',
                {'type': 'chat_message', **data}
            )
            # Gửi đến group của sender
            await self.channel_layer.group_send(
                f'chat_{self.user.id}',
                {'type': 'chat_message', **data}
            )
            print(f"Sent to groups: chat_{self.user.id} and chat_{receiver.id}")
        except User.DoesNotExist:
            print(f"Receiver {receiver_username} not found")
            await self.send(json.dumps({'error': 'Receiver not found'}))

    async def chat_message(self, event):
        print(f"Broadcasting message: {event}")
        await self.send(text_data=json.dumps({
            'content': event['content'],
            'sender': event['sender'],
            'timestamp': event['timestamp'],
            'receiver': event['receiver']
        }))