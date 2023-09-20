import { Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc } from '@angular/fire/firestore';
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { User } from 'src/models/user.class';
import { Router } from '@angular/router';
import { AccountServiceService } from '../account-service.service';

@Component({
  selector: 'app-login-google',
  templateUrl: './login-google.component.html',
  styleUrls: ['./login-google.component.scss']
})
export class LoginGoogleComponent implements OnInit, OnDestroy {
  /** Firestore instance for Firebase interactions */
  firestore: Firestore = inject(Firestore);
  /** Collection reference for users */
  userCollectionRef = collection(this.firestore, "users");
  /** User model instance */
  user = new User();
  /** Google client ID */
  public clientId = "136417201224-s82t0jk6btp5001rqj6vohm4pkdlfgdn.apps.googleusercontent.com";

  /**
  * @param {Router} router - Angular router instance for navigation.
  * @param {AccountServiceService} accountService - Service responsible for account-related functionalities.
  * @param {NgZone} ngZone - Angular zone instance for running tasks inside Angular.
  */
  constructor(private router: Router, private accountService: AccountServiceService, private ngZone: NgZone) { }


  /**
  * Opens the google login cross site popup and waites for a response.
  */
  ngOnInit(): void {
    this.initializeGoogleLogin();
    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      // @ts-ignore
      google.accounts.id.renderButton(
        // @ts-ignore
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", width: "100%" }
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => { });
    };
  }


  /**
  * Initialize Google login process.
  */
  initializeGoogleLogin() {
    if (!sessionStorage.getItem('isRefreshed')) {
      sessionStorage.setItem('isRefreshed', 'true');
      window.location.reload();
    }
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
      await this.saveGoogleData(this.decodeJWT(response.credential));
      await this.login();
    }
  }


  /**
  * Save the Google user's decoded JWT payload data.
  * @param {any} decodedPayload - Decoded JWT payload from Google.
  */
  async saveGoogleData(decodedPayload: any) {
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
  async login() {
    let userFound = false;
    const querySnapshot = await getDocs(this.userCollectionRef);
    querySnapshot.forEach(async (userDoc) => {
      const userData = userDoc.data() as User;
      if (userData.email === this.user.email) {
        userFound = true;
        await this.setLoggedInStatus(userData);
      }
    });
    if (!userFound) await this.createNewUser();
  }


  /**
  * Sets the user as logged in and updates the user status.
  * @param {any} userData - User data to set as logged in.
  */
  async setLoggedInStatus(userData: any) {
    const userDocRef = doc(this.firestore, "users", userData.id);
    await updateDoc(userDocRef, { loggedIn: true });
    this.accountService.setLoggedInUser(userData);
    this.accountService.currentUser = userData;
    this.ngZone.run(() => this.router.navigate(['/main']));
  }


  /**
  * Creates a new user entry in Firestore and give the data to the service.
  */
  async createNewUser() {
    this.generatePassword();

    const newUser = await addDoc(this.userCollectionRef, this.user.toJSON());
    await this.addIdToUser(newUser.id);

    const userDocRef = doc(this.firestore, 'users', newUser.id);
    const userSnapshot = await getDoc(userDocRef);
    const userData = userSnapshot.data() as User;

    this.accountService.setLoggedInUser(userData);
    this.accountService.currentUser = userData;
    this.ngZone.run(() => this.router.navigate(['/main']));
  }



  /**
   * Adds an ID and the logged in status to the user's Firestore document.
   * @param {string} _id - The ID to be added to the user document.
   */
  async addIdToUser(_id: string) {
    const userDocRef = doc(this.firestore, 'users', _id);
    await setDoc(userDocRef, { id: _id, loggedIn: true }, { merge: true });
  }


  /**
  * Generates a random password with 12 digits.
  */
  generatePassword() {
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
   * Removes the 'isRefreshed' item from the sessionStorage.
   */
  ngOnDestroy(): void {
    sessionStorage.removeItem('isRefreshed');
  }
}