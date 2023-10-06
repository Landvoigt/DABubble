import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ChannelServiceService } from '../channel-service.service';
import { Subscription } from 'rxjs';
import { Thread } from 'src/models/thread.class';
import { Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/auth';
import { AccountServiceService } from '../account-service.service';
import { NgForm } from '@angular/forms';
import { ChatServiceService } from '../chat-service.service';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatDialog } from '@angular/material/dialog';
import { DialogEmojisComponent } from '../dialog-emojis/dialog-emojis.component';
import { Channel } from 'src/models/channel.class';
import { DialogUserProfileComponent } from '../dialog-user-profile/dialog-user-profile.component';


@Component({
  selector: 'app-mainpage-threads',
  templateUrl: './mainpage-threads.component.html',
  styleUrls: ['./mainpage-threads.component.scss']
})
export class MainpageThreadsComponent implements OnInit, OnDestroy {
  @Output() closeEvent = new EventEmitter<void>();
  firestore: Firestore = inject(Firestore);

  private channelSubscription: Subscription;
  private threadSubscription: Subscription;
  unsubAnswers: Unsubscribe;

  currentChannel = new Channel();
  currentThread = new Thread();
  message_2 = new Thread();
  threadAnswers = [];

  loading: boolean = false;

  hoveredThreadId: number | null = null;
  ownThreadId: number | null = null;
  inEditMessage: number | null = null;
  hoveredThumbUp: number | null = null;
  hoveredThumbDown: number | null = null;

  loadedMessageContent: string;

  constructor(public dialog: MatDialog,
    public channelService: ChannelServiceService,
    public chatService: ChatServiceService,
    public accountService: AccountServiceService) { }


  ngOnInit() {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(channel => {
      if (channel && Object.keys(channel).length > 0) {
        this.currentChannel = channel;
      }
    });
    this.threadSubscription = this.channelService.currentThread$.subscribe(thread => {
      if (thread && Object.keys(thread).length > 0) {
        this.currentThread = thread;
        this.setupAnswers(this.currentThread.id);
      }
    });
  }

  setupAnswers(threadID: string) {
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', threadID);
    const answerCollection = collection(threadDocRef, 'answers');

    this.unsubAnswers = onSnapshot(answerCollection, async (answerSnapshot) => {
      this.threadAnswers = [];
      answerSnapshot.forEach(element => {
        const threadData = element.data();
        this.threadAnswers.push(threadData);
      });

      this.threadAnswers.sort((a, b) => {
        const dateA = this.channelService.timestampToDate(a.date);
        const dateB = this.channelService.timestampToDate(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    });
  }

  async sendMessage(form: NgForm) {
    if (form.valid) {
      this.loading = true;
      const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
      const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
      const answerCollection = collection(threadDocRef, 'answers');

      this.message_2.date = new Date();
      this.message_2.ownerID = this.accountService.getLoggedInUser().id;
      this.message_2.ownerName = this.accountService.getLoggedInUser().name;
      this.message_2.ownerAvatarSrc = this.accountService.getLoggedInUser().avatarSrc;
      this.message_2.ownerEmail = this.accountService.getLoggedInUser().email;

      const threadData = this.message_2.toJSON();
      const newAnswer = await addDoc(answerCollection, threadData);

      const answerDocRef = doc(answerCollection, newAnswer.id);
      await updateDoc(answerDocRef, {
        id: newAnswer.id
      });

      await updateDoc(threadDocRef, {
        lastAnswerTime: new Date(),
        amountOfAnswers: increment(1)
      });

      form.resetForm();
      this.message_2.content = '';
      this.loading = false;
      this.chatService.isContent = false;
    }
  }

  closeEdit() {
    this.inEditMessage = null;
  }

  async openEditMessage(answerId: any, i: number) {
    this.inEditMessage = i;
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');
    const answerDocRef = doc(answerCollection, answerId);

    const docSnapshot = await getDoc(answerDocRef);
    if (docSnapshot.exists()) {
      this.threadAnswers[i].editMessageContent = docSnapshot.data()['content'];
    }
  }

  async editMessage(answerId: any, i: number) {
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');
    const answerDocRef = doc(answerCollection, answerId);

    await updateDoc(answerDocRef, {
      content: this.threadAnswers[i].editMessageContent
    });

    this.inEditMessage = null;
    this.hoveredThreadId = null;
    this.ownThreadId = null;
    this.chatService.isEditMessageContent = false;
  }

  getAmountOfAnswers() {
    if (this.threadAnswers?.length === 1) {
      return '1 Antwort';
    } else {
      return this.threadAnswers?.length + ' Antworten';
    }
  }

  closeThreads() {
    this.closeEvent.emit();
  }

  ngOnDestroy() {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }

    if (this.threadSubscription) {
      this.threadSubscription.unsubscribe();
    }

    if (this.unsubAnswers) {
      this.unsubAnswers();
    }
  }

  openDialogThread(currentThread: any) {
    this.chatService.ownerData = currentThread;
    // event.preventDefault();
    this.dialog.open(DialogUserProfileComponent, { restoreFocus: false });
  }

  openDialogEmojisThradsComp() {
    this.chatService.serviceThread = this.message_2;
    this.chatService.isContent = true;
    event.preventDefault();
    this.dialog.open(DialogEmojisComponent, { restoreFocus: false });
  }

  // insertEmoji(event: EmojiEvent) {
  //   this.chatService.insertEmoji(event);
  // }
  // insertEmoji(event: EmojiEvent) {
  //   this.chatService.insertEmoji(event);
  // }



  async addReaction(answerId: string, reactionType: string, userName: string) {
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');
    const answerDocRef = doc(answerCollection, answerId);

    const answerSnap = await getDoc(answerDocRef);
    const answerData = answerSnap.data() as Thread;
    const userReactions = answerData.userReactions || {};

    // If user has already reacted with the same reaction, remove it, otherwise set/update the reaction
    if (userReactions[userName] === reactionType) {
      delete userReactions[userName];
    } else {
      userReactions[userName] = reactionType;
    }

    await updateDoc(answerDocRef, {
      userReactions: userReactions
    });
  }

  async deleteMessage(answerId: string) {
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');

    // Delete the answer.
    const answerDocRef = doc(answerCollection, answerId);
    await deleteDoc(answerDocRef);

    // Update the count of answers by decrementing by 1.
    await updateDoc(threadDocRef, {
      amountOfAnswers: increment(-1)
    });

    // Fetch the current thread data.
    const threadSnapshot = await getDoc(threadDocRef);
    const threadData = threadSnapshot.data() as Thread;

    // If the updated amount of answers is now 0, clear the lastAnswerTime.
    if (threadData.amountOfAnswers === 0) {
      await updateDoc(threadDocRef, {
        lastAnswerTime: null // Or however you want to represent no answers.
      });
    } else {
      // Fetch the latest answer based on its date.
      const latestAnswerQuery = query(answerCollection, orderBy("date", "desc"), limit(1));
      const latestAnswerSnapshot = await getDocs(latestAnswerQuery);

      if (!latestAnswerSnapshot.empty) {
        const latestAnswer = latestAnswerSnapshot.docs[0];
        const answerData = latestAnswer.data() as Thread;
        await updateDoc(threadDocRef, {
          lastAnswerTime: answerData.date
        });
      }
    }
  }
}