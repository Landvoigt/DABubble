import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.scss']
})
export class ThreadsComponent {
  @Output() closeEvent = new EventEmitter<void>();
  
  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;

  closeThreads() {
    this.closeEvent.emit();
  }
}