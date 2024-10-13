import { Component, Input } from '@angular/core';
import { MoviecontainerComponent } from '../moviecontainer/moviecontainer.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MoviecontainerComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  varray = new Array(9);
  @Input() list: any[] = [];
  @Input() loading: boolean = false;
  imagBaseUrl = 'https://image.tmdb.org/t/p/w500';

}
