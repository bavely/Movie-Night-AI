import { Component, NgModule } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DetailsService } from './details.service';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule } from '@angular/forms';
import { RatingModule  } from 'primeng/rating';
import {DecimalPipe} from '@angular/common';
import { CastComponent } from '../../cast/cast.component';
import { VideosComponent } from '../../videos/videos.component';
import { ListComponent } from '../list/list.component';
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [ TabViewModule, RatingModule, FormsModule, DecimalPipe, CastComponent, VideosComponent, ListComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})



export class DetailsComponent {
  castOpen : boolean = false;
  videoOpen : boolean = false;
  loading : boolean = false;
  movieDetails: any;
  postarBaseUrl = 'https://image.tmdb.org/t/p/original'
  videoBaseUrlp1 = "https://www.youtube.com/embed"
  videoBaseUrlp2 = "?rel=0&autoplay=1&mute=1"
  // 'https://www.themoviedb.org/video/play?key='
  constructor(private route: ActivatedRoute, private detailsService: DetailsService) {}

  convertHoursToTime(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    return `${wholeHours}h ${minutes.toString().padStart(2, '0')}min`;
  }

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
        this.detailsService.getMovieImages(id as string),
        this.detailsService.getCertByRelease(id as string)
      ]).subscribe({
        next: (data) => {
          this.loading = false;
          console.log(data);
          this.movieDetails = {
            title : data[0].original_title || "",
            overview : data[0].overview || "",
            release_date : new Date(data[0].release_date).getFullYear() || "",
            vote_count : data[0].vote_count || "",
            vote_average : data[0].vote_average / 2 || "",
            poster_path : this.postarBaseUrl + data[0].poster_path || "",
            backdrop_path : this.postarBaseUrl + data[0].backdrop_path || "",
            id : data[0].id || "",
            genres : data[0].genres.map((genre : any) => genre.name) ||[],
            length :this.convertHoursToTime(data[0].runtime/60) || "",
            language : data[0].original_language || "",
            similar : data[1].results || [],
            videos : data[2].results.filter((video : any) => ["Trailer", "Teaser", "Clip", "Featurette"].includes(video.type)   && video.site === "YouTube")[0] ,
            reviews : data[3].results || [],
            providers : data[4].results.US || [],
            cast : data[5].cast.sort((a: any, b: any) => a.order
            - b.order
          ).map((actor: any) => actor.name) || [],
            images : [...data[6].backdrops, ...data[6].posters, ...data[6].logos]  ,
            certification : data[7].results.find((cert: any) => cert.iso_3166_1 === "US") ? data[7].results.find((cert: any) => cert.iso_3166_1 === "US").release_dates[0].certification   : ""
          };

          console.log(this.movieDetails, "movieDetails");
        }
      })
    });
  }





  showMoreCast() {
    this.castOpen = true
  }
  watchTrailer() {
    this.videoOpen = true
  }
}

