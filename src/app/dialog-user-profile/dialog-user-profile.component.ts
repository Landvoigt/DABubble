import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountServiceService } from '../account-service.service';
import { ChatServiceService } from '../chat-service.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { ChannelServiceService } from '../channel-service.service';
import { Thread } from 'src/models/thread.class';

@Component({
  selector: 'app-dialog-user-profile',
  templateUrl: './dialog-user-profile.component.html',
  styleUrls: ['./dialog-user-profile.component.scss']
})
export class DialogUserProfileComponent {
  firestore: Firestore = inject(Firestore);
  
  status: string = '';
  colorBlue: boolean = false;
  colorGreen: boolean = false;
  colorGray: boolean = false;

  constructor(public chatService: ChatServiceService,
    public dialogRef: MatDialogRef<DialogUserProfileComponent>,
    public accountService: AccountServiceService,
    public channelService: ChannelServiceService) {
    this.statusCheck();
  }


  /**
   * Subscribes to changes in the user status.
   */
  statusCheck() {
    this.accountService.userData$.subscribe((data) => {
      const user = data.find((element) => element.email === this.chatService.ownerData['ownerEmail']);
      if (user) {
        this.colorGreen = user.loggedIn && !user.isActive;
        this.colorBlue = user.loggedIn && user.isActive;
        this.colorGray = !user.loggedIn && !user.isActive;
        this.getStatusUser();
      }
    });
  }


  /**
   * Sets the right span for the current status.
   */
  getStatusUser() {
    if (this.colorGreen) {
      this.status = 'Online';
    } if (this.colorBlue) {
      this.status = 'Active';
    } if (this.colorGray) {
      this.status = 'Offline';
    }
  }


  /**
   * Extracts the user ID and get the needed user information to show in the dialog. 
   */
  async getUserInformation(thread: Thread) {
    let userID = thread.ownerID;
    const userDocRef = doc(this.firestore, 'users', userID);
    const user = await getDoc(userDocRef);
    const userData = user.data() as User;
    this.channelService.newDmPartner.next(userData);
    this.dialogRef.close();
  }
}