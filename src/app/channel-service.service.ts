import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Channel } from 'src/models/channel.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { Thread } from 'src/models/thread.class';
import { DirectMessage } from 'src/models/direct-message.class';
import { AccountServiceService } from './account-service.service';
import { User } from 'src/models/user.class';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {
  firestore: Firestore = inject(Firestore);

  // currentChannel: Channel;
  private _currentChannel_ID = new BehaviorSubject<string | null>(null);
  private _currentChannel = new BehaviorSubject<Channel | null>(null);

  // currentThread: Thread;
  private _currentThread_ID = new BehaviorSubject<string | null>(null);
  private _currentThread = new BehaviorSubject<Thread | null>(null);

  // currentDmChannel: DirectMessage;
  private _currentDmChannel_ID = new BehaviorSubject<string | null>(null);
  private _currentDmChannel = new BehaviorSubject<DirectMessage | null>(null);

  savedDmPartner: User = new User();
  savedChannel_ID: string;

  noCurrentChannel: boolean = true;
  // noCurrentDm: boolean = true;
  inDirectMessage: boolean = false;
  channelOwnerEqualCurrentUser: boolean = false;
  private _isOwnDmChannel = new BehaviorSubject<boolean>(false);

  constructor(private accountService: AccountServiceService) { }

  get currentChannel$() {
    return this._currentChannel.asObservable();
  }

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

  get currentThread$() {
    return this._currentThread.asObservable();
  }

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

  get currentDmChannel$() {
    return this._currentDmChannel.asObservable();
  }

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

  checkChannelOwner(channel: Channel) {
    const loggedInUserId = this.accountService.getLoggedInUser().id;
    if (channel.owner === loggedInUserId) {
      this.channelOwnerEqualCurrentUser = true;
    }
  }

  get isOwnDmChannel$(): Observable<boolean> {
    return this._isOwnDmChannel.asObservable();
  }

  set isOwnDmChannel(value: boolean) {
    this._isOwnDmChannel.next(value);
  }
}