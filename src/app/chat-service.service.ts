import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EmojiEvent, Emoji, EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { Thread } from 'src/models/thread.class';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {

  serviceThread:any;
  ownerData:any;
 

  constructor() { }



   insertEmoji(event: EmojiEvent) {
   
    const emojiNative: string = event.emoji.native;
    this.serviceThread.content += emojiNative; // Fügt das Emoji-Id dem Text hinzu
}

  //@ViewChild('myTextarea') textarea: ElementRef;

  //  insertEmoji(emoji: string) {
  //      if (!this.currentTextarea) {
  //        console.error('Textarea-Element nicht gefunden.');
  //        return;
  //      }
  //      const startPos = this.currentTextarea.selectionStart;
  //      const endPos = this.currentTextarea.selectionEnd;
  //      const text = this.currentTextarea.value;
  //      const newText = text.substring(0, startPos) +  emoji +  text.substring(endPos, text.length);
  //      this.currentTextarea.value = newText;
  //      this.currentTextarea.setSelectionRange(startPos + emoji.length + 12, startPos + emoji.length + 12); // Berücksichtige die Nicht-Brechungsraumzeichen
  //      this.currentTextarea.focus();
  //    }



//  insertEmoji(emoji: string) {
//      if (!this.currentTextarea) {
//        console.error('Textarea-Element nicht gefunden.');
//        return;
//      }
//      const startPos = this.currentTextarea.selectionStart;
//      const endPos = this.currentTextarea.selectionEnd;
//      const text = this.currentTextarea.value;
//      const newText = text.substring(0, startPos) + emoji + text.substring(endPos, text.length);
//      this.currentTextarea.value = newText;
//      const emojiPos = startPos + emoji.length;
//      this.currentTextarea.setSelectionRange(emojiPos, emojiPos);
//      this.currentTextarea.focus();
//  }
  
}
