import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ChannelServiceService } from '../channel-service.service';
import { DocumentData, DocumentReference, Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { Thread } from 'src/models/thread.class';
import { AccountServiceService } from '../account-service.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditChannelComponent } from '../dialog-edit-channel/dialog-edit-channel.component';
import { ChatServiceService } from '../chat-service.service';
import { DialogEmojisComponent } from '../dialog-emojis/dialog-emojis.component';
import { NgForm } from '@angular/forms';
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
  @Output() openRightSidenav = new EventEmitter<void>();
  @Output() openLeftSidenav = new EventEmitter<void>();

  firestore: Firestore = inject(Firestore);
  userCollection = collection(this.firestore, 'users');
  channelCollection = collection(this.firestore, 'channels');

  currentChannel: Channel = new Channel();
  message: Thread = new Thread();
  threads: any[] = [];
  currentChannelMembers: any[] = [];
  user: User = new User();
  editMessageContent: string = '';

  private channelSubscription: Subscription;
  unsubThreads: Unsubscribe;

  loading: boolean = false;

  hoveredThreadId: number | null = null;
  ownThreadId: number | null = null;
  inEditMessage: number | null = null;
  hoveredThumbUp: number | null = null;
  hoveredThumbDown: number | null = null;

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelServiceService,
    public accountService: AccountServiceService,
    public chatService: ChatServiceService) {
  }


  ngOnInit(): void {
    this.setupChannel();
  }


  /**
   * Subscribes to the current channel.
   */
  setupChannel(): void {
    this.channelSubscription = this.channelService.currentChannel$.subscribe(channel => {
      if (channel && Object.keys(channel).length > 0) {
        this.currentChannel = channel;
        this.channelService.noCurrentChannel = false;
        this.setupThreads();
        this.setupChannelMembers();
      } else {
        this.channelService.noCurrentChannel = true;
      }
    });
  }


  /**
   * Loads all threads of the current channel.
   */
  setupThreads(): void {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadCollection = collection(channelDocRef, 'threads');
    this.unsubThreads = onSnapshot(threadCollection, async (threadSnapshot) => {
      this.threads = [];
      threadSnapshot.forEach(element => {
        const threadData = element.data();
        this.threads.push(threadData);
      });
      this.sortThreads();
    });
  }


  /**
   * Sorts all threads to see the latest message. 
   */
  sortThreads(): void {
    this.threads.sort((a, b) => {
      const dateA = this.channelService.timestampToDate(a.date);
      const dateB = this.channelService.timestampToDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }


  /**
   * Loads all members that are in the channel to showcase them.
   */
  async setupChannelMembers(): Promise<void> {
    this.currentChannelMembers = [];
    const querySnapshot = await getDocs(this.userCollection);
    querySnapshot.forEach((userDoc) => {
      const userData = userDoc.data() as User;
      if (this.currentChannel.members.includes(userData.id) && !this.currentChannelMembers.some(member => member.id === userData.id)) {
        this.currentChannelMembers.push(userData);
      }
    });
    this.sortCurrentChannelMembers();
  }


  /**
   * Sorts all channel members alphabetically and puts the current user first. 
   */
  sortCurrentChannelMembers(): void {
    const loggedInUserId = this.accountService.getLoggedInUser().id;
    this.currentChannelMembers.sort((a: User, b: User) => {
      if (a.id === loggedInUserId) return 1;
      if (b.id === loggedInUserId) return -1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  }


  /**
   * Sends a message to the channel.
   * @param {NgForm} form - The Angular form containing the message.
   */
  async sendMessage(form: NgForm): Promise<void> {
    this.addImageUrlToNewMessage();
    if (this.message.uploadedFile || form.valid) {
      this.loading = true;

      this.setMessageProperties();
      await this.addAndUpdateThread();

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
    this.message.channelId = this.currentChannel.id;
    this.message.channelName = this.currentChannel.name;
  }


  /**
   * Adds a new thread and updates its ID.
   */
  private async addAndUpdateThread(): Promise<void> {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadCollection = collection(channelDocRef, 'threads');
    const threadData = this.message.toJSON();
    const newThread = await addDoc(threadCollection, threadData);
    await updateDoc(doc(threadCollection, newThread.id), { id: newThread.id });
  }


  /**
   * Resets the form and message related variables
   */
  resetFormAndVariables(form: NgForm): void {
    this.chatService.uploadedFileChat = '';
    form.resetForm();
    this.message.content = '';
    this.loading = false;
    this.chatService.isContent = false;
    this.chatService.currentImageUrl = '';
  }


  /**
   * Opens the edit message input.
   * @param {any} threadId - The ID of the thread that contains the message to edit.
   * @param {number} i - The index of the message in the threads array.
   */
  async openEditMessage(threadId: any, i: number): Promise<void> {
    this.inEditMessage = i;
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', threadId);

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
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', threadId);
    await updateDoc(threadDocRef, {
      content: this.threads[i].editMessageContent
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


  /**
   * Deletes a thread message from firestore.
   */
  async deleteMessage(threadId: string): Promise<void> {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', threadId);
    await deleteDoc(threadDocRef);
  }


  /**
   * Add a reaction to a thread.
   */
  async addReaction(threadId: string, reactionType: string, userName: string): Promise<void> {
    const channelDocRef = doc(this.channelCollection, this.currentChannel.id);
    const threadDocRef = doc(channelDocRef, 'threads', threadId);

    const userReactions = await this.getUserReactions(threadDocRef);
    this.updateReaction(userReactions, userName, reactionType);

    await updateDoc(threadDocRef, { userReactions });
  }


  /**
   * Get user reactions from a thread document.
   */
  private async getUserReactions(threadDocRef: DocumentReference<DocumentData>): Promise<Object> {
    const threadSnap = await getDoc(threadDocRef);
    const threadData = threadSnap.data() as Thread;
    return threadData.userReactions || {};
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
   * Opens the threads component to the right to setup the answers.
   * @param _id - ID of the cuurent selected Thread
   */
  openThreads(_id: string): void {
    this.openRightSidenav.emit();
    this.channelService.currentThread_ID = _id;
  }


  /**
   * Opens the edit channel component.
   */
  openEditChannel(): void {
    this.dialog.open(DialogEditChannelComponent);
  }


  /**
   * Opens the channel members component.
   */
  openMembers(): void {
    this.dialog.open(DialogChannelMembersComponent);
  }


  /**
   * Opens the component for adding a new member to the channel.
   */
  openAddNewMembers(): void {
    this.dialog.open(DialogChannelAddNewMembersComponent);
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
  closeEdit(): void {
    this.inEditMessage = null;
  }


  /**
   * Closes the channel content on mobiles
   */
  closeChannelMobile(): void {
    this.openLeftSidenav.emit();
    this.channelService.inDirectMessage = false;
    setTimeout(() => {
      this.channelService.noCurrentChannel = true;
    });
  }


  /**
   * Unsubscribes from all active subscriptions.
   */
  ngOnDestroy(): void {
    this.unsubscribeChannels();
    this.unsubscribeThreads();
  }


  /**
   * Unsubscribes from channel subscription if active.
   */
  private unsubscribeChannels(): void {
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
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