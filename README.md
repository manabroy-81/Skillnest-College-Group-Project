# SkillNest

SkillNest is a student-focused social learning platform where people share thoughts and posts, connect with each other, and search posts by domain. Its goal is to help students figure out which technologies to learn now and which will be in demand in the future.

**Live demo:** [add your deployed link here](https://your-demo-link.com)

## Screenshots

| Feed | Profile | Search |
| --- | --- | --- |
| ![Feed](docs/screenshots/feed.png) | ![Profile](docs/screenshots/profile.png) | ![Search](docs/screenshots/search.png) |

> Add your own screenshots to `docs/screenshots/` and update the file names above.

## Features

- Secure registration, login, logout, and session-based authentication
- Personal profiles with avatar, banner, bio, and follow/follower connections
- Create, edit, delete, and browse posts
- Optional image uploads for posts through Cloudinary
- Like and unlike posts
- Create, edit, and delete comments
- Search posts by content and users by username or full name
- Gemini-powered AI chat widget for learning and project questions
- Server-side validation, authorization checks, safe redirect handling, and custom error pages

## Tech stack

- **Backend:** Node.js, Express 5
- **Database:** MongoDB with Mongoose
- **Views:** EJS with EJS-Mate layouts
- **Frontend:** HTML, CSS, JavaScript
- **Authentication:** Passport Local and Express Session
- **Session store:** MongoDB (`connect-mongo`)
- **Uploads:** Multer and Cloudinary
- **Validation:** Joi
- **AI assistant:** Google Gemini API

## Prerequisites

- Node.js 18 or later
- MongoDB (local installation) or a MongoDB Atlas database
- A Cloudinary account for post image uploads
- A Google AI Studio / Gemini API key for the AI chat feature (optional)

## Installation

1. Clone the repository and open it in your terminal.

   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file from the example.

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Update `.env` with your own credentials.

   ```env
   CLOUD_NAME=your-cloudinary-cloud-name
   CLOUD_API_KEY=your-cloudinary-api-key
   CLOUD_API_SECRET=your-cloudinary-api-secret
   MONGO_URL=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/skillnest?retryWrites=true&w=majority
   SESSION_SECRET=replace-with-a-long-random-secret
   GOOGLE_API=your-google-ai-studio-api-key
   GEMINI_MODEL=gemini-flash-lite-latest
   ```

   `GOOGLE_API` may also be named `GEMINI_API`. If no `MONGO_URL` is supplied, the application uses `mongodb://127.0.0.1:27017/skillnest`.

5. Start the server.

   ```bash
   npm start
   ```

   For development with automatic restarts:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:8080](http://localhost:8080) in your browser.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Starts the production server. |
| `npm run dev` | Starts the server in watch mode. |
| `npm run check` | Checks the syntax of the main application files. |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGO_URL` | Yes* | MongoDB connection string. A local fallback is available for development. |
| `SESSION_SECRET` | Yes | Long, random string used to sign sessions. |
| `CLOUD_NAME` | For uploads | Cloudinary cloud name. |
| `CLOUD_API_KEY` | For uploads | Cloudinary API key. |
| `CLOUD_API_SECRET` | For uploads | Cloudinary API secret. |
| `GOOGLE_API` or `GEMINI_API` | For AI chat | Gemini API key. |
| `GEMINI_MODEL` | No | Gemini model name; defaults to `gemini-flash-lite-latest`. |
| `PORT` | No | Server port; defaults to `8080`. |

Never commit your `.env` file or expose API keys and database credentials.

## Main routes

| Route | Method | Description |
| --- | --- | --- |
| `/` | GET | Landing page (redirects signed-in users to the feed). |
| `/auth/register` | GET, POST | Create an account. |
| `/auth/login` | GET, POST | Sign in. |
| `/auth/logout` | POST | Sign out. |
| `/feed` | GET, POST | View the feed or create a post. |
| `/feed/:id` | GET, PUT, DELETE | View, update, or delete a post. |
| `/feed/:id/like` | POST | Toggle a post like. |
| `/feed/:postId/comments` | POST | Add a comment. |
| `/feed/:postId/comments/:commentId` | PUT, DELETE | Update or delete a comment. |
| `/users/:id` | GET, PUT | View or update a profile. |
| `/users/:id/follow` | POST | Follow or unfollow a user. |
| `/search?q=<query>` | GET | Search users and posts. |
| `/api/chat` | POST | Send a message to the AI assistant. |

Protected routes require authentication. Post and comment edits/deletions also require ownership.

## Project structure

```text
config/         Database, Passport, and Cloudinary configuration
controllers/    Request-handling logic
middleware/     Authentication, validation, and input normalization
models/         Mongoose schemas for users, posts, and comments
routes/         Express routes
schemas/        Joi validation schemas
views/          EJS pages, layouts, and partials
public/         CSS, JavaScript, and static assets
utils/          Error and async-handler utilities
app.js          Express application configuration
server.js       Database connection and server startup
```

## Image upload rules

Post image uploads accept JPEG, PNG, GIF, and WebP files up to 2 MB. Uploaded images are stored in Cloudinary under the `skillnest/posts` folder.

## Database seed data

The `init/index.js` script clears all posts in a local `skillnest` database and inserts the sample posts from `init/data.js`.

> Warning: running this script deletes existing posts in that local database.

```bash
node init/index.js
```

## Contributors

- **Manab Roy** - [GitHub](https://github.com/manabroy-81) - *Frontend,Backend*
- *Bibek* - [GitHub](https://github.com/teammate-username) - *UI,UX*


## License

This project is licensed under the ISC License. See `package.json` for details.
