import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const tmdbApiKey = import.meta.env['NG_APP_TMDB_API_KEY'];
  
  // Only add authorization header for TMDB API requests
  // Use startsWith with https:// to prevent URL manipulation
  if (req.url.startsWith('https://api.themoviedb.org/')) {
    const modifiedReq = req.clone({
      setHeaders: {
        'Authorization': tmdbApiKey,
        'Content-Type': 'application/json'
      }
    });
    return next(modifiedReq);
  }
  
  return next(req);
};
