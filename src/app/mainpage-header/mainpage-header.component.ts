import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Firestore, collection, doc, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { Router } from '@angular/router';
import { ChannelServiceService } from '../channel-service.service';
import { ScreenServiceService } from '../screen-service.service';
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { BannerServiceService } from '../banner-service.service';
import { SearchServiceService } from '../search-service.service';
import { ChatServiceService } from '../chat-service.service';


@Component({
  selector: 'app-mainpage-header',
  templateUrl: './mainpage-header.component.html',
  styleUrls: ['./mainpage-header.component.scss']
})
export class MainpageHeaderComponent {
  @Output() openLeftSidenav = new EventEmitter<void>();
  @Output() closeLeftSidenav = new EventEmitter<void>();
  @Output() closeRightSidenav = new EventEmitter<void>();

  firestore: Firestore = inject(Firestore);
  userCollection = collection(this.firestore, 'users');
  channelCollection = collection(this.firestore, 'channels');

  showLogoutPopup: boolean = false;
  showProfilePopup: boolean = false;
  showEditProfile: boolean = false;

  name: string = '';
  email: string = '';
  isExistingEmail: boolean = false;
  isEmailValid: boolean = false;
  isNameEmpty: boolean = false;
  isNameValid: boolean = false;
  namePattern: RegExp = /^[a-zA-Z\süöäßÜÖÄ]*$/;
  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  isSidenavOpen: boolean = true;
  user: User = new User();

  status: string = '';
  colorBlue: boolean = false;
  colorGreen: boolean = false;
  colorGray: boolean = false;

  @ViewChild('searchFieldContainer') searchFieldContainer: ElementRef;

  constructor(
    public accountService: AccountServiceService,
    private channelService: ChannelServiceService,
    private router: Router,
    public dialog: MatDialog,
    public screenService: ScreenServiceService,
    private bannerService: BannerServiceService,
    public searchService: SearchServiceService,
    public chatService: ChatServiceService) {
    this.name = this.accountService.getLoggedInUser().name;
    this.email = this.accountService.getLoggedInUser().email;
  }


  /**
   * Gets the search field to access it and executes the online status check
   */
  ngOnInit() {
    this.searchFieldContainer = new ElementRef(null);
    this.statusCheck();
  }


  /**
   * Subscribes to changes in the status of the user.
   */
  statusCheck() {
    this.accountService.userData$.subscribe((data) => {
      const user = data.find((element) => element.email === this.accountService.getLoggedInUser().email);
      if (user) {
        this.colorGreen = user.loggedIn && !user.isActive;
        this.colorBlue = user.loggedIn && user.isActive;
        this.colorGray = !user.loggedIn && !user.isActive;
        this.getStatusUser();
      }
    });
  }


  /**
   * Closes the channels sidenav.
   */
  closeChannelSection(): void {
    this.closeLeftSidenav.emit();
    this.isSidenavOpen = !this.isSidenavOpen;
  }


  /**
   * Toggles the visibility of the logout popup.
   */
  toggleLogoutPopup(): void {
    if (this.screenService.mobileMode) {
      this.dialog.closeAll();
    }
    this.showLogoutPopup = !this.showLogoutPopup;
  }


  /**
   * Closes the logout popup and resets the state of the edit profile flag.
   */
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


  /**
   * Closes all active chat sessions and the sidenavs.
   */
  closeAllChats(): void {
    this.closeRightSidenav.emit();
    if (this.screenService.tabletMode) {
      this.openLeftSidenav.emit();
    }
    this.channelService.inDirectMessage = false;
    setTimeout(() => {
      this.channelService.noCurrentChannel = true;
    });
  }


  /**
   * Check if the email entered during account creation is valid and not already in use.
   */
  async checkUserEmail() {
    this.isEmailValid = false;
    this.isExistingEmail = false;

    if (this.email === '' || !this.emailPattern.test(this.email)) {
      return;
    }

    const collRef = collection(this.firestore, "users");
    const q = query(collRef, where("email", "==", this.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      this.isExistingEmail = true;
    } else {
      this.isEmailValid = true;
    }
  }


  /**
   * Validate the username based on predefined patterns.
   */
  checkUserName() {
    this.isNameValid = false;
    this.isNameEmpty = false;
    if (this.namePattern.test(this.name)) {
      this.isNameValid = true;
    }
    if (this.name === '') {
      this.isNameEmpty = true;
    }
  }


  /**
   * Saves the edited user information and toggles the profile editing mode.
   */
  async saveEditedUserInformation(form: NgForm): Promise<void> {
    const userColRef = doc(this.firestore, "users", this.accountService.getLoggedInUser().id);
    if (form.valid) {
      await updateDoc(userColRef, {
        name: this.name,
        email: this.email
      });
    };
    this.accountService.clearLoggedInUser();
    const updatedUser = await getDoc(userColRef);
    const userData = updatedUser.data() as User;
    this.accountService.setLoggedInUser(userData);
    this.toggleEditProfile();
    this.bannerService.show('Profil aktualisiert');
    // this.bannerService.show('Profile update complete');
  }


  /**
   * Logs out the current user and updates the user's status in the database.
   * @returns {Promise<void>} A promise indicating the completion of the logout operation.
   */
  async logoutUser(): Promise<void> {
    const userDocRef = doc(this.firestore, "users", this.accountService.getLoggedInUser().id);
    await updateDoc(userDocRef, {
      isActive: false,
      loggedIn: false
    });
    await this.cleanStorage();
    this.accountService.clearLoggedInUser();
    this.router.navigate(['/']);
    this.accountService.playIntro = false;
    this.channelService.noCurrentChannel = true;
    this.channelService.inDirectMessage = false;
  }


  /**
   * Runs storage clean functions.
   */
  async cleanStorage() {
    if (this.accountService.getLoggedInUser().id === "sDRgI7I4noOgnv9Axh58" || this.accountService.getLoggedInUser().id === "mR7i5bhdzHTeIrCN5O7C") {
      this.chatService.cleaningDataInProgress = true;
      await this.chatService.cleanupStorage();
      this.chatService.cleaningDataInProgress = false;
    }
  }


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
        this.searchService.search = '';
        this.searchService.generalSearch();
      }
    }
  }


  /**
   * Checks if the introduction is shown and sets its status to false.
   */
  checkIntro(): void {
    this.accountService.playIntro = false;
  }


  /**
   * Defines the status the user currently has.
   */
  getStatusUser() {
    if (this.colorGreen) {
      this.status = 'Online';
    } if (this.colorBlue) {
      this.status = 'Active';
    } if (this.colorGray) {
      this.status = 'Offline';
    }
  }


  /**
   * Checks if the login was a google login.
   */
  isGoogleEmail(): boolean {
    const email = this.accountService.getLoggedInUser().email;
    return email.includes('gmail') || email.includes('googlemail');
  }


  /**
   * Checks if the login was a guest login.
   */
  isGuest(): boolean {
    const name = this.accountService.getLoggedInUser().name;
    return name === 'Guest';
  }
}