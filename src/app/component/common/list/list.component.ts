import { Component, Input, OnInit } from '@angular/core';
import { MoviecontainerComponent } from '../moviecontainer/moviecontainer.component';
import { fadeAnimation } from '../../../utils/animations.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MoviecontainerComponent],
  animations: [fadeAnimation()],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {

  @Input() list: any[] = [];
  @Input() loading: boolean = false;
  imagBaseUrl = 'https://image.tmdb.org/t/p/w500';
  screenheight: number = 0;
  varray = (arr : any) => {
let a = 8 - (arr.length % 8)
    return new Array(a + 6);
  };

  // find the hight of the entire screen
  getScreenHeight(): number {
    if (typeof window === 'undefined') {
      return 0; // Handle server-side rendering or environments without a window object
    }
    console.log(window.innerHeight);
    return window.innerHeight;
  }



}
