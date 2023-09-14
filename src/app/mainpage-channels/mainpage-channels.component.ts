import { Component, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { DialogAddChannelComponent } from '../dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { Firestore, Unsubscribe, collection, onSnapshot } from '@angular/fire/firestore';
import { ChannelServiceService } from '../channel-service.service';

@Component({
  selector: 'app-mainpage-channels',
  templateUrl: './mainpage-channels.component.html',
  styleUrls: ['./mainpage-channels.component.scss']
})
export class MainpageChannelsComponent {
  firestore: Firestore = inject(Firestore);
  allChannels = [];
  allUsers = [];  // all Friends later
  isDropdownOpenChannel:boolean = true;
  isDropdownOpenDm:boolean = true;

  unsubChannels: Unsubscribe;
  unsubUsers: Unsubscribe;

  constructor(public accountService: AccountServiceService, private channelService: ChannelServiceService, public dialog: MatDialog) {
    this.getAllChannels();
    this.getAllUsers();
  }

  getAllChannels() {
    const channelCollection = collection(this.firestore, 'channels');
    this.unsubChannels = onSnapshot(channelCollection, (channel) => {
      this.allChannels = [];
      channel.forEach(element => {
        this.allChannels.push(element.data());
      });
    });
  }

  getAllUsers() {
    const userCollection = collection(this.firestore, 'users');
    this.unsubUsers = onSnapshot(userCollection, (user) => {
      this.allUsers = [];
      user.forEach(element => {
        if (!(element.data()['id'] === this.accountService.getLoggedInUser().id)) {
          this.allUsers.push(element.data());
          // console.log(this.allUsers);
        }
      });
    });
  }

  openAddChannel() {
    this.dialog.open(DialogAddChannelComponent);
  }

  openChannelArea(_id: string) {
    this.channelService.currentChannel_ID = _id;
  }

  ngOnDestroy() {
    this.unsubChannels();
    this.unsubUsers();
  }

channelSectionToggle() {
  this.isDropdownOpenChannel = !this.isDropdownOpenChannel
}

dMSectionToggle() {
  this.isDropdownOpenDm = !this.isDropdownOpenDm
}



}