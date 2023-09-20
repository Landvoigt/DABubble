import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ChannelServiceService } from '../channel-service.service';
import { Firestore, addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { Thread } from 'src/models/thread.class';
import { AccountServiceService } from '../account-service.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { ChatServiceService } from '../chat-service.service';
import { DialogEmojisComponent } from '../dialog-emojis/dialog-emojis.component';
import { NgForm } from '@angular/forms';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { DialogUserProfileComponent } from '../dialog-user-profile/dialog-user-profile.component';
import { User } from 'src/models/user.class';
import { DialogChannelMembersComponent } from '../dialog-channel-members/dialog-channel-members.component';
import { DialogChannelAddNewMembersComponent } from '../dialog-channel-add-new-members/dialog-channel-add-new-members.component';
import { Channel } from 'src/models/channel.class';


@Component({
  selector: 'app-mainpage-chat',
  templateUrl: './mainpage-chat.component.html',
  styleUrls: ['./mainpage-chat.component.scss']
})
export class MainpageChatComponent implements OnInit, OnDestroy {
  @Output() openEvent = new EventEmitter<void>();
  firestore: Firestore = inject(Firestore);
  userCollectionRef = collection(this.firestore, 'users');

  private subscription: Subscription;
  unsubChannel: Unsubscribe;
  unsubThreads: Unsubscribe;

  currentChannel = new Channel();
  message = new Thread();
  threads = [];
  currentChannelMembers = [];
  user: User;

  loading: boolean = false;

  hoveredThreadId: number | null = null;
  ownThreadId: number | null = null;
  inEditMessage: number | null = null;

  loadedMessageContent: string;

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelServiceService,
    public accountService: AccountServiceService,
    public chatService: ChatServiceService) {
  }

  containsVisibleCharacter(control) {
    const value = control.value;
    const visibleCharacterPattern = /[^\s\p{C}]/u; // Überprüft, ob mindestens ein sichtbares Zeichen (Buchstabe oder Emoji) vorhanden ist
    return visibleCharacterPattern.test(value) ? null : { containsVisibleCharacter: true };
  }


  ngOnInit(): void {
    this.subscription = this.channelService.currentChannel$.subscribe(channel => {
      if (channel && Object.keys(channel).length > 0) {
        this.currentChannel = channel;
        this.channelService.noCurrentChannel = false;
        this.setupThreads(this.currentChannel.id);
        this.setupChannelMembers(this.currentChannel.members);
      } else {
        this.channelService.noCurrentChannel = true;
      }
    });
  }

  async sendMessage(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      const channelCollection = collection(this.firestore, 'channels');
      const channelDocRef = doc(channelCollection, this.currentChannel.id);
      const threadCollection = collection(channelDocRef, 'threads');

      this.message.date = new Date();
      this.message.ownerID = this.accountService.getLoggedInUser().id;
      this.message.ownerName = this.accountService.getLoggedInUser().name;
      this.message.ownerAvatarSrc = this.accountService.getLoggedInUser().avatarSrc;
      this.message.ownerEmail = this.accountService.getLoggedInUser().email;

      const threadData = this.message.toJSON();
      const newThread = await addDoc(threadCollection, threadData);

      const threadDocRef = doc(threadCollection, newThread.id);
      await updateDoc(threadDocRef, {
        id: newThread.id
      });

      form.resetForm();
      this.message.content = '';
      this.loading = false;
    }
  }

  setupThreads(channelId: string) {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    const threadCollection = collection(channelDocRef, 'threads');

    this.unsubThreads = onSnapshot(threadCollection, async (threadSnapshot) => {
      this.threads = [];
      threadSnapshot.forEach(element => {
        const threadData = element.data();
        this.threads.push(threadData);

   
      });

      this.threads.sort((a, b) => {
        const dateA = this.timestampToDate(a.date);
        const dateB = this.timestampToDate(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    });
  }

  async setupChannelMembers(members: any) {
    this.currentChannelMembers = [];
    const querySnapshot = await getDocs(this.userCollectionRef);
    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data() as User;
      if (members.includes(userData.id)) {
        this.currentChannelMembers.push(userData);
      }
    });
    this.sortCurrentChannelMembers();
  }

  sortCurrentChannelMembers() {
    const loggedInUserId = this.accountService.getLoggedInUser().id;
    this.currentChannelMembers.sort((a: User, b: User) => {
      if (a.id === loggedInUserId) return 1;
      if (b.id === loggedInUserId) return -1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  }


  async getThreadOwnerDetails(id: string): Promise<{ name: string, avatarSrc: string }> {
    const userCollection = collection(this.firestore, 'users');
    const q = query(userCollection, where('id', '==', id));

    const userSnapshot = await getDocs(q);
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      return {
        name: userData['name'],
        avatarSrc: userData['avatarSrc'] || 'assets/img/avatar_small.png'
      };
    }
    return {
      name: 'Unknown User',
      avatarSrc: 'assets/img/avatar_small.png'
    };
  }

  closeEdit() {
    this.inEditMessage = null;
  }

  async openEditMessage(threadId: any, i: number) {
    this.inEditMessage = i;
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', threadId);

    const docSnapshot = await getDoc(threadDocRef);
    if (docSnapshot.exists()) {
      this.threads[i].editMessageContent = docSnapshot.data()['content'];
    }
  }

  async editMessage(threadId: any, i: number) {
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', threadId);

    await updateDoc(threadDocRef, {
      content: this.threads[i].editMessageContent
    });

    this.inEditMessage = null;
  }

  openThreads(_id: string) {
    this.openEvent.emit();
    this.channelService.currentThread_ID = _id;
  }

  addFilter(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.style.filter = 'brightness(100%)';
  }

  removeFilter(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.style.filter = 'brightness(0%)';
  }

  formatAnswerCount(amount: number): string {
    if (amount === 1) {
      return '1 Antwort';
    } else {
      return amount + ' Antworten';
    }
  }

  getFormattedTime(timestamp: any) {
    const date = this.timestampToDate(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedTime = `${hours}:${minutes} Uhr`;
    return formattedTime;
  }

  getFormattedDate(timestamp: { seconds: number, nanoseconds: number }): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    const date = this.timestampToDate(timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCompare = new Date(date.getTime());
    dateToCompare.setHours(0, 0, 0, 0);
    if (dateToCompare.getTime() === today.getTime()) {
      return 'Heute';
    } else {
      return new Intl.DateTimeFormat('de-DE', options).format(date);
    }
  }

  timestampToDate(timestamp: { seconds: number, nanoseconds: number }): Date {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }

  threadSentOnNewDate(index: number, threads: any[]): boolean {
    if (index === threads.length - 1) return false;
    const currentDate = this.getFormattedDate(threads[index].date);
    const nextDate = this.getFormattedDate(threads[index + 1].date);
    return currentDate === nextDate;
  }

  // isOwnerDifferentFromPrevious(index: number, threads: any[]): boolean {
  //   if (index === 0) return false;
  //   return threads[index].owner !== threads[index - 1].owner;

  //   // [ngClass]="{'thread-container-reverse': isOwnerDifferentFromPrevious(i, threads)}"
  // }

  openEditChannel() {
    this.dialog.open(DialogEditChannelComponent);
  }

  openMembers() {
    this.dialog.open(DialogChannelMembersComponent);
  }

  openAddNewMembers() {
    this.dialog.open(DialogChannelAddNewMembersComponent);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.unsubChannel) {
      this.unsubChannel();
    }

    if (this.unsubThreads) {
      this.unsubThreads();
    }
  }

  openDialogThread(thread: any) {
    this.chatService.ownerData = thread;
    this.dialog.open(DialogUserProfileComponent, { restoreFocus: false });
  }


  openDialog() {
    this.chatService.serviceThread = this.message;
    event.preventDefault();

    const dialog = this.dialog.open(DialogEmojisComponent, { restoreFocus: false });
    dialog.componentInstance.content = this.message;

  }

  insertEmoji(event: EmojiEvent) {
    // this.chatService.insertEmoji(event);
  }
}