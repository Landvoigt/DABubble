import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-mainpage-threads',
  templateUrl: './mainpage-threads.component.html',
  styleUrls: ['./mainpage-threads.component.scss']
})
export class MainpageThreadsComponent {
  @Output() closeEvent = new EventEmitter<void>();
  
  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;

  closeThreads() {
    this.closeEvent.emit();
  }
}