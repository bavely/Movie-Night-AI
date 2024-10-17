import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.css'
})
export class VideosComponent {

  @Input() videos: any[] = []
  @Input() open : boolean = false
  @Output() closeEvent = new EventEmitter()

  close() {
    this.open = false
    this.closeEvent.emit()
  }
}
