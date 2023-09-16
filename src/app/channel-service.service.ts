import { Injectable, inject } from '@angular/core';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { Channel } from 'src/models/channel.class';
import { BehaviorSubject } from 'rxjs';
import { Thread } from 'src/models/thread.class';

@Injectable({
  providedIn: 'root'
})
export class ChannelServiceService {
  firestore: Firestore = inject(Firestore);

  currentChannel: Channel;
  private _currentChannel_ID = new BehaviorSubject<string | null>(null);
  private _currentChannel = new BehaviorSubject<Channel | null>(null);

  currentThread: Thread;
  private _currentThread_ID = new BehaviorSubject<string | null>(null);
  private _currentThread = new BehaviorSubject<Thread | null>(null);

  savedChannel_ID;

  inDirectMessage: boolean = false;

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
}