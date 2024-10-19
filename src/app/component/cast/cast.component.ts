import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SafeurlPipe } from "../common/safeurl.pipe";

@Component({
  selector: 'app-cast',
  standalone: true,
  imports: [SafeurlPipe],
  templateUrl: './cast.component.html',
  styleUrl: './cast.component.css'
})
export class CastComponent {

  castDetails: any[] = []
open : boolean = false
imagBaseUrl = 'https://image.tmdb.org/t/p/original/'

  constructor(  ) { }


  close() {
    this.open = false
   this.castDetails = []
  }

  castGetter(cast : any[]) {
    this.castDetails = cast
    this.open = true
  }

}
