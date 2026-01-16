import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable ({
  providedIn: 'root'
})

export class MainService {


  private baseUrl = 'https://api.themoviedb.org/3';
  constructor (private http: HttpClient){}

  getPopularData(page: number): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`)
  }
  getTopRatedData(page: number): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`)
  }



  getUpcomingData(page: number): Observable<any> {
    return this.http.get(`https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=${page}`)
  }

}
