import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogMessageReactComponent } from '../dialog-message-react/dialog-message-react.component';

@Component({
  selector: 'app-mainpage-chat',
  templateUrl: './mainpage-chat.component.html',
  styleUrls: ['./mainpage-chat.component.scss']
})
export class MainpageChatComponent {
  @Output() openEvent = new EventEmitter<void>();

  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;
  hoverAddClientIcon: boolean = false;

  // *ngIf="hoveredThreadId === i"
  // hoveredThreadId: number | null = null;
  hoveredThreadId: boolean = true;

  constructor(public dialog: MatDialog) { }

  openThreads() {
    this.openEvent.emit();
  }

  addFilter(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.style.filter = 'brightness(100%)';
  }

  removeFilter(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.style.filter = 'brightness(0%)';
  }

  showEditMessageButton() {

  }

  // showReactMessageDialog() {
  //   const dialog = this.dialog.open(DialogMessageReactComponent);
  //   // dialog.componentInstance.user = new User(this.user.toJSON());
  //   // dialog.componentInstance.userID = this.userID;

  //   // dialog.afterClosed().subscribe(() => {
  //   //   this.getUser();
  //   // });
  // }

  // hideReactMessageDialog() {
  //   this.dialog.closeAll();
  // }
}