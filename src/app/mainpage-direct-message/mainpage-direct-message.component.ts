import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChannelServiceService } from '../channel-service.service';
import { AccountServiceService } from '../account-service.service';
import { ChatServiceService } from '../chat-service.service';
import { DialogEmojisComponent } from '../dialog-emojis/dialog-emojis.component';
import { Firestore, addDoc, collection, doc, getDoc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Unsubscribe } from '@angular/fire/auth';
import { Thread } from 'src/models/thread.class';
import { DirectMessage } from 'src/models/direct-message.class';

@Component({
  selector: 'app-mainpage-direct-message',
  templateUrl: './mainpage-direct-message.component.html',
  styleUrls: ['./mainpage-direct-message.component.scss']
})
export class MainpageDirectMessageComponent implements OnInit, OnDestroy {
  firestore: Firestore = inject(Firestore);
  usersCollection = collection(this.firestore, 'users');
  dmCollection = collection(this.firestore, 'direct-messages');

  private ownChannelSubscription: Subscription;
  private directMessageSubscription: Subscription;
  unsubThreads: Unsubscribe;

  currentDmChannel = new DirectMessage();
  directMessage = new Thread();
  threads = [];
  // message_3;

  isOwnDmChannel: boolean = false;
  isThreadsEmpty: boolean = false;
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


  /**
   * Sets up the direct- or self-messages subscription to monitor changes.
   */
  ngOnInit(): void {
    this.ownChannelSubscription = this.channelService.isOwnDmChannel$.subscribe(isOwn => {
      this.isOwnDmChannel = isOwn;
      this.unsubscribeDirectMessage();
      if (isOwn) {
        this.setupThreads('selfMsg');
      } else {
        this.subscribeToDirectMessages();
      }
    });
  }

  /**
   * Sets up the subscription to direct messages.
   */
  private subscribeToDirectMessages(): void {
    this.directMessageSubscription = this.channelService.currentDmChannel$.subscribe(dmChannel => {
      if (dmChannel && Object.keys(dmChannel).length > 0) {
        this.currentDmChannel = dmChannel;
        this.setupThreads('directMsg');
      }
    });
  }


  /**
   * Sets up the threads subscription based on the type direct- or self-message.
   * @param {string} type - Type of the thread, either 'directMsg' | 'selfMsg'.
   */
  private setupThreads(type: 'directMsg' | 'selfMsg'): void {
    const threadCollection = this.getThreadCollection(type);

    this.unsubThreads = onSnapshot(threadCollection, (threadSnapshot) => {
      this.threads = threadSnapshot.docs.map(doc => doc.data());
      this.isThreadsEmpty = this.threads.length === 0;
      this.sortThreads();
    });
  }


  /**
   * Sorts all threads to see the latest message. 
   */
  sortThreads(): void {
    this.threads.sort((a, b) => {
      const dateA = this.timestampToDate(a.date);
      const dateB = this.timestampToDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }


  /**
   * Returns the thread collection based on the type.
   * @param {string} type - Type of the thread, either 'directMsg' | 'selfMsg'.
   * @returns the respective thread collection.
   */
  private getThreadCollection(type: 'directMsg' | 'selfMsg') {
    if (type === 'directMsg') {
      const dmDocRef = doc(this.dmCollection, this.currentDmChannel.id);
      return collection(dmDocRef, 'threads');
    } else {
      const smDocRef = doc(this.usersCollection, this.accountService.getLoggedInUser().id);
      return collection(smDocRef, 'self-messages');
    }
  }


  /**
   * Sends a message to the channel.
   * @param {NgForm} form - The Angular form containing the message.
   */
  async sendMessage(form: NgForm): Promise<void> {
    if (!form.valid) return;
    this.loading = true;

    this.setMessageProperties();
    await this.addAndUpdateThread();

    form.resetForm();
    this.loading = false;
  }


  /**
   * Adds a new thread and updates its ID.
   */
  private async addAndUpdateThread(): Promise<void> {
    const threadCollection = this.getThreadCollection(this.isOwnDmChannel ? 'selfMsg' : 'directMsg');
    const threadData = this.directMessage.toJSON();
    const newThread = await addDoc(threadCollection, threadData);
    await updateDoc(doc(threadCollection, newThread.id), { id: newThread.id });
  }


  /**
   * Sets the properties for the direct message before sending.
   */
  private setMessageProperties(): void {
    const user = this.accountService.getLoggedInUser();
    this.directMessage.date = new Date();
    this.directMessage.ownerID = user.id;
    this.directMessage.ownerName = user.name;
    this.directMessage.ownerAvatarSrc = user.avatarSrc;
  }


  /**
   * Opens the edit message input.
   * @param {any} threadId - The ID of the thread that contains the message to edit.
   * @param {number} i - The index of the message in the threads array.
   */
  async openEditMessage(threadId: any, i: number): Promise<void> {
    this.inEditMessage = i;
    const threadType = this.isOwnDmChannel ? 'selfMsg' : 'directMsg';
    const threadCollection = this.getThreadCollection(threadType);
    const threadDocRef = doc(threadCollection, threadId);

    const docSnapshot = await getDoc(threadDocRef);
    if (docSnapshot.exists()) {
      this.threads[i].editMessageContent = docSnapshot.data()['content'];
    }
  }


  /**
   * Updates the edited content of a specific message in firestore.
   * @param {any} threadId - The ID of the thread that contains the message to update.
   * @param {number} i - The index of the message in the threads array.
   */
  async editMessage(threadId: any, i: number): Promise<void> {
    const threadType = this.isOwnDmChannel ? 'selfMsg' : 'directMsg';
    const threadCollection = this.getThreadCollection(threadType);
    const threadDocRef = doc(threadCollection, threadId);
    await updateDoc(threadDocRef, {
      content: this.threads[i].editMessageContent
    });
    this.inEditMessage = null;
  }


  timestampToDate(timestamp: { seconds: number, nanoseconds: number }): Date {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
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


  threadSentOnNewDate(index: number, threads: any[]): boolean {
    if (index === threads.length - 1) return false;
    const currentDate = this.getFormattedDate(threads[index].date);
    const nextDate = this.getFormattedDate(threads[index + 1].date);
    return currentDate === nextDate;
  }


  openDialog() {
    this.dialog.open(DialogEmojisComponent, { restoreFocus: false });
  }


  openDialogThread(thread) {

  }


  closeEdit() {
    this.inEditMessage = null;
  }


  // insertEmoji(event: EmojiEvent) {
  //   this.chatService.insertEmoji(event);
  // }

  ngOnDestroy() {
    this.unsubscribeDirectMessage();
    this.unsubscribeSelfMessage();
    this.unsubscribeThreads();
  }

  /**
   * Unsubscribes from the direct message subscription if active.
   */
  private unsubscribeDirectMessage(): void {
    if (this.directMessageSubscription) {
      this.directMessageSubscription.unsubscribe();
    }
  }

  /**
   * Unsubscribes from the self message subscription if active.
   */
  private unsubscribeSelfMessage(): void {
    if (this.ownChannelSubscription) {
      this.ownChannelSubscription.unsubscribe();
    }
  }

  /**
   * Unsubscribes from all threads if active.
   */
  private unsubscribeThreads(): void {
    if (this.unsubThreads) {
      this.unsubThreads();
    }
  }
}
