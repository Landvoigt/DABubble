import { Component, EventEmitter, Output } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Firestore, collection, doc, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mainpage-header',
  templateUrl: './mainpage-header.component.html',
  styleUrls: ['./mainpage-header.component.scss']
})
export class MainpageHeaderComponent {
  @Output() closeEvent = new EventEmitter<void>();

  showLogoutPopup: boolean = false;
  showProfilePopup: boolean = false;
  showEditProfile: boolean = false;
  hoverCodeIcon: boolean = false;
  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;
  hoverAddClientIcon: boolean = false;
  isSidenavOpen: boolean = true;
  user: User;
  isUserEmail: boolean;

  constructor(public accountService: AccountServiceService,
    private firestore: Firestore, private router: Router) {
  }

  closeChannelSection() {
    this.closeEvent.emit();
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  /**
   * Toggles the visibility of the logout popup.
   */
  toggleLogoutPopup(): void {
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

  saveEditedUserInformation() {
    /// firebase save
    this.toggleEditProfile();
  }

  async logoutUser() {
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    querySnapshot.forEach(async (queryDocSnapshot) => {
      const userData = queryDocSnapshot.data() as User;
      if (userData.email === this.accountService.getLoggedInUser().email) {
        const userDocRef = doc(this.firestore, 'users', queryDocSnapshot.id);
        await updateDoc(userDocRef, {
          loggedIn: false
        });
        this.checkIntro();
        this.router.navigate(['/']);
      }
    });
  }

  checkIntro() {
    this.accountService.isIntro = false;
  }
}