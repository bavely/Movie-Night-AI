import { Injectable } from "@angular/core";
import { type Image } from "./mood.interface";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable ({
  providedIn: 'root'
})

export class MoodService {
   images : Image[] = [
    {
      image: "/assets/images/1.jpg",
      name: "Western",
      id: 37,
    },
    {
      image: "/assets/images/2.jpg",
      name: "War",
      id: 10752,
    },
    {
      image: "/assets/images/3.jpg",
      name: "Triller",
      id: 53,
    },
    {
      image: "/assets/images/4.jpg",
      name: "Sport",
      id: 10770,
    },
    {
      image: "/assets/images/5.jpg",
      name: "Scifi",
      id: 878,
    },
    {
      image: "/assets/images/6.jpg",
      name: "Romance",
      id: 10749,
    },
    {
      image: "/assets/images/7.jpg",
      name: "Mystery",
      id: 9648,
    },
    {
      image: "/assets/images/8.jpg",
      name: "Musical",
      id: 10402,
    },
    {
      image: "/assets/images/9.jpg",
      name: "Horror",
      id: 27,
    },
    {
      image: "/assets/images/10.jpg",
      name: "History",
      id: 36,
    },
    {
      image: "/assets/images/11.jpg",
      name: "Fantacy",
      id: 14,
    },
    {
      image: "/assets/images/12.jpg",
      name: "Family",
      id: 10751,
    },
    {
      image: "/assets/images/13.jpg",
      name: "Drama",
      id: 18,
    },
    {
      image: "/assets/images/14.jpg",
      name: "Documentary",
      id: 99,
    },
    {
      image: "/assets/images/15.jpg",
      name: "Crime",
      id: 80,
    },
    {
      image: "/assets/images/16.jpg",
      name: "Comedy",
      id: 35,
    },
    {
      image: "/assets/images/17.jpg",
      name: "Biography",
      id: 10771,
    },
    {
      image: "/assets/images/18.jpg",
      name: "Animation",
      id: 16,
    },
    {
      image: "/assets/images/19.jpg",
      name: "Adventure",
      id: 12,
    },
    {
      image: "/assets/images/20.jpg",
      name: "Action",
      id: 28,
    },
  ];

  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey =import.meta.env['NG_APP_TMDB_API_KEY']
  constructor (private http: HttpClient){}

  getImages( ) : Image[] {
    return this.images;
  }

  getData(page: number, grenr: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.baseUrl}/discover/movie?include_adult=false&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc&with_genres=${grenr}&with_original_language=en`, { headers })
  }

}
