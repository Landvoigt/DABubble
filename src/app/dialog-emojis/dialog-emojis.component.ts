import { ChatServiceService } from '../chat-service.service';
import { Component } from '@angular/core';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-dialog-emojis',
  templateUrl: './dialog-emojis.component.html',
  styleUrls: ['./dialog-emojis.component.scss']
})
export class DialogEmojisComponent {

  content;

  constructor(public chatService: ChatServiceService) { }

  insertEmoji(event: EmojiEvent) {
    this.chatService.serviceThread;
    console.log('this.chatService.serviceThread;', this.chatService.serviceThread);

    const emojiNative: string = event.emoji.native;
    this.chatService.serviceThread.content += `${emojiNative}`;
  }
}
