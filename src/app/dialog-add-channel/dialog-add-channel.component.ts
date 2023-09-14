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
  firestore: Firestore = inject(Firestore);
  channel = new Channel();
  loading: boolean = false;

  constructor(public dialogRef: MatDialogRef<DialogAddChannelComponent>, public accountService: AccountServiceService, private channelService: ChannelServiceService) { }

  async addChannel(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      this.channel.owner = this.accountService.getLoggedInUser().id;
      this.channel.date = new Date();
      console.log(this.channel);
      await this.createNewChannel();
    }
    this.dialogRef.close();
    this.loading = false;
  }

  async createNewChannel() {
    const channelCollection = collection(this.firestore, 'channels');
    const newChannel = await addDoc(channelCollection, this.channel.toJSON());

    await this.addIdToChannel(newChannel.id);
    this.channelService.currentChannel_ID = newChannel.id;
  }

  async addIdToChannel(_id: string) {
    try {
      const channelDocRef = doc(this.firestore, 'channels', _id);
      await setDoc(channelDocRef, { id: _id }, { merge: true });

    } catch (error) {
      console.error("Error updating channel:", error);
    }
  }
}