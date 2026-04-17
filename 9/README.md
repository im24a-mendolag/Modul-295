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

1. Open [Hoppscotch](https://hoppscotch.io)
2. Go to **Collections → Import → Import from JSON** and select `hoppscotch-collection.json`
3. Run **Auth → Login** first and copy the `token` from the response
4. Replace `<<token>>` in all other requests with your token
5. For task-specific requests, replace `<<id>>` with a real task ID from the list response
