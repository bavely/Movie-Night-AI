import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'typing',
  standalone: true,
  templateUrl: './typing.component.html',
  styleUrls: ['./typing.component.css']
})
export class TypingComponent implements OnChanges {
  @Input() fullContent: string = '';
  @Input() speed: number = 20;
  @Input() cursorColor: string = 'white';

  displayedContent: string = '';
  private currentIndex: number = 0;
  private typingTimer: any;
  showCursor: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fullContent']) {
      this.resetTyping();
      this.startTyping();
    }
  }

  startTyping(): void {
    if (this.currentIndex < this.fullContent.length) {
      this.typingTimer = setTimeout(() => {
        this.displayedContent += this.fullContent.charAt(this.currentIndex);
        this.currentIndex++;
        this.startTyping();
      }, this.speed);
    } else {
      this.showCursor = false;
    }
  }

  resetTyping(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    this.displayedContent = '';
    this.currentIndex = 0;
    this.showCursor = true;
  }
}
