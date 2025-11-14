# Activity Tracker API

API for tracking client usage (request logs, daily/top stats). Built with NestJS + Prisma + Redis cache (with local LRU fallback).

---

## Requirements

- Node.js 20+
- Yarn
- PostgreSQL 15+
- Redis 7+
- (Optional) Docker + Docker Compose for quick setup

---

## Manual Installation

1. **Clone & install dependencies**

    ```bash
    git clone <repo>
    cd activity-tracker-api
    yarn install
    ```

2. **Copy `.env`**

    ```bash
    cp .env.example .env
    ```

    Update:
    - `DATABASE_URL=postgres://user:pass@host:5432/activity_tracker`
    - `REDIS_HOST`, `REDIS_PORT`
    - `JWT_SECRET_KEY`, etc.

3. **Run migrations & seed**

    ```bash
    yarn db:migrate        # or yarn db:deploy
    yarn db:seed
    ```

4. **Start the app**
    ```bash
    yarn dev        # watch mode
    # or
    yarn start:prod # after yarn build
    ```

---

## Docker Compose Installation

1. Ensure `.env` exists (Compose can override values as needed).

2. Start backing services first (optional but recommended):

    ```bash
    docker compose up -d postgres redis
    ```

3. Run migration & seed through the `api` service:

    ```bash
    docker compose run --rm api yarn db:migrate
    docker compose run --rm api yarn db:seed
    ```

4. Bring up the entire stack (API + Postgres + Redis):

    ```bash
    docker compose up
    ```

    API available at `http://localhost:4000`.

---

## Key Scripts

| Script            | Description                       |
| ----------------- | --------------------------------- |
| `yarn dev`        | NestJS watch mode                 |
| `yarn start:prod` | Run compiled build                |
| `yarn db:migrate` | Prisma migrate dev                |
| `yarn db:deploy`  | Apply migrations on production DB |
| `yarn db:seed`    | Seed sample data                  |
| `yarn test`       | Unit tests                        |
| `yarn test:e2e`   | End-to-end tests                  |

---

## Technical Features

- **Layered caching**: Redis + local LRU fallback, cache versioning & Pub/Sub to invalidate across instances.
- **Rate limiting**: Redis-based guard per client (1000 req/hour default).
- **Cache pre-warm**: Usage endpoints invoked automatically at bootstrap.
- **Prisma**: ORM queries + seeder, with indexes on critical fields (client_id, timestamp).

---

## Main Endpoints

- `POST /api/register` – Register a client (API key generated automatically).
- `POST /api/logs` – Record client requests (requires API key header, rate limited + batching).
- `GET /api/usage/daily` – Stats for the last 7 days.
- `GET /api/usage/top` – Top 3 clients within 24 hours.

(See `src/` for other auth/client endpoints.)

---

## Development

1. Run `yarn dev` for auto-reload.
2. Use `docker compose up` for a full local stack.
3. After updating Prisma schema, run `yarn db:migrate` then `yarn db:generate`.

---

## License

Internal project. Add proper license info if needed. (NestJS is MIT).
