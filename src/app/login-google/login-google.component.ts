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
  user = new User();
  firestore: Firestore = inject(Firestore);

  googleEmail: string;
  googleFirstName: string;
  googleLastName: string;
  googlePicSrc: string;
  generatedPassword: string;

  public clientId = "136417201224-s82t0jk6btp5001rqj6vohm4pkdlfgdn.apps.googleusercontent.com";

  constructor(private router: Router, private accountService: AccountServiceService, private ngZone: NgZone) { }

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

  ngOnDestroy(): void {
    sessionStorage.removeItem('isRefreshed');
  }

  initializeGoogleLogin() {
    if (!sessionStorage.getItem('isRefreshed')) {
      sessionStorage.setItem('isRefreshed', 'true');
      window.location.reload();
    }
  }

  async handleCredentialResponse(response: CredentialResponse) {
    if (!response || typeof response.credential !== 'string') {
      console.error('Invalid JWT token:', response);
      return;
    } else {
      const decodedPayload = this.decodeJWT(response.credential);
      this.googleEmail = decodedPayload.email;
      this.googleFirstName = decodedPayload.given_name;
      this.googleLastName = decodedPayload.family_name;
      this.googlePicSrc = decodedPayload.picture;
      await this.login();
    }
  }

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

  async login() {
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    let userFound = false;
    querySnapshot.forEach(async (queryDocSnapshot) => {
      const userData = queryDocSnapshot.data() as User;

      if (userData.email === this.googleEmail) {
        userFound = true;
        const userDocRef = doc(this.firestore, "users", queryDocSnapshot.id);
        await updateDoc(userDocRef, {
          loggedIn: true
        });

        const userDoc = await getDoc(userDocRef);
        const updatedUserData = userDoc.data() as User;
        console.log('Benutzerdaten nach dem Einloggen:', updatedUserData);
        this.accountService.setLoggedInUser(updatedUserData);

        /// Probetest
        this.accountService.currentUser = updatedUserData;
        this.ngZone.run(() => {
          this.router.navigate(['/main']);
        });
      }
    });
    if (!userFound) {
      await this.createNewUserFromGoogleData();
    } else {
      // this.router.navigate(['/main']);
    }
  }

  async createNewUserFromGoogleData() {
    this.generatePassword();
    const collRef = collection(this.firestore, "users");
    const fullName = `${this.googleFirstName} ${this.googleLastName}`;
    const newUser = await addDoc(collRef, {
      email: this.googleEmail,
      name: fullName,
      password: this.generatedPassword,
      avatarSrc: this.googlePicSrc,
      loggedIn: true,
      isActive: false,
      friends: [],
      channels: []
    });
    await this.addIdToUser(newUser.id);

    this.ngZone.run(() => {
      this.router.navigate(['/main']);
    });
  }

  async addIdToUser(_id: string) {
    try {
      const userDocRef = doc(this.firestore, 'users', _id);
      await setDoc(userDocRef, { id: _id }, { merge: true });

    } catch (error) {
      console.error("Error updating channel:", error);
    }
  }

  generatePassword() {
    const numbers = '0123456789';
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const allCharacters = numbers + uppercaseLetters + lowercaseLetters;

    // Ensure at least one character from each category is included
    let password = [
      numbers[Math.floor(Math.random() * numbers.length)],
      uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)],
      lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)]
    ].join('');

    // Fill the rest of the password length
    for (let i = 4; i < 12; i++) {
      password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    this.generatedPassword = password.split('').sort(() => 0.5 - Math.random()).join(''); // Shuffle the password
  }
}