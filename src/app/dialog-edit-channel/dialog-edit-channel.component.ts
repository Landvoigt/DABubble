import { Component, OnDestroy, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChannelServiceService } from '../channel-service.service';
import { Firestore, arrayRemove, deleteDoc, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/database';
import { NgForm } from '@angular/forms';
import { User } from 'src/models/user.class';
import { AccountServiceService } from '../account-service.service';
import { Channel } from 'src/models/channel.class';
import { BannerServiceService } from '../banner-service.service';

@Component({
  selector: 'app-dialog-edit-channel',
  templateUrl: './dialog-edit-channel.component.html',
  styleUrls: ['./dialog-edit-channel.component.scss']
})
export class DialogEditChannelComponent implements OnDestroy {
  /** Instance of Firestore to interact with the database. */
  firestore: Firestore = inject(Firestore);

  /** Reference to the currently selected channel in Firestore. */
  currentChannelRef = doc(this.firestore, 'channels', this.channelService.savedChannel_ID);

  /** Unsubscribe function for the channel snapshot listener. */
  unsubChannel: Unsubscribe;

  /** Holds the data of the current channel. */
  channelData: any;

  /** Holds the name of the channel being edited. */
  channelName: string;

  /** Holds the description of the channel being edited. */
  channelDescription: string;

  /** Holds the owner of the channel being edited. */
  channelOwner: string;

  /** Flag to determine if the channel name is being edited. */
  inEditName: boolean = false;

  /** Flag to determine if the channel description is being edited. */
  inEditDescription: boolean = false;

  /**
  * @param {MatDialogRef<DialogEditChannelComponent>} dialogRef - Reference to the current dialog.
  * @param {ChannelServiceService} channelService - Service to manage channels.
  */
  constructor(
    public dialogRef: MatDialogRef<DialogEditChannelComponent>,
    private channelService: ChannelServiceService,
    public accountService: AccountServiceService,
    private bannerService: BannerServiceService) {
    this.unsubChannel = onSnapshot(this.currentChannelRef, (channelSnapshot) => {
      this.channelData = channelSnapshot.data();
      if (this.channelData) {
        this.getOwnerName();
      }
    });
  }


  /**
   * Gets the name of the channel owner from firestore.
   */
  async getOwnerName() {
    const userDocRef = doc(this.firestore, 'users', this.channelData.owner);
    const user = await getDoc(userDocRef);
    let userData = user.data() as User;
    this.channelOwner = userData.name;
  }


  /**
   * Sets the channel name for editing and toggles the editing flag.
   */
  editName(): void {
    this.channelName = this.channelData.name;
    this.inEditName = true;
  }


  /**
   * Sets the channel description for editing and toggles the editing flag.
   */
  editDescription(): void {
    this.channelDescription = this.channelData.description;
    this.inEditDescription = true;
  }


  /**
   * Saves the updated channel name to Firestore if the form is valid.
   * @param {NgForm} form - The form containing the channel name.
   */
  async saveName(form: NgForm): Promise<void> {
    if (form.valid) {
      await updateDoc(this.currentChannelRef, {
        name: this.channelName
      });
      this.inEditName = false;
    }
  }


  /**
   * Saves the updated channel description to Firestore if the form is valid.
   * @param {NgForm} form - The form containing the channel description.
   */
  async saveDescription(form: NgForm): Promise<void> {
    if (form.valid) {
      await updateDoc(this.currentChannelRef, {
        description: this.channelDescription
      });
      this.inEditDescription = false;
    }
  }


  /**
   * Attempts to make a user leave a channel.
   * @param {string} channelID - The ID of the channel to leave.
   */
  async leaveChannel(channelID: string): Promise<void> {
    const channelDocRef = doc(this.firestore, 'channels', channelID);
    const channel = await getDoc(channelDocRef);
    let channelData = channel.data() as Channel;
    const loggedInUserId = this.accountService.getLoggedInUser().id;

    if (channelData.owner === loggedInUserId) {
      await (channelData.members.length === 1
        ? this.deleteChannel(channelID)
        : this.changeOwnership(channelDocRef, channelData));
    } else {
      this.memberLeaveChannel(channelDocRef, loggedInUserId);
    }
    this.postLeaveChannelActions();
  }


  /**
   * Handles the process of a member leaving the channel.
   * @param {any} channelDocRef - The reference of the channel document in Firestore.
   * @param {string} loggedInUserId - The ID of the user leaving the channel.
   */
  async memberLeaveChannel(channelDocRef: any, loggedInUserId: string): Promise<void> {
    try {
      await updateDoc(channelDocRef, {
        members: arrayRemove(loggedInUserId)
      });
      this.bannerService.show('Channel verlassen');
      // this.bannerService.show('Channel left');
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  }


  /**
   * Changes the ownership of the channel.
   * @param {any} channelDocRef - The reference of the channel document in Firestore.
   * @param {Channel} channelData - The current data of the channel.
   */
  async changeOwnership(channelDocRef: any, channelData: Channel): Promise<void> {
    const membersWithoutOwner = channelData.members.filter(memberId => memberId !== channelData.owner);
    const newOwnerIndex = Math.floor(Math.random() * membersWithoutOwner.length);
    const newOwnerId = membersWithoutOwner[newOwnerIndex];
    try {
      await updateDoc(channelDocRef, {
        owner: newOwnerId,
        members: membersWithoutOwner
      });
      this.bannerService.show('Channel verlassen, Adminstatus vererbt');
      // this.bannerService.show('Channel left, ownership passed');
    } catch (error) {
      console.error('Error transferring ownership and leaving channel:', error);
    }
  }


  /**
   * Execute actions that need to be taken after a user leaves a channel.
   */
  postLeaveChannelActions(): void {
    this.dialogRef.close();
    this.channelService.noCurrentChannel = true;
  }


  /**
   * Determines if the channel can be deleted.
   */
  canDeleteChannel(): boolean {
    const loggedInUser = this.accountService.getLoggedInUser();
    return loggedInUser && this.channelData && this.channelData.owner === loggedInUser.id;
  }


  /**
   * Deletes a channel.
   * @param {string} channelID - The ID of the channel to delete.
   */
  async deleteChannel(channelID: string): Promise<void> {
    const channelDocRef = doc(this.firestore, 'channels', channelID);
    await deleteDoc(channelDocRef);
    this.channelService.noCurrentChannel = true;
    this.dialogRef.close();
    this.bannerService.show('Channel gelöscht');
    // this.bannerService.show('Channel deleted');
  }


  /**
   * Unsubscribes from the updates of the current channel.
   */
  ngOnDestroy(): void {
    if (this.unsubChannel) {
      this.unsubChannel();
    }
  }
}