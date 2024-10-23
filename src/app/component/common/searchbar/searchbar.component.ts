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

  navigateToMia() {
    this.router.navigate(['/mia']);
  }

  move() {

    let mm = gsap.matchMedia(),
  breakPoint = 800;

mm.add(
  {
    // set up any number of arbitrarily-named conditions. The function below will be called when ANY of them match.
    isDesktop: `(min-width: ${breakPoint}px)`,
    isMobile: `(max-width: ${breakPoint - 1}px)`,
  },
  (context) => {
    // context.conditions has a boolean property for each condition defined above indicating if it's matched or not.


      gsap.to('#element', {

      width: this.isOpen ? (context?.conditions!['isDesktop'] ? '600px' : '300px') : '50px',
      borderRadius: '50%',
      duration: 1,
      ease: 'elastic.out(1, 0.3)'
    });

    return () => {
      // optionally return a cleanup function that will be called when none of the conditions match anymore (after having matched)
      // it'll automatically call context.revert() - do NOT do that here . Only put custom cleanup code here.
    };
  }
);

// let mm = gsap.matchMedia();
//     mm.add("(max-width: 600px)", () => {
//       gsap.to('#element', {
//         height: this.isOpen ? 'fit-content' : '50px',
//         width: this.isOpen ? '300px' : '50px',
//         borderRadius: '50%',
//         duration: 1,
//         ease: 'elastic.out(1, 0.3)'
//       });
//     });
//     gsap.to('#element', {

//       width: this.isOpen ? '600px' : '50px',
//       borderRadius: '50%',
//       duration: 1,
//       ease: 'elastic.out(1, 0.3)'
//     });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.move();
  }

}
