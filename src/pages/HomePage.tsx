import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import omdbApi from '../api/omdbApi';
import { Movie } from '../types/Movie';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('Pokemon');
  const [page, setPage] = useState(1); 
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await omdbApi.get('', {
          params: { s: searchTerm, page }, // Arama terimi ve sayfa parametreleri
        });
        setMovies(response.data.Search || []);
        setTotalResults(parseInt(response.data.totalResults, 10));
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [searchTerm, page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); 
  };

  const handleNextPage = () => {
    if (page < Math.ceil(totalResults / 10)) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className="homepage">
      <h1 className="title">Dark Themed Movie Explorer</h1>
      
      {/* Arama Çubuğu */}
      <input
        type="text"
        placeholder="Search for movies..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-bar"
      />

      {/* Film Listesi */}
      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie.imdbID} className="movie-card">
            <Link to={`/details/${movie.imdbID}`}>
              <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
              <h2 className="movie-title">{movie.Title}</h2>
              <p className="movie-year">{movie.Year}</p>
            </Link>
          </div>
        ))}
      </div>

      {/* Sayfalandırma Kontrolleri */}
      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {Math.ceil(totalResults / 10)}</span>
        <button onClick={handleNextPage} disabled={page >= Math.ceil(totalResults / 10)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default HomePage;