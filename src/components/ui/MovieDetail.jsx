import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './MovieDetail.css';

const API_KEY = 'c858c6eaab0adf99aa05c18c3062ab95';
const BASE    = 'https://api.themoviedb.org/3';

export default function MovieDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [movie, setMovie]     = useState(null);
  const [credits, setCredits] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mRes, cRes, vRes] = await Promise.all([
          fetch(`${BASE}/movie/${id}?api_key=${API_KEY}&language=ru-RU`),
          fetch(`${BASE}/movie/${id}/credits?api_key=${API_KEY}&language=ru-RU`),
          fetch(`${BASE}/movie/${id}/videos?api_key=${API_KEY}&language=ru-RU`),
        ]);
        const [m, c, v] = await Promise.all([mRes.json(), cRes.json(), vRes.json()]);

        setMovie(m);
        setCredits(c);

        let vid = v.results?.find(x => x.type === 'Trailer' && x.site === 'YouTube');
        if (!vid) {
          const vEn  = await fetch(`${BASE}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`);
          const vEnD = await vEn.json();
          vid = vEnD.results?.find(x => x.type === 'Trailer' && x.site === 'YouTube');
        }
        setTrailer(vid || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="detail-loading">
      <span className="detail-spinner" />
    </div>
  );

  if (!movie) return (
    <div className="detail-loading">
      <p>Фильм не найден</p>
    </div>
  );

  const director = credits?.crew?.find(p => p.job === 'Director')?.name || '—';
  const cast      = credits?.cast?.slice(0, 6) || [];
  const backdrop  = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
  const poster    = movie.poster_path
    ? `https://image.tmdb.org/t/p/w400${movie.poster_path}`
    : null;

  return (
    <div className="detail-page">

      {backdrop && (
        <div className="detail-backdrop">
          <img src={backdrop} alt="" />
          <div className="detail-backdrop-overlay" />
        </div>
      )}

      <div className="detail-inner">

      
        <button
          className="detail-back"
          onClick={() => navigate(location.state?.from || '/')}
        >
          ← Назад
        </button>

        <div className="detail-body">
          {poster && (
            <div className="detail-poster-wrap">
              <img src={poster} alt={movie.title} className="detail-poster" />
            </div>
          )}

          <div className="detail-info">
            <h1 className="detail-title">{movie.title}</h1>

            

            <div className="detail-meta">
              {movie.release_date && (
                <span>{movie.release_date.slice(0, 4)}</span>
              )}
              {movie.runtime && (
                <span>{movie.runtime} мин</span>
              )}
              {movie.vote_average && (
                <span className="detail-rating">★ {movie.vote_average.toFixed(1)}</span>
              )}
            </div>

            <div className="detail-genres">
              {movie.genres?.map(g => (
                <span key={g.id} className="detail-genre-tag">{g.name}</span>
              ))}
            </div>

            <p className="detail-overview">
              {movie.overview || 'Описание отсутствует.'}
            </p>

            <div className="detail-crew">
              <div className="detail-crew-item">
                <span className="detail-crew-label">Режиссёр</span>
                <span className="detail-crew-value">{director}</span>
              </div>
              {movie.production_countries?.[0] && (
                <div className="detail-crew-item">
                  <span className="detail-crew-label">Страна</span>
                  <span className="detail-crew-value">
                    {movie.production_countries[0].name}
                  </span>
                </div>
              )}
            </div>
              <details>
                <summary>Трейлер</summary>
            {trailer && (
              <div className="detail-trailer">
                <div className="detail-trailer-frame">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                    title="Trailer"
                    allow="encrypted-media"
                    allowFullScreen
                  />
                </div>
              </div>
            
            )}
            </details >

            {cast.length > 0 && (
              <div className="detail-cast">
                <p className="detail-cast-label">В ролях</p>
                <div className="detail-cast-list">
                  {cast.map(actor => (
                    <div key={actor.id} className="detail-cast-item">
                      {actor.profile_path
                        ? <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                          />
                        : <div className="detail-cast-no-photo">?</div>
                      }
                      <span>{actor.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}