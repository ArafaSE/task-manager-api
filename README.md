# task-manager-api

BASE_URL: https://arafa-task-manager.herokuapp.com

Create a new user: POST /users
  Parameters: name, email, password
  
Login: POST  /users/login
  parmeters: email, password
    
Logout: POST  /users/logout
  parameters: None
  
Read loged in user profile: GET /users/me
  parameters: Null
  
Delete user: DELETE  /users/me
  parametrs: Null
  
Update user: PATCH   /users/me
  parametrs: name, email, password
