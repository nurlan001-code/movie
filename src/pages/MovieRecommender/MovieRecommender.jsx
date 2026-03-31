import { useState, useRef } from "react";
import "./MovieRecommender.css";

const API_KEY = "c858c6eaab0adf99aa05c18c3062ab95";
const BASE_URL = "https://api.themoviedb.org/3";

const GENRES = [
  { id: 28,    name: "Action" },
  { id: 18,    name: "Drama" },
  { id: 35,    name: "Comedy" },
  { id: 10749, name: "Romance" },
  { id: 27,    name: "Horror" },
  { id: 878,   name: "Fantasy" },
  { id: 53,    name: "Thriller" },
  { id: 16,    name: "Animation" },
];

function MovieRecommender() {
  const [genreId, setGenreId]       = useState("");
  const [minRating, setMinRating]   = useState(0);
  const [year, setYear]             = useState("");
  const [runtime, setRuntime]       = useState("");
  const [actorQuery, setActorQuery] = useState("");
  const [actorId, setActorId]       = useState(null);
  const [actorName, setActorName]   = useState("");
  const [actorSuggestions, setActorSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const abortRef      = useRef(null);
  const actorAbortRef = useRef(null);

 
  const searchActor = async (query) => {
    setActorQuery(query);
    setActorId(null);
    setActorName("");

    if (query.length < 2) {
      setActorSuggestions([]);
      return;
    }

    if (actorAbortRef.current) actorAbortRef.current.abort();
    actorAbortRef.current = new AbortController();

    try {
      const res  = await fetch(
        `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ru-RU`,
        { signal: actorAbortRef.current.signal }
      );
      const data = await res.json();
      setActorSuggestions(data.results?.slice(0, 5) || []);
    } catch (e) {
      if (e.name !== "AbortError") setActorSuggestions([]);
    }
  };

  const selectActor = (actor) => {
    setActorId(actor.id);
    setActorName(actor.name);
    setActorQuery(actor.name);
    setActorSuggestions([]);
  };

  const clearActor = () => {
    setActorId(null);
    setActorName("");
    setActorQuery("");
    setActorSuggestions([]);
  };


  const safeFetch = async (url, signal) => {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };


  const recommendMovie = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setLoading(true);
    setError("");
    setSelectedMovie(null);

    try {
      const buildParams = (page) => {
        const p = {
          api_key:          API_KEY,
          language:         "ru-RU",
          sort_by:          "popularity.desc",
          "vote_count.gte": 100,
          page:             String(page),
        };
        if (genreId)   p.with_genres               = genreId;
        if (minRating) p["vote_average.gte"]        = String(minRating);
        if (year)      p["primary_release_date.gte"] = `${year}-01-01`;
        if (runtime)   p["with_runtime.gte"]        = String(runtime);
        if (actorId)   p.with_cast                  = String(actorId);
        return new URLSearchParams(p).toString();
      };

     
      let movies = [];

      const randomPage = Math.floor(Math.random() * 4) + 1;
      try {
        const data = await safeFetch(
          `${BASE_URL}/discover/movie?${buildParams(randomPage)}`,
          signal
        );
        movies = data.results || [];
      } catch (e) {
        if (e.name === "AbortError") return;
      }

      if (movies.length === 0) {
        const data = await safeFetch(
          `${BASE_URL}/discover/movie?${buildParams(1)}`,
          signal
        );
        movies = data.results || [];
      }

      if (movies.length === 0) {
        setError("Фильмы не найдены. Попробуйте изменить фильтры.");
        return;
      }

    
      const pick = movies[Math.floor(Math.random() * movies.length)];

     
      const [detail, credits] = await Promise.all([
        safeFetch(`${BASE_URL}/movie/${pick.id}?api_key=${API_KEY}&language=ru-RU`, signal),
        safeFetch(`${BASE_URL}/movie/${pick.id}/credits?api_key=${API_KEY}&language=ru-RU`, signal),
      ]);

      if (signal.aborted) return;

      const director = credits.crew?.find((p) => p.job === "Director")?.name || "—";
      const stars    = credits.cast?.slice(0, 4).map((a) => a.name) || [];

      setSelectedMovie({
        id:       detail.id,
        title:    detail.title    || "Без названия",
        overview: detail.overview || "",
        genre:    detail.genres?.map((g) => g.name).join(", ") || "—",
        rating:   detail.vote_average != null ? detail.vote_average.toFixed(1) : "—",
        poster:   detail.poster_path
                    ? `https://image.tmdb.org/t/p/w300${detail.poster_path}`
                    : null,
        year:     detail.release_date?.slice(0, 4) || "—",
        runtime:  detail.runtime || "—",
        director,
        star1: stars[0] || "—",
        star2: stars[1] || "—",
        star3: stars[2] || "—",
        star4: stars[3] || "—",
      });

    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("recommendMovie error:", e);
      setError("Ошибка при загрузке. Проверьте соединение.");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="panel">

        <label>Жанр:</label>
        <select value={genreId} onChange={(e) => setGenreId(e.target.value)}>
          <option value="">Все жанры</option>
          {GENRES.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <label>Минимальный рейтинг:</label>
        <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
          <option value={0}>Все</option>
          <option value={5}>5+</option>
          <option value={6}>6+</option>
          <option value={7}>7+</option>
          <option value={8}>8+</option>
          <option value={9}>9+</option>
        </select>

        <label>Год выпуска (после):</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Например: 2000"
        />

        <label>Минимальная длительность (мин):</label>
        <input
          type="number"
          value={runtime}
          onChange={(e) => setRuntime(e.target.value)}
          placeholder="Например: 120"
        />

        <label>Актёр:</label>
        <div className="actor-search">
          <div className="actor-input-wrap">
            <input
              type="text"
              value={actorQuery}
              onChange={(e) => searchActor(e.target.value)}
              placeholder="Например: Джеки Чан"
            />
            {actorId && (
              <button className="actor-clear" onClick={clearActor} aria-label="Очистить">
                ✕
              </button>
            )}
          </div>

          {actorSuggestions.length > 0 && (
            <ul className="actor-suggestions">
              {actorSuggestions.map((actor) => (
                <li key={actor.id} onClick={() => selectActor(actor)}>
                  {actor.profile_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w45${actor.profile_path}`}
                      alt={actor.name}
                    />
                  )}
                  <span>{actor.name}</span>
                </li>
              ))}
            </ul>
          )}

          {actorId && (
            <p className="actor-selected">✓ {actorName}</p>
          )}
        </div>

        <button className="btn1" onClick={recommendMovie} disabled={loading}>
          {loading ? "Ищем..." : "Найти фильм"}
        </button>
      </div>

      <div id="result">
        {error   && <p style={{ color: "#ff6b6b", fontSize: "14px" }}>{error}</p>}
        {loading && <p style={{ color: "#6b6a76", fontSize: "14px" }}>Загрузка...</p>}

        {selectedMovie && !loading && (
          <div className="movie-card">
            {selectedMovie.poster && (
              <img
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                className="poster"
              />
            )}
            <div className="movie-info">
              <h3>{selectedMovie.title}</h3>
              <p>{selectedMovie.overview || "Описание отсутствует."}</p>
              <p><strong>Жанр:</strong> {selectedMovie.genre}</p>
              <p><strong>Рейтинг TMDB:</strong> {selectedMovie.rating}</p>
              <p><strong>Режиссёр:</strong> {selectedMovie.director}</p>
              <p><strong>Актёры:</strong> {selectedMovie.star1}, {selectedMovie.star2}, {selectedMovie.star3}, {selectedMovie.star4}</p>
              <p><strong>Год выпуска:</strong> {selectedMovie.year}</p>
              <p><strong>Длительность:</strong> {selectedMovie.runtime} мин</p>
            </div>
          </div>
        )}

        {!selectedMovie && !loading && !error && (
          <p style={{ color: "#6b6a76", fontSize: "14px" }}>
            Выберите фильтры и нажмите «Найти фильм»
          </p>
        )}
      </div>
    </div>
  );
}

export default MovieRecommender;