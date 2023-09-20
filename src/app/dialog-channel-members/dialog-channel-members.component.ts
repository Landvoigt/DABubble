import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccountServiceService } from '../account-service.service';
import { ChannelServiceService } from '../channel-service.service';
import { Subscription } from 'rxjs';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { DialogChannelAddNewMembersComponent } from '../dialog-channel-add-new-members/dialog-channel-add-new-members.component';

/**
 * Component for displaying and managing channel members.
 */
@Component({
  selector: 'app-dialog-channel-members',
  templateUrl: './dialog-channel-members.component.html',
  styleUrls: ['./dialog-channel-members.component.scss']
})
export class DialogChannelMembersComponent implements OnInit, OnDestroy {
  firestore: Firestore = inject(Firestore);
  userCollectionRef = collection(this.firestore, 'users');
  private subscription: Subscription;
  currentChannel;
  channelMembers = [];

  showNoPerm: boolean = false;
  hoverTimeout: any;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogChannelMembersComponent>,
    public accountService: AccountServiceService,
    public channelService: ChannelServiceService) { }


  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit(): void {
    this.subscribeCurrentChannel();
  }


  /**
   * Subscribes to the updates of the current channel.
   */
  private subscribeCurrentChannel(): void {
    this.subscription = this.channelService.currentChannel$.subscribe(channel => {
      if (channel && Object.keys(channel).length > 0) {
        this.currentChannel = channel;
        this.setupMembers();
      }
    });
  }


  /**
   * Sets up the list of members for the current channel.
   */
  private async setupMembers(): Promise<void> {
    const loggedInUserId = this.accountService.getLoggedInUser().id;
    const querySnapshot = await getDocs(this.userCollectionRef);
    this.populateChannelMembers(querySnapshot, loggedInUserId);
  }


  /**
   * Populates the channelMembers array based on the given user data snapshot.
   * @param {any} querySnapshot - The snapshot of user data.
   * @param {string} loggedInUserId - The ID of the currently logged-in user.
   */
  private populateChannelMembers(querySnapshot: any, loggedInUserId: string): void {
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


  openProfile(): void {
  }


  /**
   * Unsubscribes from the updates of the current channel.
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}