import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Firestore, addDoc, arrayUnion, collection, doc, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { MatSidenav } from '@angular/material/sidenav';
import { AccountServiceService } from '../account-service.service';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
})
export class MainpageComponent implements OnInit {
  @ViewChild('leftSidenav') leftSidenav!: MatSidenav;
  @ViewChild('rightSidenav') rightSidenav!: MatSidenav;
  firestore: Firestore = inject(Firestore);
  currentUser: any;
  hoverCodeIcon: boolean = false;

  channelName: string;
  channelMessage: string;
  channelAnswer: string;
  allChannels = [];
  allMessages = [];
  allAnswers = [];
  CHANNEL_ID = '3YayllvwIWls0Ajqquj8';
  THREAD_ID = '';
  ANSWER_ID = '';

  constructor(private accountService: AccountServiceService) {
    this.currentUser = this.accountService.currentUser;
  }

  ngOnInit(): void {
    console.log(this.currentUser);
    this.fetchAllChannels();
  }

  toggleLeftSidenav() {
    this.leftSidenav.toggle();
  }

  toggleRightSidenav() {
    this.rightSidenav.toggle();
  }

  openRightSidenav() {
    this.rightSidenav.open();
  }


  async createNewChannel() {
    const channelCollection = collection(this.firestore, 'channels');
    const newChannelData = {
      name: this.channelName,
      date: new Date(),
      members: ['ID_1', 'ID_2', 'ID_3'],
      messages: []
    }
    const newChannel = await addDoc(channelCollection, newChannelData);

    this.CHANNEL_ID = newChannel.id;

    this.fetchAllChannels();
  }

  async createNewMessage() {
    const channelCollection = collection(this.firestore, 'channels');
    const channelDocRef = doc(channelCollection, this.CHANNEL_ID);

    const threadCollection = collection(channelDocRef, 'threads');
    const threadData = {
      content: this.channelMessage,
      entry: new Date(),
      owner: 'Tim',
      answers: []
    };
    const newThread = await addDoc(threadCollection, threadData);
    this.THREAD_ID = newThread.id;

    await this.addThreadIdToChannel(this.CHANNEL_ID, this.THREAD_ID);

    this.fetchAllMessages();
  }

  async createNewAnswer() {
    const messageCollectionRef = collection(this.firestore, 'channels', this.CHANNEL_ID, 'threads');
    const messageDocRef = doc(messageCollectionRef, this.THREAD_ID);

    const answerCollection = collection(messageDocRef, 'answers');
    const answerData = {
      content: this.channelAnswer,
      entry: new Date(),
      owner: 'Tim'
    };
    const newAnswer = await addDoc(answerCollection, answerData);
    this.ANSWER_ID = newAnswer.id;

    await this.addAnswerIdToThread(this.CHANNEL_ID, this.THREAD_ID, this.ANSWER_ID);

    this.fetchAllAnswers();
  }


  async fetchAllChannels() {
    try {
      const channelCollectionRef = collection(this.firestore, 'channels');
      const channelSnapshot = await getDocs(channelCollectionRef);

      this.allChannels = [];

      channelSnapshot.forEach(doc => {
        const data = doc.data();
        data['id'] = doc.id;
        this.allChannels.push(data);
      });
      console.log(this.allChannels);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }

  async fetchAllMessages() {
    try {
      const messageCollectionRef = collection(this.firestore, 'channels', this.CHANNEL_ID, 'threads');
      const messageSnapshot = await getDocs(messageCollectionRef);

      this.allMessages = [];

      messageSnapshot.forEach(doc => {
        const data = doc.data();
        data['id'] = doc.id;
        this.allMessages.push(data);
      });
      console.log(this.allMessages);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }

  async fetchAllAnswers() {
    try {
      const answerCollectionRef = collection(this.firestore, 'channels', this.CHANNEL_ID, 'threads', this.THREAD_ID, 'answers');
      const answerSnapshot = await getDocs(answerCollectionRef);

      this.allAnswers = [];

      answerSnapshot.forEach(doc => {
        const data = doc.data();
        data['id'] = doc.id;
        this.allAnswers.push(data);
      });
      console.log(this.allAnswers);
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }

  async addThreadIdToChannel(channelId: string, threadId: string) {
    const channelDocRef = doc(this.firestore, 'channels', channelId);

    try {
      await updateDoc(channelDocRef, {
        messages: arrayUnion(threadId)
      });
      console.log(`Thread ID ${threadId} added to channel ${channelId}`);
    } catch (error) {
      console.error("Error adding thread ID to channel:", error);
    }
  }

  async addAnswerIdToThread(channelId: string, threadId: string, answerId: string) {
    const threadDocRef = doc(this.firestore, 'channels', channelId, 'threads', threadId);

    try {
      await updateDoc(threadDocRef, {
        answers: arrayUnion(answerId)
      });
      console.log(`Answer ID ${answerId} added to thread ${threadId}`);
    } catch (error) {
      console.error("Error adding answer ID to thread:", error);
    }
  }
}