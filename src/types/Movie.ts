export interface Movie {
    imdbID: string;
    Title: string;
    Year: string;
    Poster: string;
    Type: string;
    imdbRating?: string;
    [key: string]: any; // Diğer detaylı bilgiler için
}