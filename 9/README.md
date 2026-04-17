# Task Management API

A REST API for managing tasks with JWT authentication, built with Node.js and Express.

## Setup

### Requirements
- Node.js 18+

### Installation

```bash
npm install
```

### Environment Variables

| Variable     | Default   | Description                    |
|--------------|-----------|--------------------------------|
| `PORT`       | `3000`    | Port the server listens on     |
| `JWT_SECRET` | `secret`  | Secret key for signing JWTs    |

> For production, always set `JWT_SECRET` to a strong random value.

### Start

```bash
npm start
```

The server starts at `http://localhost:3000`.

## Default Credentials

| Username | Password    |
|----------|-------------|
| `admin`  | `password123` |

## API Endpoints

### Authentication

| Method   | Path      | Description                          |
|----------|-----------|--------------------------------------|
| `POST`   | /login    | Login with credentials, returns JWT  |
| `GET`    | /verify   | Verify token validity                |
| `DELETE` | /logout   | Invalidate token                     |

### Tasks (all require `Authorization: Bearer <token>`)

| Method   | Path              | Description                     |
|----------|-------------------|---------------------------------|
| `GET`    | /tasks            | List all tasks                  |
| `POST`   | /tasks            | Create a new task               |
| `GET`    | /tasks/:id        | Get task by ID                  |
| `PUT`    | /tasks/:id        | Replace a task                  |
| `DELETE` | /tasks/:id        | Delete a task                   |
| `POST`   | /tasks/:id/done   | Mark a task as completed        |

## Running the Linter

```bash
npm run lint
```

To auto-fix lint issues:

```bash
npm run lint:fix
```

## OpenAPI Documentation

Start the server and open [http://localhost:3000/docs](http://localhost:3000/docs) in your browser to view the interactive Swagger UI documentation.

## Testing

Import the Hoppscotch collection from `hoppscotch-collection.json` (if provided) or test manually:

1. `POST /login` with `{ "username": "admin", "password": "password123" }`
2. Copy the token from the response
3. Add `Authorization: Bearer <token>` header to all `/tasks` requests
