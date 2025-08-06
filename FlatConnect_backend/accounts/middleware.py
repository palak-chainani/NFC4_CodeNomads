from django.utils.deprecation import MiddlewareMixin

class CSRFExemptMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Exempt API endpoints from CSRF
        if request.path.startswith('/api/') or request.path.startswith('/issues/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None 