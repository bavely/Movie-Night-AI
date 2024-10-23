import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { Router } from '@angular/router';
import { fadeAnimation } from '../../../utils/animations.component';

@Component({
  selector: 'app-moviecontainer',
  standalone: true,
  imports: [FormsModule, RatingModule],
  animations: [fadeAnimation()],
  templateUrl: './moviecontainer.component.html',
  styleUrl: './moviecontainer.component.css'
})
export class MoviecontainerComponent {

  @Input() movie: any = {}

   imagBaseUrl= 'https://image.tmdb.org/t/p/original'
   postarBaseUrl = 'https://image.tmdb.org/t/p/w500'

  isImageLoaded = false;

  onImageLoad() {
    this.isImageLoaded = true;
  }

  constructor( private router: Router) {


   }

 get getRating() {
   return this.movie.vote_average/2
 }

 goToMovie(movie: any) {
  console.log(movie)
  this.router.navigate(['/details', movie.id])

 }
}
