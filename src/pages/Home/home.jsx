import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';

const API_KEY = 'c858c6eaab0adf99aa05c18c3062ab95';
const BASE    = 'https://api.themoviedb.org/3';

const ScrollRow = ({ title, movies }) => {
  const navigate  = useNavigate();
  const rowRef    = useRef(null);

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' });
  };

  return (
    <div className="scroll-section">
      <div className="scroll-header">
        <h2 className="scroll-title">{title}</h2>
        <div className="scroll-arrows">
          <button onClick={() => scroll(-1)} aria-label="Назад">‹</button>
          <button onClick={() => scroll(1)}  aria-label="Вперёд">›</button>
        </div>
      </div>

      <div className="scroll-row" ref={rowRef}>
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="scroll-card"
            onClick={() => navigate(`/movie/${movie.id}`, { state: { from: '/' } })}
          >
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
              />
            ) : (
              <div className="scroll-card-no-poster">
                <span>{movie.title}</span>
              </div>
            )}
            <div className="scroll-card-overlay">
              <p className="scroll-card-title">{movie.title}</p>
              {movie.release_date && (
                <p className="scroll-card-year">{movie.release_date.slice(0, 4)}</p>
              )}
              {movie.vote_average > 0 && (
                <p className="scroll-card-rating">★ {movie.vote_average.toFixed(1)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const MovieSearch = () => {
  const [query, setQuery] = useState(
    () => sessionStorage.getItem('search_query') || ''
  );
  const [movies, setMovies] = useState(
    () => JSON.parse(sessionStorage.getItem('search_results') || '[]')
  );
  const [popular, setPopular]   = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const load = async () => {
      try {
        const [popRes, newRes] = await Promise.all([
          fetch(`${BASE}/movie/popular?api_key=${API_KEY}&language=ru-RU&page=1`),
          fetch(`${BASE}/movie/now_playing?api_key=${API_KEY}&language=ru-RU&page=1`),
        ]);
        const [popData, newData] = await Promise.all([popRes.json(), newRes.json()]);
        setPopular(popData.results  || []);
        setNewMovies(newData.results || []);
      } catch (e) {
        console.error('Ошибка загрузки:', e);
      }
    };
    load();
  }, []);

  const searchMovies = async (q = query) => {
    if (!q.trim()) return;
    const url = `${BASE}/search/movie?api_key=${API_KEY}&query=${q}&language=ru-RU&page=1&include_adult=false`;
    try {
      const response = await axios.get(url);
      const results  = response.data.results;
      setMovies(results);
      sessionStorage.setItem('search_results', JSON.stringify(results));
      sessionStorage.setItem('search_query', q);
    } catch (error) {
      console.error('Ошибка при поиске:', error);
    }
  };

  const handleKeyDown     = (e) => { if (e.key === 'Enter') searchMovies(); };
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    sessionStorage.setItem('search_query', e.target.value);

    if (!e.target.value.trim()) {
      setMovies([]);
      sessionStorage.removeItem('search_results');
      sessionStorage.removeItem('search_query');
    }
  };

  const showSearch = movies.length > 0;

  return (
    <div className="contai">
      <main>
        <section>

          
          <div className="movieSearch">
            <h1>Найди свой фильм</h1>
            <div className="searchcont">
              <input
                type="text"
                placeholder="Введите название фильма"
                value={query}
                className="inp"
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
              />
              <button className="sea" onClick={() => searchMovies()}>
                Поиск
              </button>
            </div>
          </div>

          
          {showSearch && (
            <div className="search-results-section">
              <div className="scroll-header">
                <h2 className="scroll-title">Результаты поиска</h2>
                <button
                  className="search-clear"
                  onClick={() => {
                    setMovies([]);
                    setQuery('');
                    sessionStorage.removeItem('search_results');
                    sessionStorage.removeItem('search_query');
                  }}
                >
                  ✕ Очистить
                </button>
              </div>
              <div className="card">
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="map"
                    onClick={() => navigate(`/movie/${movie.id}`, { state: { from: '/' } })}
                  >
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        className="pi"
                      />
                    ) : (
                      <div className="map-no-poster"><span>{movie.title}</span></div>
                    )}
                    <div className="map-overlay">
                      <p className="map-overlay-title">{movie.title}</p>
                      {movie.release_date && (
                        <p className="map-overlay-year">{movie.release_date.slice(0, 4)}</p>
                      )}
                      {movie.vote_average > 0 && (
                        <p className="map-overlay-rating">★ {movie.vote_average.toFixed(1)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          
          {!showSearch && (
            <>
              {popular.length   > 0 && <ScrollRow title="Популярное"  movies={popular} />}
              {newMovies.length > 0 && <ScrollRow title="Новинки"     movies={newMovies} />}
            </>
          )}

        </section>
      </main>
    </div>
  );
};

export default MovieSearch;