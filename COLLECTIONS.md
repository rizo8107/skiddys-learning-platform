# PocketBase Collections Documentation

This document outlines all the collections and their schemas in the Skiddy's Learning Platform PocketBase database.

## Collections

### 1. Users (`_pb_users_auth_`)
System collection for user authentication and profiles.

Fields:
- `username`: Text (required)
- `email`: Email (required)
- `name`: Text
- `avatar`: File
- `bio`: Text

### 2. Courses
Collection for managing course information.

Fields:
- `title`: Text (required)
- `description`: Text (required)
- `thumbnail`: File
- `duration`: Text (required)
- `level`: Select (required)
  - Options: ["Beginner", "Intermediate", "Advanced"]
- `instructor`: Relation to Users (required)
  - Single select
  - No cascade delete
- `prerequisites`: JSON
- `skills`: JSON

### 3. Lessons
Collection for course lessons.

Fields:
- `lessons_title`: Text (required)
- `description`: Text (required)
- `videoUrl`: Text (required)
- `duration`: Text (required)
- `course`: Relation to Courses (required)
- `objectives`: JSON Array
- `order`: Number (required)

### 4. Lesson Resources
Collection for lesson materials and downloads.

Fields:
- `resource_title`: Text (required)
- `description`: Text
- `file`: File (required)
- `lesson`: Relation to Lessons (required)
- `type`: Select
  - Options: ["Document", "Code", "Exercise", "Other"]

### 5. Settings
Collection for site-wide settings.

Fields:
- `site_name`: Text (required)
- `site_description`: Text
- `site_logo`: File
- `contact_email`: Email (required)
- `social_links`: JSON

### 6. Reviews
Collection for course reviews and ratings.

Fields:
- `rating`: Number (required)
  - Min: 1
  - Max: 5
- `comment`: Text
- `user`: Relation to Users (required)
- `course`: Relation to Courses (required)
- `created`: DateTime (required)

### 7. Progress
Collection for tracking user progress in courses.

Fields:
- `user`: Relation to Users (required)
- `lesson`: Relation to Lessons (required)
- `completed`: Boolean (required)
- `completed_at`: DateTime
- `notes`: Text

## Relationships

1. Courses → Users (instructor)
2. Lessons → Courses
3. Lesson Resources → Lessons
4. Reviews → Users
5. Reviews → Courses
6. Progress → Users
7. Progress → Lessons

## Indexes

1. Courses:
   - `instructor_idx`: On instructor field
   - `level_idx`: On level field

2. Lessons:
   - `course_idx`: On course field
   - `order_idx`: On order field

3. Reviews:
   - `user_course_idx`: Compound index on user and course fields
   - `rating_idx`: On rating field

4. Progress:
   - `user_lesson_idx`: Compound index on user and lesson fields
   - `completed_idx`: On completed field

## Security Rules

1. Users:
   - Read: Public
   - Create: Public (for registration)
   - Update: Owner only
   - Delete: Admin only

2. Courses:
   - Read: Public
   - Create/Update/Delete: Admin and Instructors only

3. Lessons:
   - Read: Public
   - Create/Update/Delete: Admin and Course Instructors only

4. Lesson Resources:
   - Read: Public
   - Create/Update/Delete: Admin and Course Instructors only

5. Settings:
   - Read: Public
   - Create/Update/Delete: Admin only

6. Reviews:
   - Read: Public
   - Create: Authenticated users
   - Update/Delete: Owner and Admin only

7. Progress:
   - Read: Owner and Admin only
   - Create/Update: Owner only
   - Delete: Admin only
