# MySQL + Express

## Setup

Initialize and run the app: `npm install` && `npm start`.

The app is using `nodemon`. Any changes made (and saved) will cause the server to restart.

Navigate to the `sql/connections.js` file and alter the following fields to reflect your database setup:

```
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'admin'
```

These will be the same credentials we used to set up a connection in MySQL Workbench.

Finally, in MySQL Workbench, run the `initialize.sql` script that is included in this project.

## Overview

The routes/controllers and basic setup has been done for us. Our job is now to complete the queries in `controllers/users.js`. There are five different controller functions and the first one has been done for us. We should be able to see this by navigating to: http://localhost:4001/users/ 

Keep in mind that your port (4001) may be different.

Take another look in the `sql/connections.js` file and notice how we set up the class to pass the same connection pool to any file that requests it. 

Additionally, navigate to the `initialize.sql` file and look at the CREATEs for the three tables. Do we notice anything different this time around? How about the `ON DELETE CASCADE` line? Remember last time when we couldn't delete a row from the users table because the usersContact and usersAddress were still dependent on it? That no longer applies with CASCADE. Now when we delete something from the users table it will automatically be deleted from the other two tables based on the foreign key relationship. 

## Controller functions

### getAllUsers

This function is done for us. Notice the SQL statement retrieving all the rows from the users table.

### getUserById

The route is going to look like this: http://localhost:4001/users/389

Where 389 is the `:id` parameter in the route. Our job is to select just the row that matches that id and return it. Write a SELECT statement WHERE id = the req param id

Look at the following line where it says `mysql.format()`. What do you think goes in those brackets? Hint.. it's the req param id

### createUser

The route is going to look like this: http://localhost:4001/users/

We are going to need to use Postman to access this route since it is now a POST request. 

We are going to send a body with the request that looks like this:

```
{
  first_name: 'bogus',
  last_name: 'user'
}
```

Or any fake user of your choice. The goal is to take the request body and insert it into the database. You will write a query to INSERT INTO users (fields) VALUES ()

Again we will need to figure out what goes in the brackets

### updateUserById

The route is going to look like this: http://localhost:4001/users/234

Which is similar to the GET route but this time it is a PUT. We will need to use Postman again to make this work. 

The goal of this route is to again send a body and this time change the first_name and last_name fields for the row that matches that id. The body for this request will remain the same as last time: 

```
{
  first_name: 'bogus',
  last_name: 'user'
}
```

Write a SQL statement to UPDATE users SET fields = values WHERE id = req param id

### deleteUserByFirstName

This route will look like this: http://localhost:4001/users/bogus

But it will be using the DELETE protocol so again we will need to use Postman to achieve this.

Write a SQL statement to DELETE FROM users WHERE first_name = req param first_name

### Create a full Query

- In your `getAllUsers` return all fields of all users including the fields of `usersContact` & `usersAddress`
- In your `createUser` be sure that a complete user is created inluding all fields in `usersContact` & `usersAddress`

## Summary

If all went according to plan we now have a full CRUD API that selects, inserts, updates and deletes from a SQL database. Great job! Take the time to start expanding on these concepts. 


METHOD DESCRIPTIONS IN ENGLISH

Document routes and what they're doing in English

GET /users
    This method returns all information about the user including the user's id from the users table, first_name, last_name, user_id from the usersAddress and usersContact tables, street address, city, state, county, zip, phone1, phone 2 and email. 


GET /users/:id
    This method returns the same information as GET /users. However, you specify the route with a user's id from the users table. The only difference is the user's id from the users table is returned as "user_id" while the user_id from the usersAddress and usersContact tables is "id".

POST /users
    This method creates a new user. You'll have to enter a first name, last name, street address, city, county, state, zip, phone1, phone 2 and email. Since the id's are auto incremented for each table, the new user will automatically be assigned the next sequential id.

PUT /users/:id
    This method updates information of an existing user. For example, if you wanted to change all the information for user id 1, James Butt, you would use this method. To do so, you would have to include the user's id in the route in Postman.

DEELETE /users/:first_name
    This method deletes a user by his or her first name. Simply put the first name of the user you want to delete in your route. To delete James Butt, the route would be http://localhost:4001/users/James.



For all methods, you should test the routes in Postman.