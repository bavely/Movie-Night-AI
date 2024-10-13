import { Component } from '@angular/core';
import { gsap } from "gsap";
import { Router } from '@angular/router';
@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css'
})
export class SearchbarComponent {
  isOpen = false;

  constructor(private router: Router) {}

  navigateToMood() {
    this.router.navigate(['/mood']);
  }

  navigateToAdvanced() {
    this.router.navigate(['/advanced']);
  }

  move() {

    gsap.to('#element', {
      width: this.isOpen ? '600px' : '50px',
      borderRadius: '50%',
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    });
  }

  toggle() {
    console.log('toggling');
    this.isOpen = !this.isOpen;
    this.move();
  }

}
