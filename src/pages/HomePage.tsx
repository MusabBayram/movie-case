import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import omdbApi from '../api/omdbApi';
import { RootState } from '../store/store';
import { setMovies } from '../store/slices/moviesSlice';
import { setPage } from '../store/slices/filtersSlice';
import { Movie } from '../types/Movie';
import _ from 'lodash';
import './HomePage.scss';

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x450?text=No+Image";

const HomePage: React.FC = () => {
  const dispatch = useDispatch();

  const { movies, totalResults } = useSelector((state: RootState) => state.movies);
  const { searchTerm, selectedTypes, year, minRating, page } = useSelector(
    (state: RootState) => state.filters
  );

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const allMovies: Movie[] = [];
        let currentPage = 1;
        let fetchedAll = false;

        while (!fetchedAll /* && allMovies.length < 500 */) {
          const response = await omdbApi.get('', {
            params: {
              s: searchTerm,
              page: currentPage,
              y: year || undefined,
              type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
            },
          });

          if (response.data.Search) {
            const movieDetailsPromises = response.data.Search.map(async (movie: Movie) => {
              const movieDetails = await omdbApi.get('', { params: { i: movie.imdbID } });
              return { ...movie, imdbRating: movieDetails.data.imdbRating || 'N/A' };
            });

            const detailedMovies = await Promise.all(movieDetailsPromises);

            // IMDb puanına göre filtreleme
            const filteredMovies = detailedMovies.filter((movie: Movie) => {
              const rating = movie.imdbRating ? parseFloat(movie.imdbRating) : 0; 
              const minRatingNumber = minRating || 0;

              if (isNaN(rating)) {
                return minRatingNumber === 0;
              } else {
                return rating >= minRatingNumber;
              }
            });

            allMovies.push(...filteredMovies);

            // Toplam sonuç sayısını güncelleyin
            const totalResultsFromAPI = parseInt(response.data.totalResults, 10) || 0;
            const totalPages = Math.ceil(totalResultsFromAPI / 10);

            if (currentPage >= totalPages) {
              fetchedAll = true;
            } else {
              currentPage += 1;
            }
          } else {
            fetchedAll = true;
          }
        }

        // Sayfalandırma için filmleri bölün
        const moviesPerPage = 10;
        const paginatedMovies = allMovies.slice((page - 1) * moviesPerPage, page * moviesPerPage);

        dispatch(
          setMovies({
            movies: paginatedMovies,
            totalResults: allMovies.length,
          })
        );
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [searchTerm, selectedTypes, year, minRating, page, dispatch]);

  // Sayfa sayısı hesaplaması
  const moviesPerPage = 10;
  const totalPages = Math.ceil(totalResults / moviesPerPage);

  // Sayfa geçiş fonksiyonları
  const handleNextPage = () => {
    if (page < totalPages) {
      dispatch(setPage(page + 1));
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      dispatch(setPage(page - 1));
    }
  };

  return (
    <div className="homepage">
      <h1 className="title">Movie Explorer</h1>

      {/* Arama Çubuğu */}
      <input
        type="text"
        placeholder="Search for movies..."
        value={searchTerm}
        onChange={(e) => dispatch({ type: 'filters/setSearchTerm', payload: e.target.value })}
        className="search-bar"
      />

      {/* Filtreler */}
      <div className="filters">
          <input
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) =>
              dispatch({
                type: 'filters/setYear',
                payload: e.target.value,
              })
            }
            className="year-filter"
          />

        <div className="type-filter">
          {['movie', 'series', 'episode'].map((type) => (
            <label key={type}>
              <input
                type="checkbox"
                value={type}
                checked={selectedTypes.includes(type)}
                onChange={() =>
                  dispatch({
                    type: 'filters/setSelectedTypes',
                    payload: selectedTypes.includes(type)
                      ? selectedTypes.filter((t) => t !== type)
                      : [...selectedTypes, type],
                  })
                }
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>

        <input
          type="number"
          step="0.1"
          placeholder="Min IMDb Rating"
          value={minRating}
          onChange={(e) =>
            dispatch({ type: 'filters/setMinRating', payload: parseFloat(e.target.value) || 0 })
          }
          className="rating-filter"
        />
      </div>

      {/* Film Listesi */}
      <div className="movie-grid">
        {movies.map((movie: Movie) => (
          <div key={movie.imdbID} className="movie-card">
            <Link to={`/details/${movie.imdbID}`}>
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : PLACEHOLDER_IMAGE}
                alt={movie.Title || 'No Title'}
                className="movie-poster"
              />
              <h2 className="movie-title">{movie.Title || 'No Title Available'}</h2>
              <p className="movie-year">{movie.Year || 'Unknown Year'}</p>
              <p className="movie-rating">IMDb: {movie.imdbRating || 'N/A'}</p>
            </Link>
          </div>
        ))}
      </div>

      {/* Sayfalandırma Kontrolleri */}
      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default HomePage;