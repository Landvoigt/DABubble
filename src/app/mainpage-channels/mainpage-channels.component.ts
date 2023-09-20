import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { DialogAddChannelComponent } from '../dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { Firestore, Unsubscribe, addDoc, collection, doc, getDocs, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { ChannelServiceService } from '../channel-service.service';
import { DirectMessage } from 'src/models/direct-message.class';
import { User } from 'src/models/user.class';
import { Channel } from 'src/models/channel.class';

@Component({
  selector: 'app-mainpage-channels',
  templateUrl: './mainpage-channels.component.html',
  styleUrls: ['./mainpage-channels.component.scss']
})
export class MainpageChannelsComponent {
  @Output() closeEvent = new EventEmitter<void>();
  firestore: Firestore = inject(Firestore);
  usersCollection = collection(this.firestore, 'users');
  channelsCollection = collection(this.firestore, 'channels');
  directMessagesCollection = collection(this.firestore, 'direct-messages');
  directMessage = new DirectMessage();
  allChannels = [];
  allUsers = [];
  isDropdownOpenChannel: boolean = true;
  isDropdownOpenDm: boolean = true;
  currentSelectedUser_ID: string;

  unsubChannels: Unsubscribe;
  unsubUsers: Unsubscribe;

  constructor(
    public accountService: AccountServiceService,
    public channelService: ChannelServiceService,
    public dialog: MatDialog) {

    this.getAllChannels();
    this.getAllUsers();
  }

  getAllChannels() {
    this.unsubChannels = onSnapshot(this.channelsCollection, (channel) => {
      this.allChannels = [];
      channel.forEach(element => {
        let channelData = element.data() as Channel;
        if (channelData.members.includes(this.accountService.getLoggedInUser().id))
          this.allChannels.push(channelData);
      });
    });
  }

  getAllUsers() {
    this.unsubUsers = onSnapshot(this.usersCollection, (user) => {
      this.allUsers = [];
      user.forEach(element => {
        let userData = element.data() as User;
        if (!(userData.id === this.accountService.getLoggedInUser().id))
          this.allUsers.push(element.data());
      });
    });
  }

  openAddChannel() {
    this.dialog.open(DialogAddChannelComponent);
  }

  openChannelArea(channel: Channel) {
    this.channelService.inDirectMessage = false;
    this.channelService.currentChannel_ID = channel.id;
    this.channelService.checkChannelOwner(channel);
  }

  async openDirectMessage(user: User) {
    this.closeThreads();
    await this.checkDmChannelExistence(user.id);
    this.setupDmView(user, false);
  }

  openSelfMessage() {
    this.closeThreads();
    const selfUser = this.accountService.getLoggedInUser();
    this.setupDmView(selfUser, true);
  }

  private setupDmView(user: User, isOwnDm: boolean) {
    this.channelService.savedDmPartner = user;
    this.currentSelectedUser_ID = user.id;
    this.channelService.noCurrentChannel = true;
    this.channelService.isOwnDmChannel = isOwnDm;
    this.channelService.inDirectMessage = true;
  }


  closeThreads() {
    this.closeEvent.emit();
  }



  channelSectionToggle() {
    this.isDropdownOpenChannel = !this.isDropdownOpenChannel
  }

  dMSectionToggle() {
    this.isDropdownOpenDm = !this.isDropdownOpenDm
  }


  async checkDmChannelExistence(userId: string) {
    let dm_ChannelExists = false;
    const loggedInUserId = this.accountService.getLoggedInUser().id;
    const querySnapshot = await getDocs(this.directMessagesCollection);

    for (const messageDoc of querySnapshot.docs) {
      const messageData = messageDoc.data() as DirectMessage;
      if (messageData.members.includes(loggedInUserId) && messageData.members.includes(userId)) {
        dm_ChannelExists = true;
        this.channelService.currentDmChannel_ID = messageData.id;
        break;
      }
    }

    if (!dm_ChannelExists) {
      await this.getMembersInformation(userId);
      await this.createNewDmChannel();
    }
  }

  async getMembersInformation(userId: string) {
    this.directMessage.members = [];
    this.directMessage.members.push(this.accountService.getLoggedInUser().id);
    this.directMessage.members.push(userId);
    this.directMessage.date = new Date();
  }

  async createNewDmChannel() {
    const newDm = await addDoc(this.directMessagesCollection, this.directMessage.toJSON());
    const newDmDoc = doc(this.directMessagesCollection, newDm.id);
    await updateDoc(newDmDoc, { id: newDm.id });
    this.channelService.currentDmChannel_ID = newDm.id;
  }

  ngOnDestroy() {
    this.unsubChannels();
    this.unsubUsers();
  }
}