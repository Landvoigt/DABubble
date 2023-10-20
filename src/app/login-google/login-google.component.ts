import { Component, NgZone, OnInit, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Router } from '@angular/router';
import { Firestore, addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { ChatServiceService } from '../chat-service.service';

@Component({
  selector: 'app-login-google',
  templateUrl: './login-google.component.html',
  styleUrls: ['./login-google.component.scss']
})
export class LoginGoogleComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  /** Google client ID */
  public clientId = "136417201224-s82t0jk6btp5001rqj6vohm4pkdlfgdn.apps.googleusercontent.com";

  user: User = new User();

  constructor(
    public accountService: AccountServiceService,
    private chatService: ChatServiceService,
    private router: Router,
    private ngZone: NgZone) { }


  ngOnInit(): void {
    this.initializeGoogleLogin();
  }


  /**
   * Initialize Google login process.
   */
  initializeGoogleLogin(): void {
    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: true,
        cancel_on_tap_outside: false
      });
      // @ts-ignore
      google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => { });
    };
  }


  /**
   * Handles the response after Google login attempt.
   * @param {CredentialResponse} response - Response from Google after login attempt.
   */
  async handleCredentialResponse(response: CredentialResponse) {
    if (!response || typeof response.credential !== 'string') {
      console.error('Invalid JWT token:', response);
      return;
    } else {
      this.saveGoogleData(this.decodeJWT(response.credential));
      await this.googleLogin();
    }
  }


  /**
   * Save the Google user's decoded JWT payload data.
   * @param {any} decodedPayload - Decoded JWT payload from Google.
   */
  saveGoogleData(decodedPayload: any): void {
    this.user.email = decodedPayload.email;
    this.user.name = `${decodedPayload.given_name} ${decodedPayload.family_name}`;
    this.user.avatarSrc = decodedPayload.picture;
  }


  /**
   * Decodes a JWT.
   * @param {string} JWT - The JWT to be decoded.
   * @returns {any|null} The decoded payload or null if the JWT is invalid.
   */
  decodeJWT(JWT: string) {
    const [headerEncoded, payloadEncoded] = JWT.split('.');
    if (!headerEncoded || !payloadEncoded) {
      console.error('Invalid JWT format:', JWT);
      return null;
    }
    const payloadDecoded = atob(payloadEncoded.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadDecoded);
    return payload;
  }


  /**
   * Login function to authenticate and redirect user.
   */
  async googleLogin(): Promise<void> {
    let userFound = false;
    let userCollectionRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(userCollectionRef);
    querySnapshot.forEach(async (userDoc) => {
      const userData = userDoc.data() as User;
      if (userData.email === this.user.email) {
        userFound = true;
        userData.loggedIn = true;
        await this.setLoggedInStatus(userData);
      }
    });
    if (!userFound) await this.createNewUser();
  }


  /**
   * Sets the user as logged in and updates the user status.
   * @param {any} userData - User data to set as logged in.
   */
  async setLoggedInStatus(userData: any): Promise<void> {
    const userDocRef = doc(this.firestore, "users", userData.id);
    await updateDoc(userDocRef, {
      loggedIn: true,
      isActive: true
    });
    this.accountService.setLoggedInUser(userData);
    // this.accountService.currentUser = userData;
    this.ngZone.run(() => this.router.navigate(['/main']));
  }


  /**
   * Creates a new user entry in Firestore and give the data to the service.
   */
  async createNewUser(): Promise<void> {
    this.generatePassword();
    let userCollectionRef = collection(this.firestore, "users");
    const newUser = await addDoc(userCollectionRef, this.user.toJSON());
    await this.addIdToUser(newUser.id);

    const userDocRef = doc(this.firestore, 'users', newUser.id);
    const userSnapshot = await getDoc(userDocRef);
    const userData = userSnapshot.data() as User;

    this.accountService.setLoggedInUser(userData);
    // this.accountService.currentUser = userData;
    this.ngZone.run(() => this.router.navigate(['/main']));
  }


  /**
   * Adds an ID and the logged in status to the user's Firestore document.
   * @param {string} _id - The ID to be added to the user document.
   */
  async addIdToUser(_id: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', _id);
    await setDoc(userDocRef, { id: _id, loggedIn: true }, { merge: true });
  }


  /**
   * Generates a random password with 12 digits.
   */
  generatePassword(): void {
    const numbers = '0123456789';
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const allCharacters = numbers + uppercaseLetters + lowercaseLetters;
    let password = [
      numbers[Math.floor(Math.random() * numbers.length)],
      uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)],
      lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)]
    ].join('');

    for (let i = 4; i < 12; i++) {
      password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }
    this.user.password = password.split('').sort(() => 0.5 - Math.random()).join('');
  }


  /**
   * Cancels the mainpage intro.
   */
  cancelIntro(): void {
    this.accountService.playIntro = false;
  }
}