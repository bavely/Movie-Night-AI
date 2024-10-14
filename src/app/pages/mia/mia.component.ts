import { Component } from '@angular/core';
import {MiaService} from "./mia.service";
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-mia',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './mia.component.html',
  styleUrl: './mia.component.css'
})
export class MiaComponent {

  constructor(public mianservice: MiaService) {

   }

   ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

   }

}
