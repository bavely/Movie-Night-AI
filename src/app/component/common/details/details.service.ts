import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable ({
  providedIn: 'root'
})

export class DetailsService {
  private baseUrl = 'https://api.themoviedb.org/3'
  private apiKey = import.meta.env['NG_APP_TMDB_API_KEY']

  constructor (private http: HttpClient){
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
}
