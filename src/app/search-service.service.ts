import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs } from '@angular/fire/firestore';
import { Channel } from 'src/models/channel.class';
import { Thread } from 'src/models/thread.class';
import { User } from 'src/models/user.class';
import { ChannelServiceService } from './channel-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatServiceService } from './chat-service.service';
import { DialogUserProfileComponent } from './dialog-user-profile/dialog-user-profile.component';

@Injectable({
  providedIn: 'root'
})
export class SearchServiceService {
  firestore: Firestore = inject(Firestore);
  userCollection = collection(this.firestore, 'users');
  channelCollection = collection(this.firestore, 'channels');

  search: string = '';
  searchValue: string = '';
  searchResultsName: any[] = [];
  searchResultsEmail: any[] = [];
  searchResultsChannel: any[] = [];
  searchResultsThreads: any[] = [];
  resultList: any[] = [];

  constructor(
    private channelService: ChannelServiceService,
    private chatService: ChatServiceService,
    public dialog: MatDialog,) { }


  /**
   * Performs a general search based on the current search value.
   * Fetches data of type 'user', 'channel', and 'thread', then updates search results.
   */
  async generalSearch(): Promise<void> {
    await this.clearSearchResults();
    this.searchValue = this.search?.toLowerCase();

    await this.fetchData<User>('users', 'user');
    await this.fetchData<Channel>('channels', 'channel');
    await this.fetchDataThreads();

    if (this.searchValue) {
      await this.updateSearchResults();
    }
  }


  /**
   * Fetches and stores data from a specified Firestore collection.
   * @param {string} col - The name of the collection to fetch data from.
   * @param {string} type - The type of the data to be pushed into resultList.
   * @template T - The type of the data to be fetched.
   */
  async fetchData<T>(col: string, type: string): Promise<void> {
    const collRef = collection(this.firestore, col);
    const querySnapshot = await getDocs(collRef);
    querySnapshot.forEach((queryDocSnapshot) => {
      const data = queryDocSnapshot.data() as T;
      this.resultList.push({ type: type, data: data });
    });
  }


  /**
   * Fetches and stores thread data from all channels colletions.
   */
  async fetchDataThreads() {
    const collRef = collection(this.firestore, 'channels');
    const querySnapshot = await getDocs(collRef);

    const fetchThreadsPromises = querySnapshot.docs.map(async (queryDocSnapshot) => {
      const data = queryDocSnapshot.data() as Channel;

      const channelId = data.id;
      const threadRef = collection(collRef, channelId, 'threads');

      const threadSnapshot = await getDocs(threadRef);
      threadSnapshot.forEach((threadDocSnapshot) => {
        const threadData = threadDocSnapshot.data() as Thread;
        let type = 'thread';
        this.resultList.push({ type: type, data: threadData });
      });
    });

    await Promise.all(fetchThreadsPromises);
  }


  /**
   * Clears all search result arrays and resultList.
   */
  async clearSearchResults() {
    this.searchResultsName = [];
    this.searchResultsEmail = [];
    this.searchResultsChannel = [];
    this.searchResultsThreads = [];
    this.resultList = [];
  }


  /**
   * Updates the search results by applying filters and fetching threads.
   */
  async updateSearchResults(): Promise<void> {
    this.searchResultsName = this.filterByName();
    this.searchResultsEmail = this.filterByEmail();
    this.searchResultsChannel = this.filterByChannel();
    await this.fetchThreads();
  }


  /**
   * Filters users in resultList based on name matching with searchValue.
   */
  filterByName() {
    return this.resultList
      .filter(item => item.type === "user")
      .filter(item => {
        const userName = item.data.name.toLowerCase();
        const searchValue = this.searchValue.toLowerCase();
        const nameParts = userName.split(" ");
        const firstName = nameParts[0].toLowerCase();

        if (nameParts.length === 1) {
          if (firstName.startsWith(searchValue)) {
            return true;
          }
        } else if (nameParts.length >= 2) {
          const lastName = nameParts[1].toLowerCase();
          if (firstName.startsWith(searchValue) || lastName.startsWith(searchValue)) {
            return true;
          }
        }
        return false;
      });
  }


  /**
   * Filters users in resultList based on email matching with searchValue.
   */
  filterByEmail() {
    return this.resultList
      .filter(item => item.type === "user")
      .filter(item => {
        const userEmail = item.data.email.toLowerCase();
        const userEmailArray = userEmail.split(" ");
        const userEmailFirstLetter = userEmailArray[0];
        return (
          userEmailFirstLetter.startsWith(this.searchValue) ||
          item.data.email.startsWith(this.searchValue)
        );
      });
  }


  /**
   * Filters channels in resultList based on channel name matching with searchValue.
   */
  filterByChannel() {
    return this.resultList
      .filter(item => item.type === "channel")
      .filter(item => {
        const channel = item.data.name.toLowerCase();
        const channelArray = channel.split(" ");
        const channelFirstLetter = channelArray[0];
        if (channelFirstLetter.startsWith(this.searchValue)) {
          return true;
        }
        return (
          channel.startsWith(this.searchValue)
        );
      });
  }


  /**
   * Fetches threads and updates searchResultsThreads with threads matching the searchValue.
   */
  async fetchThreads(): Promise<void> {
    const querySnapshotChannels = await getDocs(this.channelCollection);
    for (const queryDocSnapshotChannel of querySnapshotChannels.docs) {
      const channelId = queryDocSnapshotChannel.id;

      const collRefThreads = collection(this.channelCollection, channelId, "threads");
      const querySnapshotThreads = await getDocs(collRefThreads);

      for (const queryDocSnapshotThread of querySnapshotThreads.docs) {
        const threadData = queryDocSnapshotThread.data() as Thread;
        const threadContent = threadData.content.toLowerCase();

        if (threadContent.includes(this.searchValue.toLowerCase())) {
          this.searchResultsThreads.push(threadData);
        }
      }
    }
  }


  /**
   * Is set to true when there is no result found.
   */
  noSearchResult() {
    return this.searchResultsName.length > 0 ||
      this.searchResultsChannel.length > 0 || this.searchResultsEmail.length > 0 ||
      this.searchResultsThreads.length > 0;
  }


  /**
   * Opens a direct message with the specified user and triggers a general search.
   * @param {User} user - The user with whom to open a direct message.
   */
  openDirectMessage(user: User): void {
    this.channelService.newDmPartner.next(user);
    this.search = '';
    this.generalSearch();
  }


  /**
   * Opens a specified channel area and triggers a general search.
   * @param {Channel} channel - The channel to be opened.
   */
  openChannelArea(channel: Channel): void {
    this.channelService.newChannel.next(channel);
    this.search = '';
    this.generalSearch();
  }


  /**
   * Opens a specified thread, navigates to it, and triggers a general search.
   * @param {any} currentThread - The thread to be opened.
   */
  async openThread(currentThread: any): Promise<void> {
    console.log(currentThread);
    const selectedThread = this.searchResultsThreads.find((thread) => thread.id === currentThread.id);
    if (selectedThread) {
      const channelDocument = doc(this.channelCollection, selectedThread['channelId']);
      const channelDocRef = await getDoc(channelDocument);
      const channelData = channelDocRef.data() as Channel;
      this.channelService.newChannel.next(channelData);

      setTimeout(() => {
        const threadContentElement = document.getElementById(selectedThread.id);
        this.scrollToElement(threadContentElement);
      }, 300);
    }
    this.search = '';
    this.generalSearch();
  }


  /**
   * Smoothly scrolls to the specified HTML element.
   * @param {HTMLElement | null} element - The element to scroll to.
   */
  scrollToElement(element: HTMLElement | null) {
    if (element) {
      const container = element.parentElement;
      const containerHeight = container.clientHeight;
      const elementHeight = element.clientHeight;
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      };
      const scrollOffsetInPixels = (elementHeight - containerHeight) / 2;
      element.scrollIntoView(scrollOptions);
      element.scrollTop += scrollOffsetInPixels;
    }
  }


  /**
   * Takes the information in the thread to open the profile dialog. 
   */
  openDialogProfile(thread: Thread) {
    this.chatService.ownerData = thread;
    this.dialog.open(DialogUserProfileComponent, { restoreFocus: false });
  }


  /**
   * Extracts the needed information from of a specific user to open the profile dialog.
   */
  extractUserInformation(user: User) {
    let content = new Thread;
    content.ownerName = user.name,
      content.ownerAvatarSrc = user.avatarSrc,
      content.ownerEmail = user.email,
      content.ownerID = user.id
    this.openDialogProfile(content);
  }
}
