import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import omdbApi from '../api/omdbApi';
import { RootState } from '../store/store';
import {
  fetchMoviesStart,
  fetchMoviesSuccess,
  fetchMoviesFailure,
} from '../store/slices/moviesSlice';
import {
  setSearchTerm,
  setSelectedTypes,
  setYear,
  setMinRating,
  setPage,
} from '../store/slices/filtersSlice';
import { Movie } from '../types/Movie';
import _ from 'lodash'; // Lodash'ı import ediyoruz
import './HomePage.scss';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x450?text=No+Image';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = _.debounce(() => {
      setDebouncedValue(value);
    }, delay);

    handler();

    return () => {
      handler.cancel();
    };
  }, [value, delay]);

  return debouncedValue;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();

  const { movies, totalResults, loading, error } = useSelector(
    (state: RootState) => state.movies
  );
  const { searchTerm, selectedTypes, year, minRating, page } = useSelector(
    (state: RootState) => state.filters
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedYear = useDebounce(year, 300);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        dispatch(fetchMoviesStart());

        // Eğer minRating 0 veya boş ise, sadece mevcut sayfadaki filmlerin detaylarını alırız
        if (!minRating || minRating === 0) {
          // Sadece temel film bilgilerini alıyoruz
          const response = await omdbApi.get('', {
            params: {
              s: debouncedSearchTerm,
              page,
              y: debouncedYear || undefined,
              type:
                selectedTypes.length === 1 ? selectedTypes[0] : undefined,
            },
          });

          if (response.data.Search) {
            const movies = response.data.Search;

            // Mevcut sayfadaki filmlerin detaylarını alıyoruz
            const movieDetailsPromises: Promise<Movie>[] = movies.map(
              async (movie: Movie): Promise<Movie> => {
                const movieDetailsResponse = await omdbApi.get('', {
                  params: { i: movie.imdbID },
                });
                return { ...movie, ...movieDetailsResponse.data };
              }
            );

            // İstekleri gruplandırıyoruz (örneğin 5'erli)
            const movieDetailsChunks = _.chunk(movieDetailsPromises, 5);

            // Detayları paralel olarak ama gruplandırılmış şekilde alıyoruz
            const moviesWithDetails: Movie[] = [];
            for (const chunk of movieDetailsChunks) {
              const results = await Promise.all(chunk);
              moviesWithDetails.push(...results);
            }

            dispatch(
              fetchMoviesSuccess({
                movies: moviesWithDetails,
                totalResults: parseInt(response.data.totalResults, 10) || 0,
              })
            );
          } else {
            dispatch(
              fetchMoviesSuccess({
                movies: [],
                totalResults: 0,
              })
            );
          }
        } else {
          // minRating > 0 ise, tüm filmleri alıp IMDb puanına göre filtreleriz
          const allMovies: Movie[] = [];
          let currentPage = 1;
          let fetchedAll = false;
          const MAX_PAGES = 50; // Maksimum sayfa sayısı (isteğe bağlı olarak ayarlanabilir)

          while (!fetchedAll && currentPage <= MAX_PAGES) {
            const response = await omdbApi.get('', {
              params: {
                s: debouncedSearchTerm,
                page: currentPage,
                y: debouncedYear || undefined,
                type:
                  selectedTypes.length === 1 ? selectedTypes[0] : undefined,
              },
            });

            if (response.data.Search) {
              const movies = response.data.Search;

              // Her film için detayları alıyoruz
              const movieDetailsPromises: Promise<Movie>[] = movies.map(
                async (movie: Movie): Promise<Movie> => {
                  const movieDetailsResponse = await omdbApi.get('', {
                    params: { i: movie.imdbID },
                  });
                  return { ...movie, ...movieDetailsResponse.data };
                }
              );

              // İstekleri gruplandırıyoruz (örneğin 10'arlı)
              const movieDetailsChunks = _.chunk(movieDetailsPromises, 10);

              for (const chunk of movieDetailsChunks) {
                const results: Movie[] = await Promise.all(chunk);
                allMovies.push(...results);
              }

              const totalResultsFromAPI =
                parseInt(response.data.totalResults, 10) || 0;
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

          // IMDb puanına göre filtreleme
          const filteredMovies = _.filter(allMovies, (movie: Movie) => {
            const rating = parseFloat(movie.imdbRating || '0');
            return rating >= minRating;
          });

          // Filtrelenmiş ve sıralanmış filmleri IMDb puanına göre sıralıyoruz (yüksekten düşüğe)
          const sortedMovies = _.orderBy(
            filteredMovies,
            [(movie: Movie) => parseFloat(movie.imdbRating || '0')],
            ['desc']
          );

          // Filtrelenmiş ve sıralanmış filmleri sayfalandırıyoruz
          const moviesPerPage = 10;
          const paginatedMovies = sortedMovies.slice(
            (page - 1) * moviesPerPage,
            page * moviesPerPage
          );

          dispatch(
            fetchMoviesSuccess({
              movies: paginatedMovies,
              totalResults: sortedMovies.length,
            })
          );
        }
      } catch (error) {
        dispatch(fetchMoviesFailure('Error fetching movies'));
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [
    debouncedSearchTerm,
    selectedTypes,
    debouncedYear,
    minRating,
    page,
    dispatch,
  ]);

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
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        className="search-bar"
      />

      {/* Filtreler */}
      <div className="filters">
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => dispatch(setYear(e.target.value))}
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
                  dispatch(
                    setSelectedTypes(
                      selectedTypes.includes(type)
                        ? _.without(selectedTypes, type)
                        : [...selectedTypes, type]
                    )
                  )
                }
              />
              {_.startCase(type)}
            </label>
          ))}
        </div>

        {/* Min IMDb Rating filtresi */}
        <input
          type="number"
          step="0.1"
          placeholder="Min IMDb Rating"
          value={minRating}
          onChange={(e) =>
            dispatch(setMinRating(parseFloat(e.target.value) || 0))
          }
          className="rating-filter"
        />
      </div>

      {/* Yükleme Göstergesi veya Hata Mesajı */}
      {loading ? (
        <p>Loading movies...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          {/* Film Listesi */}
          {movies.length === 0 ? (
            <p>No movies found for the selected filters.</p>
          ) : (
            <div className="movie-grid">
              {movies.map((movie: Movie) => (
                <div key={movie.imdbID} className="movie-card">
                  <Link to={`/details/${movie.imdbID}`}>
                    <img
                      src={
                        movie.Poster !== 'N/A'
                          ? movie.Poster
                          : PLACEHOLDER_IMAGE
                      }
                      alt={movie.Title || 'No Title'}
                      className="movie-poster"
                    />
                    <h2 className="movie-title">
                      {movie.Title || 'No Title Available'}
                    </h2>
                    <p className="movie-year">
                      {movie.Year || 'Unknown Year'}
                    </p>
                    {/* IMDb Puanını gösteriyoruz */}
                    <p className="movie-rating">
                      IMDb: {movie.imdbRating || 'N/A'}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          )}

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
        </>
      )}
    </div>
  );
};

export default HomePage;