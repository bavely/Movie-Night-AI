import { Component, NgModule } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DetailsService } from './details.service';
import { TabViewModule } from 'primeng/tabview';
import { format } from 'date-fns';
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [ TabViewModule ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})



export class DetailsComponent {
  loading : boolean = false;
  movieDetails: any;
  postarBaseUrl = 'https://image.tmdb.org/t/p/w500'
  videoBaseUrl = 'https://www.themoviedb.org/video/play?key='
  constructor(private route: ActivatedRoute, private detailsService: DetailsService) {}

  ngOnInit() {
    this.loading = true;

    this.route.paramMap.subscribe(params => {
      const id = params.get('id'); // Access a specific param
      console.log(id);
      forkJoin([
        this.detailsService.getMovieDetails(id as string),
        this.detailsService.getSimilarMovies(id as string),
        this.detailsService.getVideos(id as string),
        this.detailsService.getReviews(id as string),
        this.detailsService.getMovieProviders(id as string),
        this.detailsService.getMovieCredits(id as string),
        this.detailsService.getMovieImages(id as string)
      ]).subscribe({
        next: (data) => {
          this.loading = false;
          console.log(data);
          this.movieDetails = {
            title : data[0].original_title || "",
            overview : data[0].overview || "",
            release_date : format(data[0].release_date , 'PP')|| "",
            vote_count : data[0].vote_count || "",
            vote_average : data[0].vote_average / 2 || "",
            poster_path : this.postarBaseUrl + data[0].poster_path || "",
            backdrop_path : this.postarBaseUrl + data[0].backdrop_path || "",
            id : data[0].id || "",
            genres : data[0].genres.map((genre : any) => genre.name) ||[],
            length : data[0].runtime || "",
            language : data[0].original_language || "",
            similar : data[1].results || [],
            videos : data[2].results.filter((video : any) => video.type === "Trailer" && video.site === "YouTube")[0] || {
              key : "",
              type : "Teaser"},
            reviews : data[3].results || [],
            providers : data[4].results.US || [],
            cast : data[5].cast.sort((a: any, b: any) => a.popularity - b.popularity).slice(0, 5) || [],
            images : [...data[6].backdrops, ...data[6].posters, ...data[6].logos]  ,

          };

          console.log(this.movieDetails);
        }
      })
    });
  }
}

