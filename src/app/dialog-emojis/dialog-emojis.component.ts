import { ChatServiceService } from '../chat-service.service';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-dialog-emojis',
  templateUrl: './dialog-emojis.component.html',
  styleUrls: ['./dialog-emojis.component.scss']
})
export class DialogEmojisComponent {

  constructor(
    public chatService: ChatServiceService,
    public dialogRef: MatDialogRef<DialogEmojisComponent>) { }


  /**
   * Inserts an emoji on the position in the textarea.
   * @param event - The picked emoji
   */
  insertEmoji(event: EmojiEvent) {
    this.chatService.serviceThread;
    const emojiNative: string = event.emoji.native;

    if (this.chatService.isContent) {
      this.chatService.serviceThread.content += `${emojiNative}`;
    }
    if (this.chatService.isEditMessageContent) {
      this.chatService.serviceThread.editMessageContent += `${emojiNative}`;
    }
  }
}
