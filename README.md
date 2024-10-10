# workfully

## Development Diary

### Step 1. Boilerplate

Looking at the code challenge, there are some decisions already made, such as the type of DB (any SQL) and the framework to use, in this case NextJS. The rest of the code challenge relates to features, best practices and other considerations that don't impact this stage yet.

Given that, we will start by creating a NextJS prject, and then including a DB.

### Step 2. The backend

With the DBs ready, we can now expand the backend. As detailed below, we will split it in 3+1 layers, with the appropriate testing.

### Step 2.1. Fixes in the backend

To properly generate the types in Prisma I had to change the schema to include an Enum.
Moreover, a key detail had to be fixed, which was that tasks can only move by one column in any direction. We made sure this was properly handled and tested.

### Step 3. The frontend

Given a stable backend, we started developing the backend and the 2e2 tests in playwright. We will detail the setup below, but the tldr is that we use react-query and useContext hooks to handle state management.

### Step 4. Project reorganization

After developing the project itself, the project and the code can use some refactoring. The major changes here are in the frontend:

- Extracting the logic from components to custom hooks. This way we separate the logic of dealing with data, doing checks, etc. from the component rendering. In particular we did this refactor for TaskCards and TaskColumns. The other components are just too simple and they are not worth separating the logic and overloading the project with extra files.
- Renaming files and reorganizing them into folders with better organization

### Future steps

This project would benefit from a few extra features. In particular, it would be interesting to:

- Include authentication
- Support multiple boards and custom columns
- Multiuser board collaboration

Moreover, from a technical perspective, including CI/CD scripts and deploying it to a cloud server would be a necessary step towards a more professional setup.

### Database

Given the requirements we will choose PostgreSQL. This is a widely used SQL database, with all documentation necessary, and easily portable to cloud-managed systems such as AWS RDS and similar. It also offers interesting features such as triggers which, even if they are outside of the scope of this project as is, could come in handy for the future.

We will integrate our PostgreSQL in our project through Prisma. This is a widely used ORM that will:

- Help with type safety instead of pure SQL.
- Handle migrations when the schema changes, making it easier to maintain bigger projects.
- Works quite well with autocomplete and Copilot or other AI tools.

#### Schema

Analyzing the requirements, the only entity we need to store is Task. The columns are predefined, and there is no user management required.

We could have chosen to have an entity Column, and this choice would have been a bit more in line with a DDD approach. Conceptually Column does exist, and Tasks could have a foreign key referencing them. However, in this project there is simply no other information associatet with Column, which would have made the schema unnecessarily complex. In the tradeoff between following a more DDD approach and a KISS aproach, we chose KISS in this case.

### Architecture

Regarding the overall structure, a project this size should not go for complex solutions such as microservices or multiple repos. We will opt for a monorepo containing both the frontend and backend, and we now detail architecture decisions.

#### Backend

On the backend we will structure the project in 3 layers, plus a middleware:

0. Middleware. This layer will just wrap every request into DB transactions. This is a simple way to protect our data. In case there is an error somewhere we just discard any interaction with the DB. Additionally, projects normally have session/user/authentication management. Each management step should be done in their own middleware files, but in this case we only have one middleware to wrap the handlers into transactions.
1. Controller. This layer will define the methods accepted by the API, unpack values sent from the frontend, etc, but will not perform any logic. Everything will be sent to the next layer, the Facade
2. Facade. This layer will perform any required business logic and interact with the DB through the next layer, the Dao
3. Dao (data access object). This will contain all the logic of accessing the DB, in our case through Prisma

Our middleware design integrates Koa into our project. Koa is a very used framework to deal with routes, and helps organize middlewares, chaining one after the next. For this project is a bit of an overkill, but setting it up now will help make it future proof, and being able to easily add things such as user/session management.

By integrating Koa we need to start the backend in a different port, which means that we need to setup a proxy in the project configuration, so that the frontend requests are redirected to the right port.

##### Error management

Besides wrapping requests into transactions, we also wrap all calls to controller functions into a try/catch block, inside the middleware. This way, even if we have unhandled errors, the backend should not crash.

#### Frontend

##### State management decisions

The first big decision to make regarding the frontend is what sort of state management tool we will use. One of the best options out of the box is react-query, since it handles all the caching, refetching and refreching data from the backend for us. It's also a relatively simple setup. By using it, if we change some data in a component, besides sending the changes to the backend we just need to invalidate the appropriate queries and all the components that use that information will be rerendered with the latest data from the server, when needed, and without the need for a complex state management system.

This decision has a drawback, which is that we can't use the NextJS feature of server-side rendering components. This tradeoff is still well in favour of react-query because it makes the project much easier to understand and maintain, since the data state management is much simpler.

There are some situations where react-query is not enough as a state management tool. For example, if we want to have a single component that displays error messages to the user instead of each component handling its own, react-query is no help. In this case, we will use useContext hooks and Context Providers to handle that.

Other solutions such as Redux could have been chosen. However, Redux is a framework that requires a much bigger boilerplate without providing additional value, especially for a project this size. The mix of react-query and useContext provide similar functionality with minimal overhead.

###### Local Storage

The code challenge mentions that the board should be stored in Local Storage. However, this seems redundant with our setup. React-query is a much better solution, so this requirement was dropped. If this were a hard requirement from a client for reasons beyond our knowledge, for example, this could easily be implemented in Board.tsx by storing the tasks after receiving them and checking it's not still loading or there are errors.

##### Components

We have designed 3 main components, and a few others that we will detail after

- Board. This is the main layout. It fetches the tasks from the backend, and renders TaskColumns, one for each status in ["BACKLOG", "TODO", "DOING", "DONE"]. Each column receives the tasks with that status
- TaskColumn, which is simply a rectangle that holds tasks that have been passed to that
- TaskCard, which is just a rectangle that displays the task title and description

On top of these components, we also designed:

- StatusChangeConfirmationDialog, a confirmation dialog displayed when the user moves a task to DONE
- AddTaskButton, a simple button at the bottom of the column BACKLOG
- AddTaskDialog, a dialog with 2 text inputs to be able to create tasks

The final component to describe is SnackMessage, which is the component in charge displaying errors to the user in a friendly way. It's a snackbar rectangle that shows in the bottom when an error message needs to be displayed.

##### State management details

We opted for a drag and drop solution to implement task status change, and this is where we use Context Provider to communicate between components. TaskCards save their information (id, status, title) into a dragContext that we defined, so that TaskColumns can receive that information onDrop. TaskColumns contain the information of which status is the TaskCard dropping into, and they also handle drag callbacks to change the background color, so the drag callbacks can be used for those 2 purposes.

One of the advantages of using react-query becomes apparent here. Whenever a task changes status, the query to fetch the tasks gets invalidated, and the UI gets automatically refreshed, without the need of us maintaining the state. The drawback in this case, is that react-query under the hood is requesting all the tasks, which is technically not necessary if we maintained the state ourselves in the frontend. However, this becomes much more powerful when we think about how this project would naturally evolve, with multiuser and a collaborative setup. In that case, just by configuring our queries to have a stale time, we would see other people's changes without us having to maintain a complex communication/cache system. Technically yes, we are performing more requests than necessary, but the load in computation and network use is manageable, and the simplicity of project maintenance is well worth it.

The other detail of state management is how we display error messages to the user, which is again through a Context Provider, so that every component has access to the same SnackMessage component

##### Styles

Since this project is not very heavy in styling, we opted for simplicity and used a single css file and using classNames in our components. Other solutions such as Styled Components or CSS modules could be more powerful and provide more flexibility for the future, but we opted for simplicity in this case.

##### Error management

All the components are wrapped around an ErrorBoundary, which displays the SnackMessage component if something goes wrong. Therefore the frontend should only crash gracefully, even if there's an unhandled error.

### Testing

The goal for this project regarding testing is:

1. Have unit tests that check the interaction with the DB (Dao layer). This means making real insertions, deletions and retrievals. This is an overkill for a project this size, but as projects grow the complexity of schemas grow, and tables start to depend on each other, meaning some operations such as insertions/deletions will not be straightforward. So this is good practice to start early in a project. The implication of this is that we will need to have a test database, which means a bit of extra boilerplate.
2. Have unit tests that check the API, but mock the database (Controller layer). We want to isolate the potential issues of business logic, so for those tests we will mock the DB.
3. End-2-end testing on the UI. This is done with Playwright, and should work with the test database.

We could add an extra layers of testing, such as testing the components mocking the backend or unit tests for the Facade layer. However, they would not be adding significant value at this stage for this project, since the Controller layer will be very simple and will already run the code of the Facade layer, and because we aim at having e2e testing. With enough time we can develop those.

## How to set the project up

### Assumptions

We assume that you have a setup that can run Node projects. You should also install docker or a PostgreSQL provider and be able to create and configure databases.

### Setup

Run anc configure 2 PostgreSQL databases, you can use a command such as:

```
docker run --name postgres-db -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

Make sure the .env file contains the right DATABASE_URL and the right BACKEND_PORT.

There is an example of .env file in the repo called .env.example, change the values according to your setup

The first time, dependencies need to be installed, so type:

```
yarn
```

From then on no need to run `yarn` again, simply type:

```
yarn dev
```

### How to run tests

Make sure you have a .env.test file, which contains the DATABASE_URL and the BACKEND_PORT, as well as the BASE_URL. There's also an example file in the repo.

BASE_URL is the url the e2e tests will use to navigate to. Using a different port is useful to be able to run the tests while you also have the dev project running. Same with BACKEND_PORT. DATABASE_URL should also be different, since the tests affect the database, and we want to keep the development and the testing dbs separately.

To execute the tests run in different terminals:

```
yarn backend:test
```

```
yarn frontend:test
```

And then for backend tests

```
yarn test:watch
```

Finally, for e2e tests

```
yarn playwright
```

There are scripts that handle multiple operations concurrently, but then the logs are harder to trace, and the e2e tests are less reliable since they don't account for server startup and compile time.
