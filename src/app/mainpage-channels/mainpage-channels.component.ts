import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { DialogAddChannelComponent } from '../dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { Firestore, Unsubscribe, addDoc, collection, doc, getDocs, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { ChannelServiceService } from '../channel-service.service';
import { DirectMessage } from 'src/models/direct-message.class';
import { User } from 'src/models/user.class';
import { Channel } from 'src/models/channel.class';
import { DialogUserProfileComponent } from '../dialog-user-profile/dialog-user-profile.component';
import { ChatServiceService } from '../chat-service.service';
import { Subscription, debounceTime, fromEvent } from 'rxjs';
import { ScreenServiceService } from '../screen-service.service';

@Component({
  selector: 'app-mainpage-channels',
  templateUrl: './mainpage-channels.component.html',
  styleUrls: ['./mainpage-channels.component.scss']
})
export class MainpageChannelsComponent implements OnDestroy {
  @Output() closeRightSidenav = new EventEmitter<void>();
  @Output() closeLeftSidenav = new EventEmitter<void>();
  @Output() openChat = new EventEmitter<void>();
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
  search;

  resizeSubscription: Subscription;
  tabletMode: boolean = false;

  unsubChannels: Unsubscribe;
  unsubUsers: Unsubscribe;

  /**
   * @param {AccountServiceService} accountService - Service for managing accounts.
   * @param {ChannelServiceService} channelService - Service for managing channels.
   * @param {MatDialog} dialog - Dialog component.
   */
  constructor(
    public accountService: AccountServiceService,
    public channelService: ChannelServiceService,
    public chatService: ChatServiceService,
    public dialog: MatDialog,
    public screenService: ScreenServiceService) {
    this.accountService.openDirectMessage$.subscribe((user) => {
      this.openDirectMessage(user);
    });
    this.accountService.openChannelArea$.subscribe((channel) => {
      this.openChannelArea(channel);
    });

    this.getAllChannels();
    this.getAllUsers();
    // this.checkWindowSize();
  }


  // checkWindowSize() {
  //   if (window.innerWidth <= 920) {
  //     this.tabletMode = true;
  //   } else {
  //     this.tabletMode = false;
  //   }
  // }

  // ngAfterViewInit() {
  //   this.cdRef.detectChanges();
  // }

  /**
   * Fetches all channels that the logged-in user is a part of.
   */
  getAllChannels(): void {
    this.unsubChannels = onSnapshot(this.channelsCollection, (channel) => {
      this.allChannels = [];
      channel.forEach(element => {
        let channelData = element.data() as Channel;
        if (channelData.members.includes(this.accountService.getLoggedInUser().id))
          this.allChannels.push(channelData);
      });
    });
  }


  /**
   * Fetches all users except the logged-in user.
   */
  getAllUsers(): void {
    this.unsubUsers = onSnapshot(this.usersCollection, (user) => {
      this.allUsers = [];
      user.forEach(element => {
        let userData = element.data() as User;
        if (!(userData.id === this.accountService.getLoggedInUser().id))
          this.allUsers.push(element.data());
      });
    });
  }


  /**
   * Opens the dialog to add a new channel.
   */
  openAddChannel(): void {
    this.dialog.open(DialogAddChannelComponent);
  }


  /**
   * Opens a specific channel area.
   * @param {Channel} channel - The channel to open.
   */
  openChannelArea(channel: Channel): void {
    this.closeThreads();
    this.channelService.inDirectMessage = false;
    this.channelService.currentChannel_ID = channel.id;
    this.channelService.checkChannelOwner(channel);
  }


  /**
   * Opens a direct message for a specific user.
   * @param {User} user - The user to open the direct message with.
   */
  async openDirectMessage(user: User): Promise<void> {
    console.log('channel component', user);
        this.closeThreads();
    await this.checkDmChannelExistence(user.id);
    this.setupDmView(user, false);
  }


  /**
   * Opens a self-message thread.
   */
  openSelfMessage(): void {
    this.closeThreads();
    const selfUser = this.accountService.getLoggedInUser();
    this.setupDmView(selfUser, true);
  }


  /**
   * Setups the DM view based on the given user and the DM ownership.
   * @param {User} user - The user to set the DM view for.
   * @param {boolean} isOwnDm - Indicates if the DM is owned by the current user.
   */
  private setupDmView(user: User, isOwnDm: boolean): void {
    this.channelService.savedDmPartner = user;
    this.currentSelectedUser_ID = user.id;
    this.channelService.noCurrentChannel = true;
    this.channelService.isOwnDmChannel = isOwnDm;
    this.channelService.inDirectMessage = true;
  }


  /**
   * Emits a close event to close threads.
   */
  closeThreads(): void {
    this.closeRightSidenav.emit();
    if (this.screenService.tabletMode) {
      this.closeLeftSidenav.emit();
      this.openChat.emit();
    }
  }


  /**
   * Toggles the visibility of the channel section.
   */
  channelSectionToggle(): void {
    this.isDropdownOpenChannel = !this.isDropdownOpenChannel
  }


  /**
   * Toggles the visibility of the DM section.
   */
  dMSectionToggle(): void {
    this.isDropdownOpenDm = !this.isDropdownOpenDm
  }


  /**
  * Checks if a DM channel exists for a given user.
  * @param {string} userId - The ID of the user to check the DM channel for.
  */
  private async checkDmChannelExistence(userId: string): Promise<void> {
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
      this.getMembersInformation(userId);
      await this.createNewDmChannel();
    }
  }


  /**
   * Sets up member information for creating a new DM.
   * @param {string} userId - The ID of the user to set the DM member information for.
   */
  getMembersInformation(userId: string): void {
    this.directMessage.members = [];
    this.directMessage.members.push(this.accountService.getLoggedInUser().id);
    this.directMessage.members.push(userId);
    this.directMessage.date = new Date();
  }


  /**
   * Creates a new DM channel.
   */
  private async createNewDmChannel(): Promise<void> {
    const newDm = await addDoc(this.directMessagesCollection, this.directMessage.toJSON());
    const newDmDoc = doc(this.directMessagesCollection, newDm.id);
    await updateDoc(newDmDoc, { id: newDm.id });
    this.channelService.currentDmChannel_ID = newDm.id;
  }


  /**
   * Unsubscribes from the channels and users observables.
   */
  ngOnDestroy(): void {
    if (this.unsubChannels) {
      this.unsubChannels();
    }

    if (this.unsubUsers) {
      this.unsubUsers();
    }

    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }


  openDialogThread(thread: any) {
    this.chatService.ownerData = thread;
    console.log('thread', thread);

    this.dialog.open(DialogUserProfileComponent, { restoreFocus: false });
  }

  getFirstName(fullName: string): string {
    return fullName.split(' ')[0]; // Extrahiert das erste Wort
  }
}