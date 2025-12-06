from django_filters import rest_framework as filters
from .models import Feedback

class FeedbackFilter(filters.FilterSet):
    class Meta:
        model = Feedback
        fields = ['name', 'email', 'feedback']