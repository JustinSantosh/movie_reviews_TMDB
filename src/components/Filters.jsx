const languageOptions = [
  { value: '', label: 'Any language' },
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'te', label: 'Telugu' },
  { value: 'ta', label: 'Tamil' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
]

const sortOptions = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Top rated' },
  { value: 'release_date.desc', label: 'Newest' },
  { value: 'title.asc', label: 'Title A-Z' },
]

const Filters = ({ filters, setFilters, onReset }) => {
  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
  }

  return (
    <section className="filters" aria-label="Content filters">
      <div className="filter-group">
        <span>Type</span>
        <div className="segmented" role="group" aria-label="Choose title type">
          <button
            type="button"
            className={filters.contentType === 'movie' ? 'active' : ''}
            onClick={() => updateFilter('contentType', 'movie')}
          >
            Movies
          </button>
          <button
            type="button"
            className={filters.contentType === 'tv' ? 'active' : ''}
            onClick={() => updateFilter('contentType', 'tv')}
          >
            TV Shows
          </button>
        </div>
      </div>

      <label className="filter-group">
        <span>Language</span>
        <select
          value={filters.language}
          onChange={(event) => updateFilter('language', event.target.value)}
        >
          {languageOptions.map((option) => (
            <option key={option.value || 'any'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-group">
        <span>Sort by</span>
        <select
          value={filters.sortBy}
          onChange={(event) => updateFilter('sortBy', event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-group">
        <span>Year</span>
        <input
          type="number"
          min="1900"
          max="2100"
          placeholder="Any"
          value={filters.year}
          onChange={(event) => updateFilter('year', event.target.value)}
        />
      </label>

      <button className="reset-filters" type="button" onClick={onReset}>
        Reset
      </button>
    </section>
  )
}

export default Filters
