import { Component, EventEmitter, Input , Output, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ListComponent } from '../common/list/list.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [ListComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {

  @Input() category: string = "";
  @Input() movies: any[] = [];
  @Input() loading: boolean = false;

  @Output() goBackEvent = new EventEmitter();

  constructor( private location: Location) { }

  ngOnInit(): void {
    this.location.onUrlChange((url) => {

      if (!url.includes(this.category)) {
        this.goBackEvent.emit();

      }
    })
  }


}
