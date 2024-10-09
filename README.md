# workfully

## Development Diary

### Step 1. Boilerplate

Looking at the code challenge, there are some decisions already made, such as the type of DB (any SQL) and the framework to use, in this case NextJS. The rest of the code challenge relates to features, best practices and other considerations that don't impact this stage yet

Given that, we will start by creating a NextJS prject, and then including a DB.

### Step 2. The backend

With the DBs ready, we can now expand the backend. As detailed below, we will split it in 3+1 layers, with the appropriate testing.

### Database

Given the requirements we will choose PostgreSQL. This is a widely used SQL database, with all documentation necessary, and easily portable to cloud-managed systems such as AWS RDS and similar. It also offers interesting features such as triggers which, even if they are outside of the scope of this project as is, could come in handy for the future.

We will integrate our PostgreSQL in our project through Prisma. This is a widely used ORM that will:

- Help with type safety instead of pure SQL
- Handle migrations when the schema changes, making it easier to maintain bigger projects
- Works quite well with autocomplete and other AI tools

#### Schema

Analyzing the requirements, the only entity we need to store is Task. The columns are predefined, and there is no user management required.

### Architecture

Regarding the overall structure, a project this size should not go for complex solutions such as microservices or multiple repos. We will opt for a monorepo containing both the frontend and backend, and we now detail architecture decisions.

#### Backend

On the backend we will structure the project in 3 layers, plus a middleware:

0. Middleware. This layer will just wrap every request into DB transactions. This is a simple way to protect our data, in case there is an error somewhere we just discard any interaction with the DB. Additionally, projects normally have session/user/authentication management. Handling all that should be done in their own middleware files, but in this case we only need to wrap the handlers into transactions.
1. Controller. This layer will define the methods accepted by the API, unpack values sent from the frontend, etc, but will not perform any logic. Everything will be sent to the next layer, the Facade
2. Facade. This layer will perform any required business logic and interact with the DB through the next layer, the Dao
3. Dao (data access object). This will contain all the logic of accessing the DB, in our case through Prisma

The way we will design our middleware is by integrating Koa into our project. Koa is a very used framework to deal with routes, and helps organize middlewares, chaining them. For this project is a bit of an overkill, but setting it up will help make it future proof, and being able to easily add things such as user/session management.

#### Frontend

This is subject to change as the project evolves, but we can already share some thoughts. Since we are developing a NextJS application with React, we will structure it in components. In particular, we will have:

1. TaskCard, which will render a task
2. TaskColumn, which will render all tasks with a certain status
3. Main layout

### Testing

The goal for this project regarding testing is:

1. Have unit tests that check the interaction with the DB (Dao layer). This means making real insertions, deletions and retrievals. This is an overkill for a project this size, but as projects grow the complexity of schemas grow, and tables start to depend on each other, meaning some operations such as insertions/deletions will not be straightforward. So this is good practice to start early in a project. The implication of this is that we will need to have a test database, which means a bit of extra boilerplate.
2. Have unit tests that check the API, but mock the database (Controller layer). We want to isolate the potential issues of business logic, so for those tests we will mock the DB.
3. End-2-end testing on the UI. This will be done with Playwright, and should work with the test database.

We could add an extra layers of testing, such as testing the components mocking the backend or unit tests for the Facade layer. However, they would not be adding significant value at this stage for this project, since the Controller layer will be very simple and will already run the code of the Facade layer, and because we aim at having e2e testing. With enough time we can develop those.

## How to set the project up

Run a PostgreSQL, you can use a command such as:

```
docker run --name postgres-db -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

Make sure the .env file contains the right DATABASE_URL

```
yarn dev
```
