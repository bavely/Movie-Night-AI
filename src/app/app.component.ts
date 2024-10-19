import { Component ,OnInit, Renderer2} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavButtonComponent } from './component/common/nav-button/nav-button.component';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit{
  title = 'movie-night';
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.lazyLoadBackground();
  }

  lazyLoadBackground() {
    const body = document.querySelector('body');

    const image = new Image();
    image.src = './assets/images/3d-grunge-room-interior-with-spotlight-smoky-atmosphere-background.jpg';
    image.onload = () => {
      this.renderer.setStyle(body, 'background', `linear-gradient(
        rgba(0, 0, 0, 0.4),
        rgba(0, 0, 0, 0.4)
      ), url('./assets/images/3d-grunge-room-interior-with-spotlight-smoky-atmosphere-background.jpg') no-repeat center center fixed`);
    };
  }
}





