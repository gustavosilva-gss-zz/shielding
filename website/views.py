import json
import datetime

from django.forms.models import model_to_dict
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse

from .models import User, Establishment, Volunteer, Donation
from chat.models import Chat

from chat.views import room

def index(request):
    if request.user.is_authenticated:
        #see if there the user is a establishment
        match = Establishment.objects.filter(user=User.objects.get(pk=request.user.id))
        if match:
            #send to establishment page
            return HttpResponseRedirect(reverse(establishment_manage))
        
        #send to volunteer page
        return HttpResponseRedirect(reverse(volunteer_view))

    return render(request, "index.html")

@login_required
def volunteer_view(request):
    return render(request, "volunteer/volunteer.html")

@login_required
def volunteer_profile(request):
    volunteer = Volunteer.objects.get(user=User.objects.get(pk=request.user.id))

    donations = Donation.objects.filter(volunteer=volunteer)

    return render(request, "volunteer/profile.html", {
        "volunteer": volunteer,
        "donations": donations
    })

@login_required
def establishment_profile(request, id):
    return render(request, "establishment/profile.html", {
        "establishment": Establishment.objects.get(pk=id)
    })

@login_required
def establishment_manage(request):

    establishment = Establishment.objects.get(user=User.objects.get(pk=request.user.id))

    donations = Donation.objects.filter(establishment=establishment)

    return render(request, "establishment/manage.html", {
        "establishment": establishment,
        "donations": donations
    })

# AUTHENTICATION

@csrf_exempt
def establishment_register(request):   
    if request.method == "POST":
        #register a new establishment
        data = json.loads(request.body)

        name = data.get("name", "")
        address = data.get("address", "")
        need = data.get("need", "")
        image_url = data.get("image_url", "")

        establishment = Establishment(
            user=User.objects.get(pk=request.user.id),
            name=name,
            address=address,
            need=need,
            image_url=image_url
        )

        establishment.save()

        return JsonResponse({"message": "success!"}, status=200)
    
    return render(request, "establishment/establishment_register.html")

@csrf_exempt
def volunteer_register(request):
    if request.method == "POST":
        #register a new volunteer
        data = json.loads(request.body)

        address = data.get("address", "")

        volunteer = Volunteer(
            user=User.objects.get(pk=request.user.id),
            address=address
        )

        volunteer.save()

        return JsonResponse({"message": "success!"}, status=200)
    
    return render(request, "volunteer/volunteer_register.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        logout(request)

        data = json.loads(request.body)

        username = data.get("username", "")
        password = data.get("password", "")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            #in order to redirect correctly, we must know if the user is a volunteer or establishment
            match = Establishment.objects.filter(user=User.objects.get(pk=request.user.id))

            return JsonResponse({"volunteer": not match}, status=200)
        else:
            return JsonResponse({"error": "Invalid username and/or password."}, status=400)

    else:
        return render(request, "login.html")

@csrf_exempt
def user_register(request):
    if not request.method == "POST":
        return JsonResponse({"error": "Must be POST method"}, status=405)

    data = json.loads(request.body)

    username = data.get("username", "")
    email = data.get("email", "")

    password = data.get("password", "")
    confirmation = data.get("confirmation", "")

    # Ensure password matches confirmation
    if password != confirmation:
        return JsonResponse({"error": "passwords must match!"}, status=400)

    # Attempt to create new user
    try:
        user = User.objects.create_user(username, email, password)
        user.save()
    except IntegrityError:
        return JsonResponse({"error": "username already taken :("}, status=400)

    login(request, user)

    return JsonResponse({"message": "success!"}, status=200)

# API ONLY

def establishments(request):
    start = int(request.GET.get("start"))
    end = int(request.GET.get("end"))

    data = []
    for i in range(start, end + 1):
        # here I'm getting the establishment believing no establishments were deleted (because no normal user can do that)
        # preferably I'd add a way for all ids to reset when I delete a establishment
        establishment = Establishment.objects.filter(pk=i)

        if establishment:
            #if there is such establishment, add it to the list
            establishment = establishment.first().serialize()
            data.append(establishment)

    return JsonResponse({"establishments": data}, status=200)

@csrf_exempt
@login_required
def donate(request):
    if not request.method == "POST":
        return JsonResponse({"error": "Must be POST method"}, status=405)
    
    data = json.loads(request.body)

    establishment_id = data.get("establishmentId", "")
    quantity = int(data.get("quantity", ""))
    volunteer_delivering = data.get("volunteerDelivering", "")
    address = data.get("address", "")
    estimated_time = data.get("estimatedTime", "")

    volunteer = Volunteer.objects.get(user=User.objects.get(pk=request.user.id))

    if not volunteer_delivering and not address:
        return JsonResponse({"error": "The establishment must know your address"}, status=400)
    
    elif not volunteer_delivering and address:
        #update volunteer's address so the establishment gets the face shields on the right location
        volunteer.address = address
        volunteer.save()

    donation = Donation(
        volunteer=volunteer,
        establishment=Establishment.objects.get(pk=establishment_id),
        quantity=quantity,
        volunteer_delivering=volunteer_delivering,
        estimated_time=estimated_time
    )

    donation.save()

    return JsonResponse({"message": "success!"}, status=200)

@csrf_exempt
@login_required
def edit_establishment(request, field):
    if not request.method == "PUT":
        return JsonResponse({"error": "Must be PUT method"}, status=405)
    
    data = json.loads(request.body)

    establishment_id = data.get("establishmentId", "")
    edited_val = data.get("editedVal", "")

    establishment = Establishment.objects.get(pk=establishment_id)

    #check which field the establishment is changing, then change it
    if field == "name":
        establishment.name = edited_val
    elif field == "address":
        establishment.address = edited_val
    elif field == "need":
        establishment.need = edited_val
    elif field == "imageUrl":
        establishment.image_url = edited_val
    else:
        return JsonResponse({"error": "Must specify the field being edited"}, status=400)

    establishment.save()

    return JsonResponse({"message": "success!"}, status=200)

def donation(request, id):
    donation = Donation.objects.get(pk=id).serialize()

    #I'm serializing the volunteer to able to display the address
    donation["volunteer"] = Volunteer.objects.get(pk=donation["volunteer"]).serialize()

    #I'm serializing the user to able to display the email
    #preferably there'd be a way for the establishment to talk to the user inside the website, not now
    donation["volunteer"]["user"] = User.objects.get(username=donation["volunteer"]["user"]).serialize()

    #I'm serializing the establishment to be able to display their address
    donation["establishment"] = Establishment.objects.get(pk=donation["establishment"]).serialize()

    return JsonResponse({"donation": donation}, status=200)

@csrf_exempt
@login_required
def edit_donation(request, id):
    if not request.method == "PUT":
        return JsonResponse({"error": "Must be PUT method"}, status=405)
    
    data = json.loads(request.body)

    new_status = data.get("newStatus", "")

    donation = Donation.objects.get(pk=id)

    #check to which status is the donation changing, then change it
    if new_status == "canceled":
        donation.status = 'canceled'

    elif new_status == "delivered":
        donation.status = 'delivered'

        #add the time of delivery
        donation.delivered_time = datetime.datetime.now()

        #if it's delivered, change the establishment's need
        establishment = Establishment.objects.get(pk=donation.establishment.id)

        #change the need to at least 0
        if (establishment.need - donation.quantity) < 0:
            establishment.need = 0
        else:
            establishment.need -= donation.quantity

        establishment.save()

    else:
        return JsonResponse({"error": "Must specify the new status"}, status=400)

    donation.save()

    return JsonResponse({"message": "success!"}, status=200)

@csrf_exempt
@login_required
def edit_volunteer(request, field):
    if not request.method == "PUT":
        return JsonResponse({"error": "Must be PUT method"}, status=405)
    
    data = json.loads(request.body)
    edited_val = data.get("editedVal", "")

    volunteer = Volunteer.objects.get(user=User.objects.get(pk=request.user.id))

    if field == "email":
        request.user.email = edited_val
        request.user.save()

        return JsonResponse({"message": "success!"}, status=200)

    if field == "address":
        volunteer.address = edited_val

    else:
        return JsonResponse({"error": "Must specify the field being edited"}, status=400)

    volunteer.save()

    return JsonResponse({"message": "success!"}, status=200)

@login_required
def open_chat(request):
    establishment_id = request.GET.get("establishmentId", "")
    volunteer_id = request.GET.get("volunteerId", "")

    establishment = Establishment.objects.get(pk=establishment_id)
    volunteer = Volunteer.objects.get(pk=volunteer_id)

    #check if there is an existing chat with these participants
    for chat in Chat.objects.all():
        if establishment.user in chat.participants.all() and volunteer.user in chat.participants.all():
            #means this chat already exists
            return JsonResponse({"chat_id": chat.id}, status=200)

    #create new chat and add the establishment and the volunteer
    chat = Chat()
    chat.save()
    chat.participants.add(establishment.user)
    chat.participants.add(volunteer.user)

    return JsonResponse({"chat_id": chat.id}, status=200)
