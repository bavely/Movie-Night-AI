import { Component, EventEmitter, Input , Output } from '@angular/core';
import { ListComponent } from '../common/list/list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [ListComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {

  @Input() category: string = "";
  @Input() movies: any[] = [];
  @Input() loading: boolean = false;

  @Output() goBackEvent = new EventEmitter();

  constructor(private router: Router) { }

  goBack() {
    this.goBackEvent.emit();


  }

}
