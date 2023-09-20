import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountServiceService } from '../account-service.service';
import { ChatServiceService } from '../chat-service.service';


@Component({
  selector: 'app-dialog-user-profile',
  templateUrl: './dialog-user-profile.component.html',
  styleUrls: ['./dialog-user-profile.component.scss']
})
export class DialogUserProfileComponent {
  @Output() closeEvent = new EventEmitter<void>();

  constructor(public chatService: ChatServiceService,
    public dialogRef: MatDialogRef<DialogUserProfileComponent>,
    public accountService: AccountServiceService) { }

  closeThreads(): void {
    this.dialogRef.close();
  }

}
