
# Frontend Endpoints
```
# Does not requrie authentication
/home
/login
/create
/reset
/reset/password

# Requires authentication
/
/login
/profile
/confirm
/createCourse
/:courseId
/:courseId/questions
/:courseId/questions/:questionId
/:courseId/questions/add
/:courseId/lectures
/:courseId/lectures/:lectureId
/:courseId/lectures/:lectureId/questions
/:courseId/lectures/:lectureId/questions/add
/:courseId/lectures/:lectureId/questions/:questionId
/:courseId/roster
/:courseId/roster/:sectionId
/:courseId/createLecture
/:courseId/sections
/:courseId/sections/:sectionId
/:courseId/sections/:sectionId/lectures/:lectureId
```


# Rest API Endpoints
```
# courses.js
GET /courses/
POST /courses/
POST /courses/join
PUT /courses/:courseId
DELETE /courses/:courseId

# enrollment.js
GET /coureses/:courseId/enrollments
DELETE /courses/:courseId/enrollments/:enrollmentId
PUT /courses/:courseId/enrollments/:enrollmentId

# lectureForSection.js
PUT /courses/:courseId/sections/:sectionId/lectures/:lecture_id

# lecture.js
GET /courses/:courseId/lectures
POST /courses/:courseId/lectures
PUT /courses/:courseId/lectures/:lectureId
GET /courses/:courseId/lectures/:lectureId
DELETE /courses/:courseId/lectures/:lectureId

# lectureSummaries.js
GET /courses/:courseId/sections/:sectionId/lectures/:lectureId/responses

# questions.js
GET /coruses/:courseId/questions
POST /courses/:courseId/questions

# questionsInLecture.js
GET /courses/:courseId/lectures/:lectureId/questions/:questionId
PUT /courses/:courseId/lectures/:lectureId/questions/:questionId
POST /courses/:courseId/lectures/:lectureId/questions/:questionId
PUT /courses/:courseId/lectures/:lectureId/questions/
DELETE /courses/:courseId/lectures/:lectureId/questions/:questionId

# responses.js
POST /courses/:courseId/lectures/:lectureId/questions/:questionId/responses
PUT /courses/:courseId/lectures/:lectureId/questions/:questionId/responses/:responseId

# sections.js
POST /courses/:courseId/sections
GET /courses/:courseId/sections
GET /courses/:courseId/sections/:sectionId
PUT /courses/:courseId/sections/:sectionId

# users.js
POST /users/
PUT /users
PUT /users/password
POST /users/login
GET /users/authenticate
GET /users/logout
GET /users/:userId
PUT /users/:userId
DELETE /users/:userId
PUT /:userId/confirm
GET /:userId/confirm
```

# WebSocket Endpoints
```

```
