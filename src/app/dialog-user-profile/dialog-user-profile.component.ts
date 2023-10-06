import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountServiceService } from '../account-service.service';
import { ChatServiceService } from '../chat-service.service';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { ChannelServiceService } from '../channel-service.service';
import { Thread } from 'src/models/thread.class';

@Component({
  selector: 'app-dialog-user-profile',
  templateUrl: './dialog-user-profile.component.html',
  styleUrls: ['./dialog-user-profile.component.scss']
})
export class DialogUserProfileComponent {
  @Output() closeEvent = new EventEmitter<void>();
  status = '';
  user = new User();
  userEmail: string;
  userDataJson: any = {};

  constructor(public chatService: ChatServiceService,
    public dialogRef: MatDialogRef<DialogUserProfileComponent>,
    public accountService: AccountServiceService,
    public firestore: Firestore,
    public channelService: ChannelServiceService) {
    this.getUserData();
  }

  getStatusUser() {
    if (this.userDataJson.loggedIn) {
      this.status = 'Online';
    } if (this.userDataJson.isActive) {
      this.status = 'Active';
    } if (!this.userDataJson.loggedIn && !this.userDataJson.isActive) {
      this.status = 'Offline';
    }
  }


  // getStatusColor(): string {
  //   switch (this.status) {
  //     case 'Online':
  //       return '#92C83E';
  //     case 'Active':
  //       return '#444DF2';
  //     case 'Offline':
  //       return '#686868';
  //     default:
  //       return 'black';
  //   }
  // }


  openDirectMessage(thread: Thread) {
    this.user.id = thread.id;
    this.user.name = thread.ownerName;
    this.user.avatarSrc = thread.ownerAvatarSrc;
    this.accountService.triggerOpenDirectMessage(this.user);
    this.dialogRef.close();
  }


  // closeThreads(): void {
  //   this.dialogRef.close();
  // }


  async getUserData() {
    this.userDataJson = {};
    const currentUserEmail = this.chatService.ownerData.ownerEmail;
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as User;
      if (userData.email === currentUserEmail) {
        this.userDataJson.loggedIn = userData.loggedIn;
        this.userDataJson.isActive = userData.isActive;
      }
    });

    this.getStatusUser();
  }
}
