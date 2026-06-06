import { useEffect, useState } from 'react'

const ratingValues = Array.from({ length: 10 }, (_, index) => index + 1);

const getDisplayTitle = (item) => item.title || item.name || 'Untitled';

const getDisplayDate = (item) => item.release_date || item.first_air_date || '';

const getPosterUrl = (posterPath) =>
  posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '/no-movie.png';

const ReviewModal = ({
  item,
  contentType,
  reviews,
  reviewStats,
  currentUser,
  isReviewServiceConfigured,
  isSubmitting,
  errorMessage,
  onClose,
  onAddReview,
}) => {
  const [rating, setRating] = useState(8);
  const [text, setText] = useState('');

  const displayTitle = getDisplayTitle(item);
  const displayDate = getDisplayDate(item);
  const displayYear = displayDate ? displayDate.split('-')[0] : 'N/A';
  const tmdbRating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', closeOnEscape);

    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    const wasSaved = await onAddReview({
      rating,
      text: cleanText,
    });

    if (wasSaved) {
      setRating(8);
      setText('');
    }
  }

  return (
    <div className="review-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="review-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${displayTitle} reviews`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close reviews">
          X
        </button>

        <div className="review-hero">
          <img src={getPosterUrl(item.poster_path)} alt={displayTitle} />

          <div className="review-title-block">
            <div className="review-kicker">
              <span>{contentType === 'movie' ? 'Movie' : 'TV Show'}</span>
              <span>{displayYear}</span>
              <span>{item.original_language || 'N/A'}</span>
            </div>

            <h2>{displayTitle}</h2>

            <div className="score-row">
              <div>
                <span>TMDB</span>
                <strong>{tmdbRating}/10</strong>
              </div>
              <div>
                <span>Audience</span>
                <strong>
                  {reviewStats.count ? `${reviewStats.average.toFixed(1)}/10` : 'Not rated'}
                </strong>
              </div>
              <div>
                <span>Reviews</span>
                <strong>{reviewStats.count}</strong>
              </div>
            </div>

            <p className="overview">
              {item.overview || 'No overview is available for this title.'}
            </p>
          </div>
        </div>

        {isReviewServiceConfigured && currentUser ? (
          <form className="review-form" onSubmit={handleSubmit}>
            <p className="posting-as">
              Posting as <strong>{currentUser.name || currentUser.email}</strong>
            </p>

            <div className="rating-picker" aria-label="Choose your rating">
              {ratingValues.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={rating === value ? 'active' : ''}
                  onClick={() => setRating(value)}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="review-fields">
              <textarea
                placeholder="Write your review"
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows="4"
                required
              />
            </div>

            {errorMessage && <p className="review-error">{errorMessage}</p>}

            <button className="submit-review" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="review-form review-locked">
            <p>
              {isReviewServiceConfigured
                ? 'Sign in to rate this title and write a review.'
                : 'Configure the Appwrite reviews collection to enable shared reviews.'}
            </p>
            {errorMessage && <p className="review-error">{errorMessage}</p>}
          </div>
        )}

        <div className="review-list">
          <h3>Audience Reviews</h3>

          {reviews.length === 0 ? (
            <p className="empty-reviews">No reviews yet. Be the first to rate this title.</p>
          ) : (
            <ul>
              {reviews.map((review) => (
                <li key={review.id}>
                  <div>
                    <strong>{review.author}</strong>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="review-rating">{review.rating}/10</p>
                  <p>{review.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default ReviewModal
