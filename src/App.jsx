import { useCallback, useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Filters from './components/Filters.jsx'
import AuthPanel from './components/AuthPanel.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import ReviewModal from './components/ReviewModal.jsx'
import { useDebounce } from 'react-use'
import {
  createReview,
  createUserAccount,
  getCurrentUser,
  getReviewsForTitle,
  getReviewsForTitles,
  getTrendingMovies,
  isAuthConfigured,
  isReviewServiceConfigured,
  signInUser,
  signOutUser,
  updateSearchCount,
} from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const DEFAULT_FILTERS = {
  contentType: 'movie',
  language: '',
  sortBy: 'popularity.desc',
  year: '',
}

const getTitleKey = (item, contentType) => `${contentType}-${item.id}`;

const getReviewStats = (reviews = []) => {
  if (reviews.length === 0) {
    return { count: 0, average: 0 };
  }

  const totalRating = reviews.reduce((total, review) => total + review.rating, 0);

  return {
    count: reviews.length,
    average: totalRating / reviews.length,
  };
}

const getYearParam = (contentType) =>
  contentType === 'movie' ? 'primary_release_year' : 'first_air_date_year';

const getDiscoverSort = (sortBy, contentType) => {
  if (sortBy === 'release_date.desc') {
    return contentType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
  }

  if (sortBy === 'title.asc') {
    return 'popularity.desc';
  }

  return sortBy;
}

const getResultTitle = (result) => result.title || result.name || '';

const getResultDate = (result) => result.release_date || result.first_air_date || '';

const sortSearchResults = (results, sortBy) => {
  const sortedResults = [...results];

  if (sortBy === 'vote_average.desc') {
    return sortedResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }

  if (sortBy === 'release_date.desc') {
    return sortedResults.sort((a, b) => getResultDate(b).localeCompare(getResultDate(a)));
  }

  if (sortBy === 'title.asc') {
    return sortedResults.sort((a, b) => getResultTitle(a).localeCompare(getResultTitle(b)));
  }

  return sortedResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

const applySearchFilters = (results, filters) => {
  const filteredResults = results.filter((result) => {
    const matchesLanguage = filters.language
      ? result.original_language === filters.language
      : true;

    const matchesYear = filters.year
      ? getResultDate(result).startsWith(filters.year)
      : true;

    return matchesLanguage && matchesYear;
  });

  return sortSearchResults(filteredResults, filters.sortBy);
}

const buildEndpoint = (query, filters) => {
  const endpointType = query ? 'search' : 'discover';
  const url = new URL(`${API_BASE_URL}/${endpointType}/${filters.contentType}`);

  if (query) {
    url.searchParams.set('query', query);
  } else {
    url.searchParams.set('sort_by', getDiscoverSort(filters.sortBy, filters.contentType));
  }

  if (filters.language && !query) {
    url.searchParams.set('with_original_language', filters.language);
  }

  if (filters.year) {
    url.searchParams.set(getYearParam(filters.contentType), filters.year);
  }

  return url.toString();
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [reviewsByTitle, setReviewsByTitle] = useState({});
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = useCallback(async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = buildEndpoint(query, filters);
      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch titles');
      }

      const data = await response.json();
      const rawResults = data.results || [];
      const results = query
        ? applySearchFilters(rawResults, filters)
        : sortSearchResults(rawResults, filters.sortBy);

      setMovieList(results);

      if(filters.contentType === 'movie' && query && results.length > 0) {
        await updateSearchCount(query, results[0]);
      }
    } catch (error) {
      console.error(`Error fetching titles: ${error}`);
      setErrorMessage('Error fetching titles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [filters])

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchMovies]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!isAuthConfigured) {
        return;
      }

      setIsAuthLoading(true);
      setCurrentUser(await getCurrentUser());
      setIsAuthLoading(false);
    }

    loadCurrentUser();
  }, []);

  useEffect(() => {
    const loadReviewSummaries = async () => {
      const titleKeys = movieList.map((movie) => getTitleKey(movie, filters.contentType));

      if (titleKeys.length === 0) {
        return;
      }

      const reviews = await getReviewsForTitles(titleKeys);

      setReviewsByTitle((currentReviews) => ({
        ...currentReviews,
        ...reviews,
      }));
    }

    loadReviewSummaries();
  }, [movieList, filters.contentType]);

  useEffect(() => {
    const loadSelectedTitleReviews = async () => {
      if (!selectedTitle) {
        return;
      }

      const titleKey = getTitleKey(selectedTitle.item, selectedTitle.contentType);
      const reviews = await getReviewsForTitle(titleKey);

      setReviewsByTitle((currentReviews) => ({
        ...currentReviews,
        [titleKey]: reviews,
      }));
    }

    loadSelectedTitleReviews();
  }, [selectedTitle]);

  const handleSignIn = async (credentials) => {
    setAuthError('');
    setIsAuthLoading(true);

    try {
      setCurrentUser(await signInUser(credentials));
    } catch (error) {
      setAuthError(error.message || 'Unable to sign in.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  const handleSignUp = async (credentials) => {
    setAuthError('');
    setIsAuthLoading(true);

    try {
      setCurrentUser(await createUserAccount(credentials));
    } catch (error) {
      setAuthError(error.message || 'Unable to create account.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  const handleSignOut = async () => {
    setAuthError('');
    setIsAuthLoading(true);

    try {
      await signOutUser();
      setCurrentUser(null);
    } catch (error) {
      setAuthError(error.message || 'Unable to sign out.');
    } finally {
      setIsAuthLoading(false);
    }
  }

  const addReview = async ({ rating, text }) => {
    if (!selectedTitle) {
      return false;
    }

    setReviewError('');
    setIsSubmittingReview(true);

    const titleKey = getTitleKey(selectedTitle.item, selectedTitle.contentType);

    try {
      const review = await createReview({
        item: selectedTitle.item,
        contentType: selectedTitle.contentType,
        rating,
        text,
      }, currentUser);

      setReviewsByTitle((currentReviews) => ({
        ...currentReviews,
        [titleKey]: [review, ...(currentReviews[titleKey] || [])],
      }));

      return true;
    } catch (error) {
      setReviewError(error.message || 'Unable to post review.');
      return false;
    } finally {
      setIsSubmittingReview(false);
    }
  }

  const selectedTitleKey = selectedTitle
    ? getTitleKey(selectedTitle.item, selectedTitle.contentType)
    : '';

  const selectedTitleReviews = reviewsByTitle[selectedTitleKey] || [];

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies and Shows</span> You&apos;ll Enjoy Without the Hassle</h1>

          <AuthPanel
            currentUser={currentUser}
            isConfigured={isAuthConfigured}
            isLoading={isAuthLoading}
            errorMessage={authError}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onSignOut={handleSignOut}
          />

          <Search
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder={`Search through thousands of ${filters.contentType === 'movie' ? 'movies' : 'shows'}`}
          />

          <Filters
            filters={filters}
            setFilters={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>{filters.contentType === 'movie' ? 'All Movies' : 'All TV Shows'}</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard
                  key={`${filters.contentType}-${movie.id}`}
                  movie={movie}
                  contentType={filters.contentType}
                  reviewStats={getReviewStats(reviewsByTitle[getTitleKey(movie, filters.contentType)] || [])}
                  onSelect={() => setSelectedTitle({ item: movie, contentType: filters.contentType })}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedTitle && (
        <ReviewModal
          item={selectedTitle.item}
          contentType={selectedTitle.contentType}
          reviews={selectedTitleReviews}
          reviewStats={getReviewStats(selectedTitleReviews)}
          currentUser={currentUser}
          isReviewServiceConfigured={isReviewServiceConfigured}
          isSubmitting={isSubmittingReview}
          errorMessage={reviewError}
          onClose={() => setSelectedTitle(null)}
          onAddReview={addReview}
        />
      )}
    </main>
  )
}

export default App
