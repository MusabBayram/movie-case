import React, { useEffect, useState } from 'react';
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
import _ from 'lodash'; 
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Box from '@mui/material/Box';
import MuiSwitch from '../components/muiSwitch'; 
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
  const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  const savedTheme = localStorage.getItem('theme') || 'light'; // Varsayılan 'light'
  setDarkMode(savedTheme === 'dark');
  const body = document.body;
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
  } else {
    body.classList.add('light-mode');
  }
}, []);

  const handleThemeChange = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      const body = document.body;
      if (newMode) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark'); 
      } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

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
      <div className='mui-switch'>
        <MuiSwitch checked={darkMode} onChange={handleThemeChange} />
      </div>
      <h1 className="title">Movie Explorer</h1>

      {/* Arama Çubuğu */}
      <input
        type="text"
        placeholder="Search for movies..."
        value={searchTerm}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        className="search-bar"
      />

      {/* Yıl filtreleme */}
      <div className="filters">
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => dispatch(setYear(e.target.value))}
          className="year-filter"
        />

        {/* Material-UI Filtreleme */}
        <FormGroup row>
          {['movie', 'series', 'episode'].map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
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
                  sx={{
                    color: 'var(--text-color)', // Varsayılan checkbox rengi
                    '&.Mui-checked': {
                      color: 'var(--primary-color)', // Seçili olduğunda checkbox rengi
                    },
                    '& .MuiSvgIcon-root': {
                      fill: 'var(--primary-color)', // İkonun iç rengi
                    },
                  }}
                />
              }
              label={type.charAt(0).toUpperCase() + type.slice(1)}
            />
          ))}
        </FormGroup>

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
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
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
                <Link to={`/details/${movie.imdbID}`}>
                  <div key={movie.imdbID} className="movie-card">
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
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Sayfalandırma Kontrolleri */}
          <div className="pagination-controls">
            <button onClick={handlePrevPage} disabled={page === 1}>
              <ArrowBackIosNewIcon />
            </button>
            <span>
            {page} / {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={page >= totalPages}>
              <ArrowForwardIosIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;