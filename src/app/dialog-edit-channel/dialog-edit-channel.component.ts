import { Component, OnDestroy, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ChannelServiceService } from '../channel-service.service';
import { Firestore, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/database';
import { NgForm } from '@angular/forms';

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
  channelData;

  /** Holds the name of the channel being edited. */
  channelName;

  /** Holds the description of the channel being edited. */
  channelDescription;

  /** Flag to determine if the channel name is being edited. */
  inEditName: boolean = false;

  /** Flag to determine if the channel description is being edited. */
  inEditDescription: boolean = false;

  /**
  * @param {MatDialogRef<DialogEditChannelComponent>} dialogRef - Reference to the current dialog.
  * @param {ChannelServiceService} channelService - Service to manage channels.
  */
  constructor(public dialogRef: MatDialogRef<DialogEditChannelComponent>, private channelService: ChannelServiceService) {
    this.unsubChannel = onSnapshot(this.currentChannelRef, (channelSnapshot) => {
      this.channelData = channelSnapshot.data();
    });
  }


  /**
   * Sets the channel name for editing and toggles the editing flag.
   */
  editName() {
    this.channelName = this.channelData.name;
    this.inEditName = true;
  }


  /**
   * Sets the channel description for editing and toggles the editing flag.
   */
  editDescription() {
    this.channelDescription = this.channelData.description;
    this.inEditDescription = true;
  }


  /**
  * Saves the updated channel name to Firestore if the form is valid.
  * @param {NgForm} form - The form containing the channel name.
  */
  async saveName(form: NgForm) {
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
  async saveDescription(form: NgForm) {
    if (form.valid) {
      await updateDoc(this.currentChannelRef, {
        description: this.channelDescription
      });
      this.inEditDescription = false;
    }
  }


  /**
  * Lifecycle hook that is called when the component is destroyed.
  */
  ngOnDestroy(): void {
    if (this.unsubChannel) {
      this.unsubChannel();
    }
  }
}