import { Component, inject } from '@angular/core';
import { User } from 'src/models/user.class';
import { AccountServiceService } from '../account-service.service';
import { DocumentData, DocumentReference, Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { Router } from '@angular/router';
import { ChatServiceService } from '../chat-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  firestore: Firestore = inject(Firestore);
  userCollection = collection(this.firestore, "users");
  user: User = new User();
  isEmailValid: boolean = false;
  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  showPassword: boolean = false;
  passwordExists: boolean = false;
  isPasswordValid: boolean = false;

  constructor(
    public accountService: AccountServiceService,
    private router: Router,
    public chatService: ChatServiceService) {
  }


  /**
   * Validates a user's email.
   */
  async checkUserEmail(): Promise<void> {
    this.isEmailValid = false;

    if (this.user.email === '' || !this.emailPattern.test(this.user.email)) {
      return;
    }

    const q = query(this.userCollection, where("email", "==", this.user.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      this.isEmailValid = true;
    }
  }


  /**
   * Validates a user's password by checking the entered password against the stored password.
   * It first validates the user email and then if the user exists, it validates the password.
   */
  async checkUserPassword(): Promise<void> {
    this.isPasswordValid = false;

    if (this.user.password === '' || this.user.email === '' || !this.emailPattern.test(this.user.email)) {
      return;
    }

    const q = query(this.userCollection, where("email", "==", this.user.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as User;

      if (userData.password === this.user.password) {
        this.isPasswordValid = true;
      }
    }
  }


  /**
   * Authenticate and log in a user.
   */
  async login(): Promise<void> {
    const { email, password } = this.user;

    if (email && password) {
      try {
        const userDoc = await this.findUserByEmail(email);

        if (!userDoc) {
          console.error("No user found with provided email");
          return;
        }

        const userData = userDoc.data() as User;
        await this.verifyPasswordAndLoginUser(userData, password, userDoc.ref);

      } catch (error) {
        console.error("Error logging in:", error);
      }
    }
  }


  /**
   * Find a user document by email.
   * @param {string} email - The email of the user.
   */
  private async findUserByEmail(email: string) {
    const userQuery = query(this.userCollection, where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);
    return querySnapshot.empty ? null : querySnapshot.docs[0];
  }


  /**
   * Verify the provided password and log the user in if it's correct.
   * @param {User} userData - The data of the user.
   * @param {string} password - The password to be verified.
   * @param {DocumentReference<DocumentData>} userDocRef - Reference to the user document.
   */
  private async verifyPasswordAndLoginUser(userData: User, password: string, userDocRef: DocumentReference<DocumentData>): Promise<void> {
    if (userData.password !== password) {
      throw new Error("Incorrect password");
    }

    await this.updateLoginStatus(userDocRef);
    this.accountService.setLoggedInUser(userData);
    this.router.navigate(['/main']);
  }


  /**
   * Update the login status of a user.
   * @param {DocumentReference<DocumentData>} userDocRef - Reference to the user document.
   */
  private async updateLoginStatus(userDocRef: DocumentReference<DocumentData>): Promise<void> {
    await updateDoc(userDocRef, {
      loggedIn: true,
      isActive: true
    });
  }


  /**
   * Executes the login as guest with a special id and navigates to the mainpage
   */
  async guestLogin(): Promise<void> {
    const guestID = 'ENbhuJkGlQAtqOEKeWw3';
    const userDocRef = doc(this.userCollection, guestID);
    await this.updateLoginStatus(userDocRef);
    const userDoc = await getDoc(userDocRef);
    const updatedUserData = userDoc.data() as User;
    this.accountService.setLoggedInUser(updatedUserData);
    this.router.navigate(['/main']);
  }


  /**
   * Changes the path to google-login.
   */
  goToGoogleLogin(): void {
    this.router.navigate(['/google-login']).then(() => {
      window.location.reload();
    });
  }


  /**
   * Toggles the password visibility.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  /**
   * Cancels the mainpage intro.
   */
  cancelIntro(): void {
    this.accountService.playIntro = false;
  }
}