import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChannelServiceService } from '../channel-service.service';
import { AccountServiceService } from '../account-service.service';
import { ChatServiceService } from '../chat-service.service';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { DialogEmojisComponent } from '../dialog-emojis/dialog-emojis.component';

@Component({
  selector: 'app-mainpage-direct-message',
  templateUrl: './mainpage-direct-message.component.html',
  styleUrls: ['./mainpage-direct-message.component.scss']
})
export class MainpageDirectMessageComponent {
  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;
  hoverAddClientIcon: boolean = false;
  loading: boolean = false;

  message;

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelServiceService,
    public accountService: AccountServiceService,
    public chatService: ChatServiceService) {
    this.chatService.serviceThread = this.message;
  }

  async sendMessage(form: NgForm) {

  }

  openDialog() {
    this.dialog.open(DialogEmojisComponent, { restoreFocus: false });
  }

  insertEmoji(event: EmojiEvent) {
    this.chatService.insertEmoji(event);
  }
}
