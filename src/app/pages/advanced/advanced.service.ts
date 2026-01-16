import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable ({
  providedIn: 'root'
})

export class AdvancedService {


  private baseUrl = 'https://api.themoviedb.org/3';
  constructor (private http: HttpClient){}

  getData(page: number, keyword: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/movie?query=${keyword}&include_adult=false&language=en-US&page=${page}`)
  }

}
