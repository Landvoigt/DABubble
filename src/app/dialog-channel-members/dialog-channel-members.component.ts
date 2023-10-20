import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccountServiceService } from '../account-service.service';
import { ChannelServiceService } from '../channel-service.service';
import { Subscription } from 'rxjs';
import { Firestore, arrayRemove, collection, doc, getDocs, updateDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { DialogChannelAddNewMembersComponent } from '../dialog-channel-add-new-members/dialog-channel-add-new-members.component';
import { Channel } from 'src/models/channel.class';
import { Thread } from 'src/models/thread.class';
import { DialogUserProfileComponent } from '../dialog-user-profile/dialog-user-profile.component';
import { ChatServiceService } from '../chat-service.service';
import { BannerServiceService } from '../banner-service.service';

@Component({
  selector: 'app-dialog-channel-members',
  templateUrl: './dialog-channel-members.component.html',
  styleUrls: ['./dialog-channel-members.component.scss']
})
export class DialogChannelMembersComponent implements OnInit, OnDestroy {
  firestore: Firestore = inject(Firestore);
  userCollectionRef = collection(this.firestore, 'users');

  private channelSubscription: Subscription;

  currentChannel: Channel;
  channelMembers: any[] = [];

  showNoPerm: boolean = false;
  hoverTimeout: any;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogChannelMembersComponent>,
    public accountService: AccountServiceService,
    public channelService: ChannelServiceService,
    private chatService: ChatServiceService,
    private bannerService: BannerServiceService) { }


  ngOnInit(): void {
    this.subscribeCurrentChannel();
  }


  /**
   * Subscribes to the updates of the current channel.
   */
  subscribeCurrentChannel(): void {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(channel => {
      if (channel && Object.keys(channel).length > 0) {
        this.currentChannel = channel;
        this.channelMembers = [];
        this.setupMembers();
      }
    });
  }


  /**
   * Sets up the list of members for the current channel.
   */
  async setupMembers(): Promise<void> {
    const loggedInUserId = this.accountService.getLoggedInUser().id;
    const querySnapshot = await getDocs(this.userCollectionRef);
    this.populateChannelMembers(querySnapshot, loggedInUserId);
  }


  /**
   * Populates the channelMembers array based on the given user data snapshot.
   * @param {any} querySnapshot - The snapshot of user data.
   * @param {string} loggedInUserId - The ID of the currently logged-in user.
   */
  populateChannelMembers(querySnapshot: any, loggedInUserId: string): void {
    this.channelMembers = [];
    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data() as User;
      if (this.currentChannel.members.includes(userData.id) && userData.id !== loggedInUserId) {
        this.channelMembers.push(userData);
      }
    });
  }


  /**
   * Opens the dialog for adding new members to the channel.
   */
  openAddMembers(): void {
    this.dialogRef.close();
    this.dialog.open(DialogChannelAddNewMembersComponent);
  }


  /**
   * Starts the hover effect to show a no-permission message if the current user is not the channel owner.
   */
  startHover(): void {
    if (!this.channelService.channelOwnerEqualCurrentUser) {
      this.hoverTimeout = setTimeout(() => {
        this.showNoPerm = true;
      }, 750);
    }
  }


  /**
   * Stops the hover effect and hides the no-permission message.
   */
  stopHover(): void {
    clearTimeout(this.hoverTimeout);
    this.showNoPerm = false;
  }


  /**
   * Extracts the needed information from the given user to open the profile dialog.
   */
  extractUserInformation(user: User) {
    let content = new Thread;
    content.ownerName = user.name,
      content.ownerAvatarSrc = user.avatarSrc,
      content.ownerEmail = user.email,
      content.ownerID = user.id
    this.openDialogProfile(content);
  }


  /**
   * Opens the profile dialog.
   */
  openDialogProfile(thread: Thread) {
    this.chatService.ownerData = thread;
    this.dialog.open(DialogUserProfileComponent, { restoreFocus: false });
  }


  /**
   * Removes a specific member from the current channel.
   * @param memberID - ID of the channel members that gets removed.
   */
  async removeChannelMember(memberID: string) {
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    try {
      await updateDoc(channelDocRef, {
        members: arrayRemove(memberID)
      });
      this.bannerService.show('Mitglied entfernt');
      // this.bannerService.show('User removed');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }


  /**
   * Unsubscribes from the updates of the current channel.
   */
  ngOnDestroy(): void {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }
}