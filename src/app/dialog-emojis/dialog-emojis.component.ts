import { ChatServiceService } from '../chat-service.service';
import { Component } from '@angular/core';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-dialog-emojis',
  templateUrl: './dialog-emojis.component.html',
  styleUrls: ['./dialog-emojis.component.scss']
})
export class DialogEmojisComponent {

 //content:any;

  constructor(public chatService: ChatServiceService) { }

  insertEmoji(event: EmojiEvent) {
    this.chatService.serviceThread;
    console.log('this.chatService.serviceThread;', this.chatService.serviceThread);
    const emojiNative: string = event.emoji.native;

    if(this.chatService.isContent) {
      this.chatService.serviceThread.content += `${emojiNative}`; // aus MainpageChatComponent und MainpageThreadsComponent
    }
    if(this.chatService.isEditMessageContent) {
       this.chatService.serviceThread.editMessageContent += emojiNative; // aus MainpageDirectMessageComponent
    }
   
  }
}
