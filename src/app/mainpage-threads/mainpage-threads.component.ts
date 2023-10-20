import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ChannelServiceService } from '../channel-service.service';
import { Subscription } from 'rxjs';
import { Thread } from 'src/models/thread.class';
import { CollectionReference, DocumentData, DocumentReference, Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, limit, onSnapshot, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/auth';
import { AccountServiceService } from '../account-service.service';
import { NgForm } from '@angular/forms';
import { ChatServiceService } from '../chat-service.service';
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
  channelCollection = collection(this.firestore, 'channels');

  private channelSubscription: Subscription;
  private threadSubscription: Subscription;
  unsubAnswers: Unsubscribe;

  currentChannel: Channel = new Channel();
  currentThread: Thread = new Thread();
  message: Thread = new Thread();
  threadAnswers: any[] = [];
  editMessageContent: string = '';

  loading: boolean = false;

  hoveredThreadId: number | null = null;
  ownThreadId: number | null = null;
  inEditMessage: number | null = null;
  hoveredThumbUp: number | null = null;
  hoveredThumbDown: number | null = null;

  constructor(public dialog: MatDialog,
    public channelService: ChannelServiceService,
    public chatService: ChatServiceService,
    public accountService: AccountServiceService) { }


  ngOnInit() {
    this.setupChannel();
    this.setupThread();
  }


  /**
   * Subscribes to the current channel.
   */
  setupChannel(): void {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(channel => {
      if (channel && Object.keys(channel).length > 0) {
        this.currentChannel = channel;
      }
    });
  }


  /**
   * Subscribes to the current thread.
   */
  setupThread(): void {
    this.threadSubscription = this.channelService.currentThread$.subscribe(thread => {
      if (thread && Object.keys(thread).length > 0) {
        this.currentThread = thread;
        this.setupAnswers(this.currentThread.id);
      }
    });
  }


  /**
   * Loads all answers of the current thread.
   */
  setupAnswers(threadID: string) {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', threadID);
    const answerCollection = collection(threadDocRef, 'answers');

    this.unsubAnswers = onSnapshot(answerCollection, async (answerSnapshot) => {
      this.threadAnswers = [];
      answerSnapshot.forEach(element => {
        const threadData = element.data();
        this.threadAnswers.push(threadData);
      });
      this.sortAnswers();
    });
  }


  /**
   * Sorts all answers to see the latest message. 
   */
  sortAnswers(): void {
    this.threadAnswers.sort((a, b) => {
      const dateA = this.channelService.timestampToDate(a.date);
      const dateB = this.channelService.timestampToDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }


  /**
   * Sends an answer to the thread.
   * @param {NgForm} form - The Angular form containing the message.
   */
  async sendMessage(form: NgForm): Promise<void> {
    this.addImageUrlToNewMessage();
    if (this.message.uploadedFile || form.valid) {
      this.loading = true;

      this.setMessageProperties();
      await this.addNewAnswer();

      this.accountService.userIsActive();
      this.resetFormAndVariables(form);
    }
  }


  /**
   * Save the file url to the nex message.
   */
  addImageUrlToNewMessage() {
    this.message.uploadedFile = this.chatService.currentImageUrl;
  }
  
  
  /**
   * Sets the properties of the message before sending.
   */
  private setMessageProperties(): void {
    const user = this.accountService.getLoggedInUser();
    this.message.date = new Date();
    this.message.ownerID = user.id;
    this.message.ownerName = user.name;
    this.message.ownerAvatarSrc = user.avatarSrc;
    this.message.ownerEmail = user.email;
  }


  /**
   * Adds a new Answer.
   */
  private async addNewAnswer(): Promise<void> {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');

    const threadData = this.message.toJSON();
    const newAnswer = await addDoc(answerCollection, threadData);

    await this.updateThreadsAndAnswers(threadDocRef, answerCollection, newAnswer);
  }


  /**
   * Updates the answer ID aswell as the answers count in the thread.
   */
  async updateThreadsAndAnswers(threadDocRef: any, answerCollection: any, newAnswer: any) {
    await updateDoc(doc(answerCollection, newAnswer.id), { id: newAnswer.id });
    await updateDoc(threadDocRef, {
      lastAnswerTime: new Date(),
      amountOfAnswers: increment(1)
    });
  }


  /**
   * Resets the form and message related variables
   */
  resetFormAndVariables(form: NgForm): void {
    this.chatService.uploadedFileThreads = '';
    form.resetForm();
    this.message.content = '';
    this.loading = false;
    this.chatService.isContent = false;
    this.chatService.currentImageUrl = '';
  }


  /**
   * Opens the edit message input.
   * @param {any} answerId - The ID of the answer that contains the message to edit.
   * @param {number} i - The index of the message in the answers array.
   */
  async openEditMessage(answerId: any, i: number): Promise<void> {
    this.inEditMessage = i;
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');
    const answerDocRef = doc(answerCollection, answerId);

    const docSnapshot = await getDoc(answerDocRef);
    if (docSnapshot.exists()) {
      this.threadAnswers[i].editMessageContent = docSnapshot.data()['content'];
    }
  }


  /**
   * Updates the edited content of a specific message in firestore.
   * @param {any} answerId - The ID of the answer that contains the message to update.
   * @param {number} i - The index of the message in the answers array.
   */
  async editMessage(answerId: any, i: number): Promise<void> {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');
    const answerDocRef = doc(answerCollection, answerId);
    await updateDoc(answerDocRef, {
      content: this.threadAnswers[i].editMessageContent
    });
    this.resetMessageProperties();
  }


  /**
   * Resets the message booleans.
   */
  resetMessageProperties(): void {
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


  /**
   * Deletes a message and updates the answer count accordingly.
   * @param {string} answerId - The ID of the answer/message to be deleted.
   */
  async deleteMessage(answerId: string): Promise<void> {
    const answerDocRef = this.getAnswerDocRef(answerId);
    await deleteDoc(answerDocRef);
    await this.updateAnswerCount();
  }


  /**
   * Gets the document reference for a specific answer/message.
   * @param {string} answerId - The ID of the answer/message.
   */
  private getAnswerDocRef(answerId: string): DocumentReference {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');
    return doc(answerCollection, answerId);
  }


  /**
   * Updates the answer count and optionally the last answer time.
   */
  async updateAnswerCount(): Promise<void> {
    const threadDocRef = this.getThreadDocRef();
    const answerCollection = this.getAnswerCollection(threadDocRef);

    await this.decrementAnswerCount(threadDocRef);
    await this.manageLastAnswerTime(threadDocRef, answerCollection);
  }


  /**
   * Gets the document reference for a specific thread.
   */
  private getThreadDocRef(): DocumentReference {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    return doc(channelDocRef, 'threads', this.currentThread.id);
  }


  /**
   * Gets the collection reference for answers/messages in a thread.
   * @param {DocumentReference} threadDocRef - The reference to the thread document in Firestore.
   */
  private getAnswerCollection(threadDocRef: DocumentReference): CollectionReference {
    return collection(threadDocRef, 'answers');
  }


  /**
   * Decrements the count of answers/messages in a thread.
   * @param {DocumentReference} threadDocRef - The reference to the thread document in Firestore.
   */
  private async decrementAnswerCount(threadDocRef: DocumentReference): Promise<void> {
    await updateDoc(threadDocRef, {
      amountOfAnswers: increment(-1)
    });
  }


  /**
   * Manages the `lastAnswerTime` field of a thread, updating it based on existing answers or setting it to null.
   * @param {DocumentReference} threadDocRef - The reference to the thread document in Firestore.
   * @param {CollectionReference} answerCollection - The reference to the answers collection in Firestore.
   */
  private async manageLastAnswerTime(threadDocRef: DocumentReference, answerCollection: CollectionReference): Promise<void> {
    const threadData = (await getDoc(threadDocRef)).data() as Thread;

    if (threadData.amountOfAnswers === 0) {
      await updateDoc(threadDocRef, { lastAnswerTime: null });
    } else {
      await this.updateLastAnswerTime(threadDocRef, answerCollection);
    }
  }

  /**
   * Updates the `lastAnswerTime` field of a thread, based on the latest answer.
   * @param {DocumentReference} threadDocRef - The reference to the thread document in Firestore.
   * @param {CollectionReference} answerCollection - The reference to the answers collection in Firestore.
   */
  private async updateLastAnswerTime(threadDocRef: DocumentReference, answerCollection: CollectionReference): Promise<void> {
    const latestAnswerSnapshot = await getDocs(query(answerCollection, orderBy("date", "desc"), limit(1)));

    if (!latestAnswerSnapshot.empty) {
      const latestAnswer = latestAnswerSnapshot.docs[0];
      const answerData = latestAnswer.data() as Thread;
      await updateDoc(threadDocRef, { lastAnswerTime: answerData.date });
    }
  }


  /**
   * Add a reaction to a answer.
   */
  async addReaction(answerId: string, reactionType: string, userName: string): Promise<void> {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', this.currentThread.id);
    const answerCollection = collection(threadDocRef, 'answers');
    const answerDocRef = doc(answerCollection, answerId);

    const userReactions = await this.getUserReactions(answerDocRef);
    this.updateReaction(userReactions, userName, reactionType);

    await updateDoc(answerDocRef, { userReactions });
  }


  /**
   * Get user reactions from a answer document.
   */
  private async getUserReactions(answerDocRef: DocumentReference<DocumentData>): Promise<Object> {
    const answerSnap = await getDoc(answerDocRef);
    const answerData = answerSnap.data() as Thread;
    return answerData.userReactions || {};
  }


  /**
   * Update the reaction status for a user in the userReactions object.
   */
  private updateReaction(userReactions: Object, userName: string, reactionType: string): void {
    if (userReactions[userName] === reactionType) {
      delete userReactions[userName];
    } else {
      userReactions[userName] = reactionType;
    }
  }


  /**
   * Closes the threads component.
   */
  closeThreads() {
    this.closeEvent.emit();
  }


  /**
   * Takes the information in the thread to open the profile dialog. 
   */
  openDialogProfile(thread: Thread): void {
    this.chatService.ownerData = thread;
    this.dialog.open(DialogUserProfileComponent, { restoreFocus: false });
  }


  /**
 * Opens the emoji picker.
 */
  openDialogEmojis(event: any): void {
    this.chatService.serviceThread = this.message;
    this.chatService.isContent = true;
    event.preventDefault();
    this.dialog.open(DialogEmojisComponent, { restoreFocus: false });
  }


  /**
   * Opens the emoji picker in the edit message.
   */
  openDialogEmojisInEdit(event: any, thread: Thread): void {
    this.chatService.isEditMessageContent = true;
    this.chatService.serviceThread = thread;
    event.preventDefault();
    this.dialog.open(DialogEmojisComponent, { restoreFocus: false });
  }


  /**
   * Closes the edit message content form
   */
  closeEdit() {
    this.inEditMessage = null;
  }


  /**
   * Unsubscribes from all active subscriptions.
   */
  ngOnDestroy(): void {
    this.unsubscribeChannels();
    this.unsubscribeThreads();
    this.unsubscribeAnswers();
  }


  /**
   * Unsubscribes from the channel if active.
   */
  private unsubscribeChannels(): void {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }


  /**
   * Unsubscribes from the current thread if active.
   */
  private unsubscribeThreads(): void {
    if (this.threadSubscription) {
      this.threadSubscription.unsubscribe();
    }
  }


  /**
   * Unsubscribes from all answers if active.
   */
  private unsubscribeAnswers(): void {
    if (this.unsubAnswers) {
      this.unsubAnswers();
    }
  }
}