import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Channel } from 'src/models/channel.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { Thread } from 'src/models/thread.class';
import { DirectMessage } from 'src/models/direct-message.class';
import { AccountServiceService } from './account-service.service';
import { User } from 'src/models/user.class';
import { ReactionCountPipe } from './reaction-count.pipe';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {
  firestore: Firestore = inject(Firestore);

  private _currentChannel_ID = new BehaviorSubject<string | null>(null);
  private _currentChannel = new BehaviorSubject<Channel | null>(null);

  private _currentThread_ID = new BehaviorSubject<string | null>(null);
  private _currentThread = new BehaviorSubject<Thread | null>(null);

  private _currentDmChannel_ID = new BehaviorSubject<string | null>(null);
  private _currentDmChannel = new BehaviorSubject<DirectMessage | null>(null);

  public newDmPartner = new BehaviorSubject<User | null>(null);
  public newChannel = new BehaviorSubject<Channel | null>(null);

  private _isOwnDmChannel = new BehaviorSubject<boolean>(false);

  savedDmPartner: User = new User();
  savedChannel_ID: string = '';

  noCurrentChannel: boolean = true;
  inDirectMessage: boolean = false;
  channelOwnerEqualCurrentUser: boolean = false;

  constructor(private accountService: AccountServiceService, private reactionCountPipe: ReactionCountPipe) { }


  /**
   * Observable to get the currently opened channel.
   */
  get currentChannel$() {
    return this._currentChannel.asObservable();
  }


  /**
   * Setter to set the current channel ID and fetch its data.
   */
  set currentChannel_ID(value: string) {
    this._currentChannel_ID.next(value);

    const channelCollection = doc(this.firestore, 'channels', value);
    this.savedChannel_ID = value;
    onSnapshot(channelCollection, (channelDoc) => {
      if (channelDoc.exists()) {
        this._currentChannel.next(new Channel(channelDoc.data()));
      } else {
        this._currentChannel.next(null);
      }
    });
  }


  /**
   * Observable to get the currently opened thread.
   */
  get currentThread$() {
    return this._currentThread.asObservable();
  }


  /**
   * Setter to set the current thread ID and fetch its data.
   */
  set currentThread_ID(value: string) {
    this._currentThread_ID.next(value);

    const channelDocRef = doc(this.firestore, 'channels', this.savedChannel_ID);
    const threadCollection = doc(channelDocRef, 'threads', value);
    onSnapshot(threadCollection, (threadDoc) => {
      if (threadDoc.exists()) {
        this._currentThread.next(new Thread(threadDoc.data()));
      } else {
        this._currentThread.next(null);
      }
    });
  }


  /**
   * Observable to get the currently opened direct message channel.
   */
  get currentDmChannel$() {
    return this._currentDmChannel.asObservable();
  }


  /**
   * Setter to set the current direct message channel ID and fetch its data.
   */
  set currentDmChannel_ID(value: string) {
    this._currentDmChannel_ID.next(value);

    const dmCollection = doc(this.firestore, 'direct-messages', value);
    onSnapshot(dmCollection, (dmDoc) => {
      if (dmDoc.exists()) {
        this._currentDmChannel.next(new DirectMessage(dmDoc.data()));
      } else {
        this._currentDmChannel.next(null);
      }
    });
  }


  /**
   * Checks if the logged-in user is the owner of the opened direct message  channel.
   * @param {Channel} channel - The channel to check against.
   */
  checkChannelOwner(channel: Channel) {
    const loggedInUserId = this.accountService.getLoggedInUser().id;
    if (channel.owner === loggedInUserId) {
      this.channelOwnerEqualCurrentUser = true;
    }
  }


  /**
   * Observable to get the status if the current direct message channel is owned by the logged-in user.
   */
  get isOwnDmChannel$(): Observable<boolean> {
    return this._isOwnDmChannel.asObservable();
  }


  /**
   * Setter to set the status if the current direct message channel is owned by the logged-in user.
   */
  set isOwnDmChannel(value: boolean) {
    this._isOwnDmChannel.next(value);
  }


  /**
   * Observable to check if a new direct message chat gets opened.
   */
  get newDmPartner$() {
    return this.newDmPartner.asObservable();
  }


  /**
   * Observable to check if a new channel chat gets opened through the search field.
   */
  get newChannel$() {
    return this.newChannel.asObservable();
  }


  /**
   * Changes the given timestamp into a specific format.
   */
  getFormattedTime(timestamp: any) {
    const date = this.timestampToDate(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedTime = `${hours}:${minutes} Uhr`;
    return formattedTime;
  }


  /**
   * Turns the given date into a specific format or changes it to "Today" if the date is today. 
   */
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


  /**
   * Turns the timestamp into a date format.
   */
  timestampToDate(timestamp: { seconds: number, nanoseconds: number }): Date {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }


  /**
   * Clarifies if the thread date is an other than the date of the thread before.
   * @param index - The index of the thread.
   * @param threads - The thread containing the needed information.
   */
  threadSentOnNewDate(index: number, threads: any[]): boolean {
    if (index === threads.length - 1) return false;
    const currentDate = this.getFormattedDate(threads[index].date);
    const nextDate = this.getFormattedDate(threads[index + 1].date);
    return currentDate === nextDate;
  }


  /**
   * Clarifies if the answer date is an other than the date of the thread before.
   * @param index - The index of the thread.
   * @param threads - The thread containing the needed information.
   */
  answerSentOnNewDate(index: number, threads: any[]): boolean {
    if (index === 0) return false;
    const currentDate = this.getFormattedDate(threads[index].date);
    const previousDate = this.getFormattedDate(threads[index - 1].date);
    return currentDate !== previousDate;
  }


  /**
   * Changes the answer count to the given format.
   */
  formatAnswerCount(amount: number): string {
    if (amount === 1) {
      return '1 Antwort';
    } else {
      return amount + ' Antworten';
    }
  }


  /**
   * Checks if a user has reacted on the thread and changes the flag based on that.
   */
  userHasReacted(thread: Thread, reaction: string, userName: string): boolean {
    return thread.userReactions && thread.userReactions[userName] === reaction;
  }


  /**
   * Checks if a user has reacted on the thread and executes the pipe.
   */
  hasReactions(userReactions: any, reactionType: string): boolean {
    return this.reactionCountPipe.transform(userReactions, reactionType) > 0;
  }


  /**
   * Gets the name of the user that has reacted.
   */
  getReactedUsersName(userReactions: { [key: string]: string }, reaction: string): string[] {
    return Object.keys(userReactions).filter(userName => userReactions[userName] === reaction);
  }


  /**
   * Formats the reaction container based on how many and who has reacted.
   */
  getReactionMessage(reactions: { [userId: string]: string }, reactionType: string): Array<{ isName: boolean, text: string }> {
    let messageParts = [];
    let usersWhoReacted = this.getReactedUsersName(reactions, reactionType);
    let isUserIncluded = usersWhoReacted.includes(this.accountService.getLoggedInUser().name);

    if (usersWhoReacted.length === 1 && isUserIncluded) {
      messageParts.push({ isName: true, text: "Du" });
      messageParts.push({ isName: false, text: " hast reagiert" });
    } else if (usersWhoReacted.length === 1 && !isUserIncluded) {
      let otherUser = usersWhoReacted.find(name => name !== this.accountService.getLoggedInUser().name);
      messageParts.push({ isName: true, text: otherUser });
      messageParts.push({ isName: false, text: " hat reagiert" });
    } else if (usersWhoReacted.length === 2 && isUserIncluded) {
      let otherUser = usersWhoReacted.find(name => name !== this.accountService.getLoggedInUser().name);
      messageParts.push({ isName: true, text: otherUser });
      messageParts.push({ isName: false, text: " und" });
      messageParts.push({ isName: true, text: " Du" });
      messageParts.push({ isName: false, text: " haben reagiert" });
    } else if (usersWhoReacted.length === 2) {
      messageParts.push({ isName: true, text: usersWhoReacted[0] });
      messageParts.push({ isName: false, text: " und " });
      messageParts.push({ isName: true, text: usersWhoReacted[1] });
      messageParts.push({ isName: false, text: " haben reagiert" });
    } else if (usersWhoReacted.length === 3 && isUserIncluded) {
      usersWhoReacted = usersWhoReacted.filter(name => name !== this.accountService.getLoggedInUser().name);
      messageParts.push({ isName: true, text: usersWhoReacted.join(', ') });
      messageParts.push({ isName: false, text: " und" });
      messageParts.push({ isName: true, text: " Du" });
      messageParts.push({ isName: false, text: " haben reagiert" });
    } else if (usersWhoReacted.length === 3) {
      messageParts.push({ isName: true, text: usersWhoReacted.slice(0, -1).join(', ') });
      messageParts.push({ isName: false, text: " und " });
      messageParts.push({ isName: true, text: usersWhoReacted.slice(-1) });
      messageParts.push({ isName: false, text: " haben reagiert" });
    } else if (usersWhoReacted.length > 3 && isUserIncluded) {
      usersWhoReacted = usersWhoReacted.filter(name => name !== this.accountService.getLoggedInUser().name);
      messageParts.push({ isName: true, text: usersWhoReacted[0] });
      messageParts.push({ isName: true, text: ", Du" });
      messageParts.push({ isName: false, text: " und " });
      messageParts.push({ isName: true, text: " weitere" });
      messageParts.push({ isName: false, text: " haben reagiert" });
    } else {
      usersWhoReacted = usersWhoReacted.filter(name => name !== this.accountService.getLoggedInUser().name);
      messageParts.push({ isName: true, text: usersWhoReacted.slice(0, 2).join(', ') });
      messageParts.push({ isName: false, text: " und " });
      messageParts.push({ isName: true, text: " weitere" });
      messageParts.push({ isName: false, text: " haben reagiert" });
    }
    return messageParts;
  }
}