import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable ({
  providedIn: 'root'
})

export class MainService {


  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey = import.meta.env['NG_APP_TMDB_API_KEY'];
  constructor (private http: HttpClient){}

  getPopularData(page: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    });

    return this.http.get(`https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`, { headers })
  }
  getTopRatedData(page: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    });

    return this.http.get(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`, { headers })
  }



  getUpcomingData(page: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    });

    return this.http.get(`https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}`, { headers })
  }

}
