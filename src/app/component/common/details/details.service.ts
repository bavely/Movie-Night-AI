import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class DetailsService {
  private baseUrl = 'https://api.themoviedb.org/3'
  private apiKey = import.meta.env['NG_APP_TMDB_API_KEY']
  public jwApiKey = import.meta.env['NG_APP_JUST_WATCH']
  constructor(private http: HttpClient) {
  }
  getMovieDetails(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    })
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, { headers })
  }

  getSimilarMovies(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    })
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`, { headers })
  }

  getVideos(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    })
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, { headers })
  }

  getReviews(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    })
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/reviews?language=en-US&page=1`, { headers })
  }

  getMovieProviders(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    })
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers?language=en-US`, { headers })
  }

  getMovieCredits(id: string): Observable<any> {
    console.log(this.apiKey)
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    })

    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`, { headers })
  }

  getMovieImages(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    })
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/images?language=en-US`, { headers })
  }

  getCertByRelease(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    })
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}/release_dates?language=en-US`, { headers })
  }



  getPricesToWatch(title: string, id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    console.log(this.jwApiKey)
    return this.http.get(`https://api.watchmode.com/v1/search/?apiKey=${this.jwApiKey}&search_field=name&search_value=${title}`, { headers }).pipe(
      switchMap((data: any) => {
        const thismovie = data.title_results.filter((movie: any) => movie.tmdb_id === Number(id))
        console.log(thismovie)
        if (thismovie) {
          return this.http.get(`https://api.watchmode.com/v1/title/${thismovie[0]['id']}/sources/?apiKey=${this.jwApiKey}`, { headers })
        } else {
          return of([])
        }
      })
    )
  }


}
