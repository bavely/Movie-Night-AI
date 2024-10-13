import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavButtonComponent } from './component/common/nav-button/nav-button.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'movie-night';
}
