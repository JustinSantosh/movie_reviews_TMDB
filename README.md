# TV Time

A React movie discovery app built with Vite, Tailwind CSS, TMDB, and Appwrite.

## Features

- Browse popular movies
- Search movies by title
- Switch between movies and TV shows
- Filter by original language and year
- Sort by popularity, rating, newest, or title
- Rate titles on a 1-10 scale
- Sign up and sign in with Appwrite accounts
- Write and view shared audience reviews stored in Appwrite
- Show basic movie metadata such as rating, language, and release year
- Track searched movies for a trending section when Appwrite is configured
- Responsive movie grid UI

## Tech Stack

- React
- Vite
- Tailwind CSS
- TMDB API
- Appwrite

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
VITE_TMDB_API_KEY=

VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_COLLECTION_ID=
VITE_APPWRITE_REVIEWS_COLLECTION_ID=
```

`VITE_TMDB_API_KEY` is required for movie data.

The Appwrite values are optional for browsing, but required for accounts, shared reviews, search-count tracking, and the trending section.

## Appwrite Setup

Enable Email/Password authentication in your Appwrite project.

Create one database and add these collections:

Search collection, used by `VITE_APPWRITE_COLLECTION_ID`:

```text
searchTerm: string
count: integer
movie_id: integer
poster_url: string
```

Reviews collection, used by `VITE_APPWRITE_REVIEWS_COLLECTION_ID`:

```text
titleKey: string
contentType: string
tmdbId: integer
title: string
posterPath: string
rating: integer
reviewText: string
authorName: string
userId: string
userEmail: string
```

Recommended reviews collection permissions:

```text
Read: Any
Create: Users
Update: Users
Delete: Users
```

Add an index on `titleKey` in the reviews collection so review lookups are fast.

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Project Structure

```text
src/
  components/
    AuthPanel.jsx
    Filters.jsx
    MovieCard.jsx
    ReviewModal.jsx
    Search.jsx
    Spinner.jsx
  App.jsx
  appwrite.js
  index.css
  main.jsx
```
