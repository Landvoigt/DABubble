import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelServiceService } from '../channel-service.service';
import { Firestore, addDoc, arrayUnion, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { Thread } from 'src/models/thread.class';
import { AccountServiceService } from '../account-service.service';

@Component({
  selector: 'app-mainpage-chat',
  templateUrl: './mainpage-chat.component.html',
  styleUrls: ['./mainpage-chat.component.scss']
})
export class MainpageChatComponent implements OnInit, OnDestroy {
  @Output() openEvent = new EventEmitter<void>();
  firestore: Firestore = inject(Firestore);
  private subscription: Subscription;

  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;
  hoverAddClientIcon: boolean = false;

  currentChannel;
  unsubChannel: Unsubscribe;
  unsubThreads: Unsubscribe;

  message = new Thread();
  // message_ID = '';
  threads = [];

  hoveredThreadId: number | null = null;
  ownThreadId: number | null = null;

  constructor(public dialog: MatDialog, public channelService: ChannelServiceService, public accountService: AccountServiceService) { }

  ngOnInit() {
    this.subscription = this.channelService.currentChannel$.subscribe(channel => {
      if (channel && Object.keys(channel).length > 0) {
        this.currentChannel = channel;
        this.threads = [];
        this.setupThreads(this.currentChannel.id);
      }
    });
  }

  async sendMessage() {
    const channelCollection = collection(this.firestore, 'channels');
    const channelDocRef = doc(channelCollection, this.currentChannel.id);
    const threadCollection = collection(channelDocRef, 'threads');

    this.message.date = new Date();
    this.message.owner = this.accountService.getLoggedInUser().id;
    const threadData = this.message.toJSON();
    await addDoc(threadCollection, threadData);
    // const newThread = await addDoc(threadCollection, threadData);
    // this.message_ID = newThread.id;
    // await this.addThreadIdToChannel(this.currentChannel.id, this.message_ID);
  }

  // async addThreadIdToChannel(channelId: string, threadId: string) {
  //   const channelDocRef = doc(this.firestore, 'channels', channelId);

  //   try {
  //     await updateDoc(channelDocRef, {
  //       messages: arrayUnion(threadId)
  //     });
  //   } catch (error) {
  //     console.error("Error adding thread ID to channel:", error);
  //   }
  // }

  setupThreads(channelId: string) {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    const threadCollection = collection(channelDocRef, 'threads');

    // const q = query(threadCollection, orderBy('date', 'desc'))
    // this.unsubThreads = onSnapshot(q, async (threadSnapshot) => {
    this.unsubThreads = onSnapshot(threadCollection, async (threadSnapshot) => {
      this.threads = [];
      const threadPromises = [];

      threadSnapshot.forEach(element => {
        const threadData = element.data();
        const ownerDetailsPromise = this.getThreadOwnerDetails(threadData['owner']);
        threadPromises.push(ownerDetailsPromise.then(ownerDetails => {
          threadData['ownerName'] = ownerDetails.name;
          threadData['avatarSrc'] = ownerDetails.avatarSrc;
          this.threads.push(threadData);
        }));
      });

      await Promise.all(threadPromises);

      this.threads.sort((a, b) => {
        const dateA = this.timestampToDate(a.date);
        const dateB = this.timestampToDate(b.date);
        return dateB.getTime() - dateA.getTime();
      });
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
    // Return default values if user is not found
    return {
      name: 'Unknown User',
      avatarSrc: 'assets/img/avatar_small.png'
    };
  }


  openThreads() {
    this.openEvent.emit();
  }

  addFilter(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.style.filter = 'brightness(100%)';
  }

  removeFilter(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    target.style.filter = 'brightness(0%)';
  }

  getAmountOfAnswers(thread: any) {
    if (thread.answers?.length === 1) {
      return '1 Antwort';
    } else {
      return thread.answers?.length + ' Antworten';
    }
  }

  getFormattedTime(timestamp: any) {
    const date = timestamp.toDate();
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
}