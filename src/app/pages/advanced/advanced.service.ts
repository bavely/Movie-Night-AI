import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable ({
  providedIn: 'root'
})

export class AdvancedService {


  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey = import.meta.env['NG_APP_TMDB_API_KEY'];
  constructor (private http: HttpClient){}

  getData(page: number, keyword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.baseUrl}/search/movie?query=${keyword}&include_adult=true&language=en-US&page=${page}`, { headers })
  }

}
