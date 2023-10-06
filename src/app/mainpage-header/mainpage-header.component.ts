<<<<<<< HEAD
import { Component, ElementRef, EventEmitter, HostListener, inject, Output, Renderer2, ViewChild } from '@angular/core';
=======
import { Component, EventEmitter, Output } from '@angular/core';
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
import { AccountServiceService } from '../account-service.service';
import { Firestore, collection, doc, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { Router } from '@angular/router';
import { ChannelServiceService } from '../channel-service.service';
<<<<<<< HEAD
import { Channel } from 'src/models/channel.class';
import { ChatServiceService } from '../chat-service.service';
import { MainpageChannelsComponent } from '../mainpage-channels/mainpage-channels.component';
import { AppComponent } from '../app.component';
import { AppModule } from '../app.module';
import { Thread } from 'src/models/thread.class';
import { ScreenServiceService } from '../screen-service.service';
import { DialogUserProfileComponent } from '../dialog-user-profile/dialog-user-profile.component';
import { MatDialog } from '@angular/material/dialog';

=======
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8

@Component({
  selector: 'app-mainpage-header',
  templateUrl: './mainpage-header.component.html',
  styleUrls: ['./mainpage-header.component.scss']
})
export class MainpageHeaderComponent {
<<<<<<< HEAD
  @Output() openLeftSidenav = new EventEmitter<void>();
=======
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
  @Output() closeLeftSidenav = new EventEmitter<void>();
  @Output() closeRightSidenav = new EventEmitter<void>();

  showLogoutPopup: boolean = false;
  showProfilePopup: boolean = false;
  showEditProfile: boolean = false;
<<<<<<< HEAD

  isSidenavOpen: boolean = true;
  user: User;
  isUserEmail: boolean;
  search: string;
  userList: any[] = [];
  channelList: any[] = [];
  list: any = [];
  status: string;
  searchValue: string;
  searchResultsName: any = [];
  searchResultsEmail: any = [];
  searchResultsChannel: any = [];
  searchResultsThreads: any = [];
  //selectedThreadId = 'YoTEMmXFTfEI9RwYtWjP';
  //selectedThreadId:any;

  @ViewChild('searchFieldContainer') searchFieldContainer: ElementRef;
=======
  hoverCodeIcon: boolean = false;
  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;
  hoverAddClientIcon: boolean = false;
  isSidenavOpen: boolean = true;
  user: User;
  isUserEmail: boolean;
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8

  constructor(
    public accountService: AccountServiceService,
    private channelService: ChannelServiceService,
    private firestore: Firestore,
<<<<<<< HEAD
    private chatService: ChatServiceService,
    private router: Router,
    public dialog: MatDialog,
    public screenService: ScreenServiceService) {
  }

  ngOnInit() {
    this.chatService.userList$.subscribe((users) => {
      this.userList = users;
    });

    this.chatService.channelList$.subscribe((channels) => {
      this.channelList = channels;
    });
    this.getStatusUser();
    // this.checkChannelsThreadsContent();

    // const threadId = this.chatService.getThreadId();
    // if (threadId) {
    //   // Jetzt kannst du threadId verwenden, um weitere Operationen durchzuführen
    //   console.log('threadIddddddddddddddd:', threadId);
    // }





    this.searchFieldContainer = new ElementRef(null);

  }

  /**
   * Closes the channels sidenav.
   */
  closeChannelSection(): void {
=======
    private router: Router) {
  }

  closeChannelSection() {
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
    this.closeLeftSidenav.emit();
    this.isSidenavOpen = !this.isSidenavOpen;
  }

<<<<<<< HEAD
  
=======
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
  /**
   * Toggles the visibility of the logout popup.
   */
  toggleLogoutPopup(): void {
<<<<<<< HEAD
    if (this.screenService.mobileMode) {
      this.dialog.closeAll();
    }
=======
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
    this.showLogoutPopup = !this.showLogoutPopup;
  }


  /**
<<<<<<< HEAD
   * Closes the logout popup and resets the state of the edit profile flag.
   */
=======
  * Closes the logout popup and resets the state of the edit profile flag.
  */
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
  closeLogoutPopup(): void {
    this.showLogoutPopup = false;
    this.showEditProfile = false;
  }


  /**
   * Toggles the visibility of the profile information popup.
   */
  toggleProfilePopup(): void {
    this.showProfilePopup = !this.showProfilePopup;
  }


  /**
   * Closes the profile information popup.
   */
  closeProfilePopup(): void {
    this.showProfilePopup = false;
  }


  /**
   * Toggles the edit profile mode.
   */
  toggleEditProfile(): void {
    this.showEditProfile = !this.showEditProfile;
  }


<<<<<<< HEAD
  /**
   * Closes all active chat sessions and the sidenavs.
   */
  closeAllChats(): void {
    this.closeRightSidenav.emit();
    if (this.screenService.tabletMode) {
      this.openLeftSidenav.emit();
    }
=======
  closeAllChats() {
    this.closeRightSidenav.emit();
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
    this.channelService.inDirectMessage = false;
    setTimeout(() => {
      this.channelService.noCurrentChannel = true;
    });
  }

<<<<<<< HEAD

  /**
   * Saves the edited user information and toggles the profile editing mode.
   */
  saveEditedUserInformation(): void {
    this.toggleEditProfile();
    ///// updateDoc own profile oder so
  }


  /**
   * Logs out the current user and updates the user's status in the database.
   * @returns {Promise<void>} A promise indicating the completion of the logout operation.
   */
  async logoutUser(): Promise<void> {
=======
  saveEditedUserInformation() {
    this.toggleEditProfile();
  }

  async logoutUser() {
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    querySnapshot.forEach(async (queryDocSnapshot) => {
      const userData = queryDocSnapshot.data() as User;
      if (userData.email === this.accountService.getLoggedInUser().email) {
        const userDocRef = doc(this.firestore, 'users', queryDocSnapshot.id);
        await updateDoc(userDocRef, {
          loggedIn: false
        });
        this.accountService.clearLoggedInUser();
        this.checkIntro();
        this.router.navigate(['/']);
      }
    });
  }

<<<<<<< HEAD

  async generalSearch() {
    this.clearSearchResults();
    this.list = [];
    this.searchValue = this.search?.toLowerCase();
    await this.fetchUserDataAndChannelData();
    await this.fetchThreadsData();
    if (this.searchValue) {
      this.updateSearchResults();
      //this.fetchThreadsFromChannelsCollection();
    }

  }


  async fetchUserDataAndChannelData() {
    await this.fetchUserData();
    await this.fetchChannelData();

  }


  async fetchUserData() {
    const collRefUsers = collection(this.firestore, "users");
    const querySnapshotUsers = await getDocs(collRefUsers);
    querySnapshotUsers.forEach((queryDocSnapshotUsers) => {
      const userData = queryDocSnapshotUsers.data() as User;
      this.list.push({ type: "user", data: userData });
    });
  }


  async fetchChannelData() {
    const collRefChannels = collection(this.firestore, "channels");
    const querySnapshotChannels = await getDocs(collRefChannels);
    querySnapshotChannels.forEach((queryDocSnapshotChannels) => {
      const channelData = queryDocSnapshotChannels.data() as Channel;
      this.list.push({ type: "channel", data: channelData });
    });
  }


  async fetchThreadsData() {
    const collRefThreads = collection(this.firestore, "threads");
    const querySnapshotThreads = await getDocs(collRefThreads);
    querySnapshotThreads.forEach((queryDocSnapshotThreads) => {
      const threadData = queryDocSnapshotThreads.data() as Thread;
      this.list.push({ type: "thread", data: threadData });
    });
  }


  addSearchFieldStyles() {
    this.searchFieldContainer.nativeElement.classList.add('border-radius-bottom-none');
  }


  removeSearchFieldStyles() {
    this.searchFieldContainer.nativeElement.classList.remove('border-radius-bottom-none');
  }


  clearSearchResults() {
    this.searchResultsName = [];
    this.searchResultsEmail = [];
    this.searchResultsChannel = [];
    this.searchResultsThreads = [];
  }


  updateSearchResults() {
    this.searchResultsName = this.filterByName();
    this.searchResultsEmail = this.filterByEmail();
    this.searchResultsChannel = this.filterByChannel();
    this.fetchThreadsFromChannelsCollection();
  }


  filterByThreads() {

    return this.list
      .filter(item => item.type === "thread")
      .filter(item => {
        const threadContent = item.data.content.toLowerCase();
        return threadContent.includes(this.searchValue);
      });
  }


  filterByName() {
    return this.list
      .filter(item => item.type === "user")
      .filter(item => {
        const userName = item.data.name.toLowerCase();
        const searchValue = this.searchValue.toLowerCase();
        const nameParts = userName.split(" ");
        const firstName = nameParts[0].toLowerCase();
        const lastName = nameParts[1].toLowerCase();
        if (firstName.startsWith(searchValue) || lastName.startsWith(searchValue)) {
          return true;
        }
        return userName.startsWith(searchValue);
      });

  }


  filterByEmail() {
    return this.list
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


  filterByChannel() {
    return this.list
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



  async fetchThreadsFromChannelsCollection() {
    const collRefChannels = collection(this.firestore, "channels");
    const querySnapshotChannels = await getDocs(collRefChannels);

    for (const queryDocSnapshotChannels of querySnapshotChannels.docs) {
      const channelData = queryDocSnapshotChannels.data() as Channel;
      const channelId = queryDocSnapshotChannels.id;

      const collRefThreads = collection(collRefChannels, channelId, "threads");
      const querySnapshotThreads = await getDocs(collRefThreads);

      for (const queryDocSnapshotThreads of querySnapshotThreads.docs) {
        const threadData = queryDocSnapshotThreads.data() as Thread;
        const threadContent = threadData.content.toLowerCase();
        const threadId = queryDocSnapshotThreads.id;
        if (threadContent.includes(this.searchValue.toLowerCase())) {
          this.searchResultsThreads.push({
            channelId: channelId,
            channelName: channelData.name,
            channelDescription: channelData.description,
            channelOwner: channelData.owner,
            channelDate: channelData.date,
            channelMembers: channelData.members,
            threadId: threadId,
            threadName: threadData.ownerName,
            threadContent: threadContent,
          });
        }
      }
    }
  }




  // async checkChannelsThreadsContent() {  // Test
  //   const collRefChannels = collection(this.firestore, "channels");
  //   const querySnapshotChannels = await getDocs(collRefChannels);

  //   for (const queryDocSnapshotChannels of querySnapshotChannels.docs) {
  //     const channelData = queryDocSnapshotChannels.data() as Channel;
  //     const channelId = queryDocSnapshotChannels.id;

  //     const collRefThreads = collection(collRefChannels, channelId, "threads");
  //     const querySnapshotThreads = await getDocs(collRefThreads);

  //     for (const queryDocSnapshotThreads of querySnapshotThreads.docs) {
  //       const threadData = queryDocSnapshotThreads.data() as Thread;
  //       const threadContent = threadData.content;
  //       const threadId = queryDocSnapshotThreads.id;

  //       console.log(`Channel Name: ${channelData.name}`);
  //       console.log(`Channel ID: ${channelId}`);
  //       console.log(`Thread Name: ${threadData.ownerName}`);
  //       console.log(`Thread ID: ${threadId}`);
  //       console.log(`Thread Content: ${threadContent}`);
  //     }
  //   }
  // }



  onClickDirectMessage(user: User, i: number) {
    this.accountService.triggerOpenDirectMessage(user);
    this.search = '';
    this.generalSearch();
  }


  onClickOpenChannelArea(channel: Channel) {
    this.accountService.triggerOpenChannelArea(channel);
    this.search = '';
    this.generalSearch();
  }


  async onClickOpenChannelAreaAndThread(currentThread: any) {
    const selectedThread = this.searchResultsThreads.find((thread) => thread.threadId === currentThread.threadId);
    if (selectedThread) {
      const channelObject = this.createChannelObject(selectedThread);
      this.accountService.triggerOpenChannelArea(channelObject);
      setTimeout(() => {
        const threadContentElement = document.getElementById(selectedThread.threadId);
        this.applyStyling(threadContentElement);
        setTimeout(() => {
          this.resetStyling(threadContentElement);
        }, 2000);
        this.scrollToElement(threadContentElement);
      }, 300);
    }
    this.search = '';
    this.generalSearch();
  }


  createChannelObject(thread: any): Channel {
    const channelObject = new Channel();
    channelObject.id = thread.channelId;
    channelObject.name = thread.channelName;
    channelObject.description = thread.channelDescription;
    channelObject.owner = thread.channelOwner;
    channelObject.date = thread.channelDate;
    channelObject.members = [];
    return channelObject;
  }


  applyStyling(element: HTMLElement | null) {
    if (element) {
      element.style.width = '100%';
      element.style.border = '1px solid red';
      element.style.borderRadius = '24px';
      element.style.padding = '8px';
    }
  }


  resetStyling(element: HTMLElement | null) {
    if (element) {
      element.style.width = '';
      element.style.border = '';
      element.style.borderRadius = '';
      element.style.padding = '';
    }
  }

  
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


  // async onClickOpenChannelAreaAndThread(currentThread: any) {
  //   const selectedThread = this.searchResultsThreads.find((thread) => thread.threadId === currentThread.threadId);
  //   if (selectedThread) {
  //     const channelObject = new Channel();
  //     channelObject.id = selectedThread.channelId;
  //     channelObject.name = selectedThread.channelName;
  //     channelObject.description = selectedThread.channelDescription;
  //     channelObject.owner = selectedThread.channelOwner;
  //     channelObject.date = selectedThread.channelDate;
  //     channelObject.members = [];

  //     this.accountService.triggerOpenChannelArea(channelObject);

  //     setTimeout(() => {
  //       if (selectedThread) {
  //         const threadContentElement = document.getElementById(selectedThread.threadId);
  //         console.log(threadContentElement);

  //         threadContentElement.style.width = '100%';
  //         threadContentElement.style.border = '1px solid red';
  //         threadContentElement.style.borderRadius = '24px';
  //         threadContentElement.style.padding = '8px';
  //         //threadContentElement.style.setProperty('color', 'red', 'important');

  //         setTimeout(() => {
  //           threadContentElement.style.width = '';
  //           threadContentElement.style.border = '';
  //           threadContentElement.style.borderRadius = '';
  //           threadContentElement.style.padding = '';
  //         }, 2000);

  //         if (threadContentElement) {
  //           const container = threadContentElement.parentElement;
  //           const containerHeight = container.clientHeight;
  //           const elementHeight = threadContentElement.clientHeight;

  //           const scrollOptions: ScrollIntoViewOptions = {
  //             behavior: 'smooth',
  //             block: 'center',
  //             inline: 'nearest',
  //           };
  //           const scrollOffsetInPixels = (elementHeight - containerHeight) / 2;
  //           threadContentElement.scrollIntoView(scrollOptions);
  //           threadContentElement.scrollTop += scrollOffsetInPixels;
  //         }
  //       }
  //     }, 300);
  //   }
  //   this.search = '';
  //   this.generalSearch();
  // }


  /**
   * If the click occurs outside of the
   * searchFieldContainer element, it clears the search 
   * input field and triggers the generalSearch function.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.screenService.tabletMode) {
      if (this.searchFieldContainer.nativeElement &&
        !this.searchFieldContainer.nativeElement.contains(event.target as Node)) {
        this.search = '';
        this.generalSearch();
      }
    }
  }


  openDialogProfileDmHeader(user:User) {
    this.chatService.ownerData = user;
    this.chatService.ownerData.ownerAvatarSrc = user.avatarSrc;
    this.chatService.ownerData.ownerName = user.name;
    this.chatService.ownerData.ownerEmail = user.email;
    this.dialog.open(DialogUserProfileComponent, { restoreFocus: false });
  }


  /**
   * Checks if the introduction is shown and sets its status to false.
   */
  checkIntro(): void {
    this.accountService.isIntro = false;
  }

  getStatusUser() {
    if (this.accountService.loggedInUser.loggedIn) {
      this.status = 'Online';
    } else if (this.accountService.loggedInUser.isActive) {
      this.status = 'Active';
    } else {
      this.status = 'Offline';
    }
  }

  isGoogleEmail(): boolean {
    const email = this.accountService.getLoggedInUser().email;
    return email.includes('gmail') || email.includes('googlemail');
  }
=======
  checkIntro() {
    this.accountService.isIntro = false;
  }
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
}