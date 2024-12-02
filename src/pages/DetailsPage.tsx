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
        <h1>{movie.Title}</h1>
        <img src={movie.Poster} alt={movie.Title} />
        <p>Year: {movie.Year}</p>
        <p>Director: {movie.Director}</p>
        <p>Genre: {movie.Genre}</p>
        <p>Plot: {movie.Plot}</p>
        </div>
    );
};

export default DetailsPage;