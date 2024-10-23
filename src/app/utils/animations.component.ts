import { trigger, transition, style, animate, query } from '@angular/animations'



export const fadeAnimation = () =>  trigger('fadeAnimation',[
  transition(':enter', [
      style({ opacity: 0  }), animate('2000ms', style({ opacity: 1 }))]
    )
  ]);

  export const slideAnimation = () =>  trigger('slideAnimation',[
    transition(':enter', [
      style({transform: 'translateX(-7%)'}), animate('3000ms ease-in-out', style({transform: 'translateX(0)'}))]
      )
  ])
