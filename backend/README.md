# Backend README

Django REST Framework backend for the Feedback Application.

## Setup

1. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```

2. Install dependencies (if not already installed):
   ```bash
   pip install django djangorestframework django-cors-headers django-filter
   ```

## Database Migrations

### Initial Setup

1. Create migrations for the feedback_api app:
   ```bash
   python manage.py makemigrations
   ```

2. Apply migrations to create database tables:
   ```bash
   python manage.py migrate
   ```

### After Model Changes

If you modify models in `feedback_api/models.py`:

1. Create new migrations:
   ```bash
   python manage.py makemigrations
   ```

2. Apply the migrations:
   ```bash
   python manage.py migrate
   ```

## Running the Application

Start the Django development server:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

The default port is 8000. To use a different port:

```bash
python manage.py runserver 8080
```

## Clearing the Database

### Option 1: Flush All Data (Recommended)

This command removes all data from the database while keeping the table structure intact:

```bash
python manage.py flush --no-input
```

The `--no-input` flag prevents Django from prompting for confirmation. This will delete all entries from all tables including the Feedback model, but preserves the database schema.

**Note:** After flushing, you may need to create a new superuser if you want to access the Django admin:
```bash
python manage.py createsuperuser
```

### Option 2: Delete and Recreate Database

To completely reset the database (delete all data and recreate tables):

1. Delete the database file:
   ```bash
   rm db.sqlite3
   ```

2. Remove migration files (optional - only if you want to start fresh):
   ```bash
   rm feedback_api/migrations/0*.py
   ```
   **Important:** Keep the `__init__.py` file in the migrations folder.

3. Create new migrations:
   ```bash
   python manage.py makemigrations
   ```

4. Apply migrations:
   ```bash
   python manage.py migrate
   ```

### Option 3: Delete Specific Model Data

To delete only feedback entries without affecting other tables:

1. Open Django shell:
   ```bash
   python manage.py shell
   ```

2. Delete all Feedback entries:
   ```python
   from feedback_api.models import Feedback
   Feedback.objects.all().delete()
   ```

## Additional Commands

- Create a superuser for admin access:
  ```bash
  python manage.py createsuperuser
  ```

- Access Django shell:
  ```bash
  python manage.py shell
  ```

- Check for any issues:
  ```bash
  python manage.py check
  ```

