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
  varray = (arr : any) => {
let a = 8 - (arr.length % 8)
    return new Array(a + 6);
  };

}
