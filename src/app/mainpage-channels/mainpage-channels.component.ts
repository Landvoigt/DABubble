import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { DialogAddChannelComponent } from '../dialog-add-channel/dialog-add-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { Firestore, QueryDocumentSnapshot, Unsubscribe, addDoc, collection, doc, getDocs, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { ChannelServiceService } from '../channel-service.service';
import { DirectMessage } from 'src/models/direct-message.class';
import { User } from 'src/models/user.class';
import { Channel } from 'src/models/channel.class';
import { ChatServiceService } from '../chat-service.service';
import { Subscription } from 'rxjs';
import { ScreenServiceService } from '../screen-service.service';
import { BannerServiceService } from '../banner-service.service';
import { SearchServiceService } from '../search-service.service';

@Component({
  selector: 'app-mainpage-channels',
  templateUrl: './mainpage-channels.component.html',
  styleUrls: ['./mainpage-channels.component.scss']
})
export class MainpageChannelsComponent implements OnInit, OnDestroy {
  @Output() closeRightSidenav = new EventEmitter<void>();
  @Output() closeLeftSidenav = new EventEmitter<void>();
  @Output() openChat = new EventEmitter<void>();

  firestore: Firestore = inject(Firestore);
  usersCollection = collection(this.firestore, 'users');
  channelsCollection = collection(this.firestore, 'channels');
  directMessagesCollection = collection(this.firestore, 'direct-messages');

  resizeSubscription: Subscription;
  newChannelSubscription: Subscription;
  newDmSubscription: Subscription;
  unsubChannels: Unsubscribe;
  unsubUsers: Unsubscribe;

  directMessage: DirectMessage = new DirectMessage();
  allChannels: any[] = [];
  allUsers: any[] = [];

  @ViewChild('searchFieldContainerMobile') searchFieldContainerMobile: ElementRef;
  currentSelectedUser_ID: string = '';

  isDropdownOpenChannel: boolean = true;
  isDropdownOpenDm: boolean = true;
  
  colorBlue: boolean = false;
  colorGreen: boolean = false;
  colorGray: boolean = false;

  constructor(
    public accountService: AccountServiceService,
    public channelService: ChannelServiceService,
    public chatService: ChatServiceService,
    public dialog: MatDialog,
    public screenService: ScreenServiceService,
    private bannerService: BannerServiceService,
    public searchService: SearchServiceService) {
  }


  /**
   * Responsible for calling methods to:
   * - Fetch all channels and users.
   * - Check the user's status.
   * - Check for any changes in direct messages or channels.
   */
  ngOnInit(): void {
    this.searchFieldContainerMobile = new ElementRef(null);
    this.getAllChannels();
    this.getAllUsers();
    this.statusCheck();
    this.checkForDmChange();
    this.checkForChannelChange();
  }


  /**
   * Subscribes to the `newDmPartner$` observable from the `channelService` to listen 
   * for any new direct message partner selection.
   * - If the selected user for direct messaging is the logged-in user, it opens a 
   * self-message interface.
   * - If another user is selected, it initiates a direct message interface with that user.
   */
  checkForDmChange() {
    this.newDmSubscription = this.channelService.newDmPartner$
      .subscribe((user: User | null) => {
        const loggedInUser = this.accountService.getLoggedInUser();
        if (user && loggedInUser && user.id === loggedInUser.id) {
          this.openSelfMessage();
        } else if (user) {
          this.openDirectMessage(user);
        }
      });
  }


  /**
   * Subscribes to the `newChannel$` observable from the `channelService` to listen 
   * for any new channel selections.
   * - If a channel is selected, it opens the corresponding channel area.
   */
  checkForChannelChange() {
    this.newChannelSubscription = this.channelService.newChannel$
      .subscribe((channel: Channel | null) => {
        if (channel) {
          this.openChannelArea(channel);
        }
      });
  }


  /**
   * Fetches all channels that the logged-in user is a part of.
   */
  getAllChannels(): void {
    this.unsubChannels = onSnapshot(this.channelsCollection, (snapshot) => {
      const newAllChannels = this.getChannelsFromSnapshot(snapshot);
      this.listenForChannelModification(snapshot);
      this.allChannels = newAllChannels;
    });
  }


  /**
   * Loops through the snapshot and returns a list of all channels where the user is a member.
   * @param {any} snapshot - The snapshot of the data.
   */
  getChannelsFromSnapshot(snapshot: any): Channel[] {
    const newAllChannels = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const channelData = doc.data() as Channel;
      if (channelData.members.includes(this.accountService.getLoggedInUser().id)) {
        newAllChannels.push(channelData);
      }
    });
    return newAllChannels;
  }


  /**
   * Monitors channel changes and sends notifications or performs actions when certain changes are detected.
   * @param {any} snapshot - The snapshot of the data.
   * @param {Channel[]} newAllChannels - The array of new channels.
   */
  listenForChannelModification(snapshot: any): void {
    snapshot.docChanges().forEach(change => {
      const channelData = change.doc.data() as Channel;
      if (change.type === 'modified') {
        this.handleChannelModification(channelData);
      }
    });
  }


  /**
   * Handles modifications in channel information and sends notifications.
   * @param {Channel} channelData - The data of the modified channel.
   */
  handleChannelModification(channelData: Channel): void {
    const wasInChannel = this.allChannels.some(channel => channel.id === channelData.id);
    const isInChannel = channelData.members.includes(this.accountService.getLoggedInUser().id);

    if (isInChannel && !wasInChannel) {
      this.bannerService.show(`Eingeladen in Channel: ${channelData.name}`);
      // this.bannerService.show(`Added to Channel: ${channelData.name}`);
    } else if (!isInChannel && wasInChannel) {
      this.bannerService.show(`Entfernt aus Channel: ${channelData.name}`);
      // this.bannerService.show(`Removed from Channel: ${channelData.name}`);
      this.handleRemovedFromChannel();
    }
  }


  /**
   * Performs actions when the user is removed from a channel.
   */
  handleRemovedFromChannel(): void {
    this.channelService.inDirectMessage = false;
    setTimeout(() => {
      this.channelService.noCurrentChannel = true;
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
      this.allUsers.sort((a, b) => {
        return this.compareUsers(a, b);
      });
    });
  }


  /**
   * Sorts the users compared by status.
   */
  compareUsers(a: User, b: User): number {
    if (a.isActive && a.loggedIn) {
      if (!b.isActive || !b.loggedIn) return -1;
    } else if (b.isActive && b.loggedIn) {
      return 1;
    }

    if (a.isActive && !a.loggedIn) {
      if (b.loggedIn || (!b.isActive && !b.loggedIn)) return -1;
    } else if (b.isActive && !b.loggedIn) {
      return 1;
    }

    if (!a.isActive && a.loggedIn) {
      if (!b.isActive && !b.loggedIn) return -1;
    } else if (!b.isActive && b.loggedIn) {
      return 1;
    }
    return 0;
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
  setupDmView(user: User, isOwnDm: boolean): void {
    this.channelService.savedDmPartner = user;
    this.currentSelectedUser_ID = user.id;
    this.channelService.noCurrentChannel = true;
    this.channelService.isOwnDmChannel = isOwnDm;
    this.channelService.inDirectMessage = true;
  }


  /**
   * Emits a close event to close threads component.
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
  async checkDmChannelExistence(userId: string): Promise<void> {
    const dmChannelId = await this.findExistingDmChannel(userId);

    if (dmChannelId) {
      this.channelService.currentDmChannel_ID = dmChannelId;
    } else {
      this.getMembersInformation(userId);
      await this.createNewDmChannel();
    }
  }


  /**
   * Finds an existing DM channel ID for the specified user ID.
   * @param {string} userId - The ID of the user to check the DM channel for.
   */
  private async findExistingDmChannel(userId: string): Promise<string | null> {
    const loggedInUserId = this.accountService.getLoggedInUser().id;
    const querySnapshot = await getDocs(this.directMessagesCollection);

    for (const messageDoc of querySnapshot.docs) {
      const messageData = messageDoc.data() as DirectMessage;
      if (messageData.members.includes(loggedInUserId) && messageData.members.includes(userId)) {
        return messageData.id;
      }
    }
    return null;
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
  async createNewDmChannel(): Promise<void> {
    const newDm = await addDoc(this.directMessagesCollection, this.directMessage.toJSON());
    const newDmDoc = doc(this.directMessagesCollection, newDm.id);
    await updateDoc(newDmDoc, { id: newDm.id });
    this.channelService.currentDmChannel_ID = newDm.id;
  }


  /**
   * 
   */
  statusCheck(): void {
    this.accountService.userData$.subscribe((data) => {
      const user = data.find((element) => element.email === this.accountService.getLoggedInUser().email);
      if (user) {
        this.colorGreen = user.loggedIn && !user.isActive;
        this.colorBlue = user.loggedIn && user.isActive;
        this.colorGray = !user.loggedIn && !user.isActive;
      }
    });
  }


  /**
   * If the click occurs outside of the
   * searchFieldContainer element, it clears the search 
   * input field and triggers the generalSearch function.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.screenService.tabletMode) {
      if (this.searchFieldContainerMobile.nativeElement &&
        !this.searchFieldContainerMobile.nativeElement.contains(event.target as Node)) {
        this.searchService.search = '';
        this.searchService.generalSearch();
      }
    }
  }


  /**
   * Returns just the first name from the incoming full name.
   */
  getFirstName(fullName: string): string {
    return fullName.split(' ')[0]; // Extrahiert das erste Wort
  }


  /**
   * Unsubscribes from the channels and users observables to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.unsubscribeFromChannels();
    this.unsubscribeFromUsers();
    this.unsubscribeFromResize();
    this.unsubscribeFromNewDm();
    this.unsubscribeFromNewChannel();
  }


  /**
   * Unsubscribes from the channels observable, if it exists.
   */
  private unsubscribeFromChannels(): void {
    if (this.unsubChannels) {
      this.unsubChannels();
    }
  }


  /**
   * Unsubscribes from the users observable, if it exists.
   */
  private unsubscribeFromUsers(): void {
    if (this.unsubUsers) {
      this.unsubUsers();
    }
  }


  /**
   * Unsubscribes from the window resize event observable, if it exists.
   */
  private unsubscribeFromResize(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }


  /**
   * Unsubscribes from the new direct message observable, if it exists.
   */
  private unsubscribeFromNewDm(): void {
    if (this.newDmSubscription) {
      this.newDmSubscription.unsubscribe();
    }
  }


  /**
   * Unsubscribes from the new channel observable, if it exists.
   */
  private unsubscribeFromNewChannel(): void {
    if (this.newChannelSubscription) {
      this.newChannelSubscription.unsubscribe();
    }
  }
}