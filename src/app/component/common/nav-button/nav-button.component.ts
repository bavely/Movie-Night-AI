import { Component, OnInit  } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
@Component({
    selector: 'nav-button',
    templateUrl: 'nav-button.component.html',
    styleUrl: 'nav-button.component.css',
    standalone: true,
    imports: [SpeedDialModule, ToastModule],
    providers: [MessageService]
})
export class NavButtonComponent implements OnInit {
  items: MenuItem[] | undefined;

  constructor(private messageService: MessageService, private router: Router) {}

  ngOnInit() {
      this.items = [

          {

              routerLink: ['/mood'],
              type: 'mood',

          },
          {
              routerLink: ['/'],
              type: 'home',
          },
          {
              routerLink: ['/advanced'],
              type: 'search',
          }
      ];
  }

  onClick(targetElement: string): void {
  switch (targetElement) {
  case 'mood': {
    this.router.navigate(['/mood']);
    break;
  }
  case 'home': {
    this.router.navigate(['/']);
    break;
  }
  case 'search': {
    this.router.navigate(['/advanced']);
    break;
  }
  }
}

}
