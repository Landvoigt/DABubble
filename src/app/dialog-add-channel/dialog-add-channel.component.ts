import { Component, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, setDoc } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Channel } from 'src/models/channel.class';
import { AccountServiceService } from '../account-service.service';
import { ChannelServiceService } from '../channel-service.service';

@Component({
  selector: 'app-dialog-add-channel',
  templateUrl: './dialog-add-channel.component.html',
  styleUrls: ['./dialog-add-channel.component.scss']
})
export class DialogAddChannelComponent {
  /** Instance of Firestore to interact with the database. */
  firestore: Firestore = inject(Firestore);

  /** New channel instance to be added. */
  channel = new Channel();

  /** Loading indicator flag. */
  loading: boolean = false;

  /**
   * @param {MatDialogRef<DialogAddChannelComponent>} dialogRef - Reference to the current dialog.
   * @param {AccountServiceService} accountService - Service to manage accounts.
   * @param {ChannelServiceService} channelService - Service to manage channels.
   */
  constructor(
    public dialogRef: MatDialogRef<DialogAddChannelComponent>,
    public accountService: AccountServiceService,
    private channelService: ChannelServiceService) { }


  /**
  * Determines the channel creator and creation date for adding a new channel to Firestore if the form is valid.
  * @param {NgForm} form - The form containing the channel details.
  */
  async addChannel(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      this.channel.owner = this.accountService.getLoggedInUser().id;
      this.channel.date = new Date();
      await this.createNewChannel();
    }
    this.dialogRef.close();
    this.loading = false;
  }


  /**
   * Creates the new channel in Firestore.
   */
  async createNewChannel() {
    const channelCollection = collection(this.firestore, 'channels');
    const newChannel = await addDoc(channelCollection, this.channel.toJSON());

    await this.addIdToChannel(newChannel.id);
    this.channelService.currentChannel_ID = newChannel.id;
  }


   /**
   * Updates the channel in Firestore to add its own ID.
   * @param {string} _id - The ID of the channel to be updated.
   */
  async addIdToChannel(_id: string) {
    try {
      const channelDocRef = doc(this.firestore, 'channels', _id);
      await setDoc(channelDocRef, { id: _id }, { merge: true });

    } catch (error) {
      console.error("Error updating channel:", error);
    }
  }
}