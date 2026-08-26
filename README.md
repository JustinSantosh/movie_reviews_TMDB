# Movie Reviews TMDB

A React movie discovery application powered by the TMDB API. Browse popular movies, search for titles, and view ratings, languages, release years, and movie posters in a responsive interface.

## Features

- Browse popular movies from TMDB
- Search for movies by title
- View ratings, language, release year, and poster artwork
- Display trending movies using Appwrite search statistics
- Responsive layout for desktop and mobile screens

## Tech Stack

- React
- Vite
- Tailwind CSS
- Appwrite
- TMDB API

## Requirements

- Node.js 18 or newer
- npm
- A TMDB API Read Access Token
- An Appwrite project, database, and collection for trending search statistics

## Getting Started

Clone the repository and install its dependencies:

```bash
git clone https://github.com/JustinSantosh/movie_reviews_TMDB.git
cd movie_reviews_TMDB
npm install
```

Create a `.env.local` file in the project root:

```env
VITE_TMDB_API_KEY=your_tmdb_read_access_token

VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_appwrite_database_id
VITE_APPWRITE_COLLECTION_ID=your_appwrite_collection_id
```

The TMDB token can be created from the [TMDB developer dashboard](https://developer.themoviedb.org/reference/intro/getting-started). The Appwrite values come from your Appwrite project.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
npm run lint      # Check the source files with ESLint
```

## Project Structure

```text
src/
  components/    Reusable movie UI components
  App.jsx        Main application and API state
  appwrite.js    Appwrite database helpers
  index.css      Global styles and Tailwind configuration
public/          Images and static assets
```

## License

This project is maintained for personal and educational use.
