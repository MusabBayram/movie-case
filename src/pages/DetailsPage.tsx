import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import omdbApi from '../api/omdbApi';
import './DetailsPage.scss';

const DetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<any>(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
        try {
            const response = await omdbApi.get('', {
            params: { i: id },
            });
            setMovie(response.data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
        };

        fetchMovieDetails();
    }, [id]);

    if (!movie) {
        return <p>Loading...</p>;
    }

    return (
        <div className="details-page">
        <div className="details-header">
            <img src={movie.Poster} alt={movie.Title} className="movie-poster" />
            <div className="movie-info">
            <h1>{movie.Title}</h1>
            <p><strong>Year:</strong> {movie.Year}</p>
            <p><strong>Director:</strong> {movie.Director}</p>
            <p><strong>Actors:</strong> {movie.Actors}</p>
            <p><strong>Genre:</strong> {movie.Genre}</p>
            <p><strong>IMDb Rating:</strong> {movie.imdbRating}</p>
            </div>
        </div>
        <div className="movie-plot">
            <h2>Plot</h2>
            <p>{movie.Plot}</p>
        </div>
        </div>
    );
};

export default DetailsPage;