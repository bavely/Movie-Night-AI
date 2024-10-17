import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cast',
  standalone: true,
  imports: [],
  templateUrl: './cast.component.html',
  styleUrl: './cast.component.css'
})
export class CastComponent {

@Input() cast: any[] = []
@Input() open : boolean = false
@Output() closeEvent = new EventEmitter()

  constructor(  ) { }


  close() {
    this.open = false
    this.closeEvent.emit()
  }

}
