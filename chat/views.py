from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def room(request, chat_id):
    return render(request, 'chat/room.html', {
        'chat_id': chat_id,
        'user_id': request.user.id
    })
