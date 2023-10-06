import { Component, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
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

  /** Reference to the current collection in Firestore. */
  channelCollection = collection(this.firestore, 'channels');

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
   * Attempts to add a new channel if the provided form is valid. It sets the required properties of the channel,
   * creates the channel in Firestore, and then closes the dialog.
   * @param {NgForm} form - The form containing the channel details.
   * @returns {Promise<void>}
   */
  async addChannel(form: NgForm): Promise<void> {
    if (!form.valid) return;

    this.loading = true;

    await this.checkForChannelExistence();
    this.setChannelProperties();
    await this.createNewChannel();

    this.dialogRef.close();
    this.loading = false;
  }


  /**
   * Adds an additional number if the channel already exists
   */
  async checkForChannelExistence() {
    const originalName = this.channel.name;
    let suffix = 1;
    while (await this.doesChannelNameExist(this.channel.name)) {
        this.channel.name = `${originalName} (${suffix})`;
        suffix++;
    }
  }


  /**
   * Goes through all firestore channels and checks for the exact name.
   */
  async doesChannelNameExist(name: string): Promise<boolean> {
    const q = query(
      this.channelCollection,
      where("name", "==", name)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }


  /**
   * Sets the properties for the channel that's about to be added. It sets the owner (current user),
   * adds the owner to the members list, and sets the current date for the creation date of the channel.
   */
  private setChannelProperties(): void {
    this.channel.owner = this.accountService.getLoggedInUser().id;
    this.channel.members.push(this.channel.owner);  // this.channel.owner was already extracted
    this.channel.date = new Date();
  }


  /**
   * Creates the new channel in Firestore, then updates the channel in Firestore to add its own ID.
   */
  async createNewChannel(): Promise<void> {
    const newChannel = await addDoc(this.channelCollection, this.channel.toJSON());
    const newChannelDoc = doc(this.channelCollection, newChannel.id);
    await updateDoc(newChannelDoc, {
      id: newChannel.id
    });

    this.channelService.currentChannel_ID = newChannel.id;
    this.channelService.checkChannelOwner(this.channel);
  }
}