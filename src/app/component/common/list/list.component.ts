import { Component, Input } from '@angular/core';
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
  varray = new Array(18);
  @Input() list: any[] = [];
  @Input() loading: boolean = false;
  imagBaseUrl = 'https://image.tmdb.org/t/p/w500';

}
