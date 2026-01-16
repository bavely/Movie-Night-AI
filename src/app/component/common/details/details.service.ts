import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class DetailsService {
  private baseUrl = 'https://api.themoviedb.org/3'
  public jwApiKey = import.meta.env['NG_APP_JUST_WATCH']
  constructor(private http: HttpClient) {
  }
  getMovieDetails(id: string): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}?language=en-US`)
  }

  getSimilarMovies(id: string): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`)
  }

  getVideos(id: string): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`)
  }

  getReviews(id: string): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/reviews?language=en-US&page=1`)
  }

  getMovieProviders(id: string): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers?language=en-US`)
  }

  getMovieCredits(id: string): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`)
  }

  getMovieImages(id: string): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/images?language=en-US`)
  }

  getCertByRelease(id: string): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/release_dates?language=en-US`)
  }



  getPricesToWatch(title: string, id: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    }
    return this.http.get(`https://api.watchmode.com/v1/search/?apiKey=${this.jwApiKey}&search_field=name&search_value=${title}`, { headers }).pipe(
      switchMap((data: any) => {
        const thismovie = data.title_results.filter((movie: any) => movie.tmdb_id === Number(id))
        if (thismovie) {
          return this.http.get(`https://api.watchmode.com/v1/title/${thismovie[0]['id']}/sources/?apiKey=${this.jwApiKey}`, { headers })
        } else {
          return of([])
        }
      })
    )
  }


}
