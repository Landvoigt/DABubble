import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'src/models/user.class'

@Injectable({
  providedIn: 'root'
})
export class AccountServiceService {
  firestore: Firestore = inject(Firestore);

  loggedInUser: User | null = null;
  localStorageKey: string = 'loggedInUser';
  localStorageKeyActive: string = 'userActivity';

  emailResetPassword: any = '';

  playIntro: boolean = true;

  newUser: User = new User();
  policyAccepted: boolean = false;

  isNameValid: boolean = false;
  isNameEmpty: boolean = false;

  isEmailValid: boolean = false;
  isExistingEmail: boolean = false;

  showPassword: boolean = false;
  isPasswordValid: boolean = false;
  isPasswordEmpty: boolean = false;

  namePattern: RegExp = /^[a-zA-Z\süöäßÜÖÄ]*$/;
  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  resetEmail: string = '';

  private userDataJsonSubject = new BehaviorSubject<User[]>([]);
  userData$: Observable<User[]> = this.userDataJsonSubject.asObservable();

  constructor() {
    this.parseLoggedInUser();
    this.initializeUserData();
    this.newUser.avatarSrc = 'assets/img/avatar/avatar_default.png';
  }


  /**
   * Parse and set the logged-in user from local storage.
   */
  parseLoggedInUser() {
    const storedUser = localStorage.getItem(this.localStorageKey);
    if (storedUser) {
      this.loggedInUser = JSON.parse(storedUser);
    } else {
      this.loggedInUser = null;
    }
  }


  /**
   * Subscribes to the user data for the status.
   */
  initializeUserData() {
    const collRef = collection(this.firestore, 'users');

    onSnapshot(collRef, (querySnapshot) => {
      const userDataArray: User[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const userData = docSnapshot.data() as User;
        userDataArray.push(userData);
      });
      this.userDataJsonSubject.next(userDataArray);
    });
  }


  /**
   * Store the logged-in user data into local storage.
   * @param {User} user - The user object to be set as the logged-in user.
   */
  setLoggedInUser(user: User) {
    this.loggedInUser = user;
    localStorage.setItem(this.localStorageKey, JSON.stringify(user));
  }


  /**
   * Retrieve the currently logged-in user data.
   */
  getLoggedInUser() {
    return this.loggedInUser || new User();
  }


  /**
   * Clear the logged-in user data from local storage and the application state.
   */
  clearLoggedInUser() {
    this.loggedInUser = null;
    localStorage.removeItem(this.localStorageKey);
    localStorage.removeItem(this.localStorageKeyActive);
  }


  /**
   * Handle image loading errors by setting a fallback image URL.
   * @param {Event} event - The event object from the error event.
   * @param {string} fallbackUrl - The URL of the fallback image.
   */
  handleImageError(event: Event, fallbackUrl: string) {
    const image = event.target as HTMLImageElement;
    image.onerror = null;  // Remove the error handler to prevent looping in case the fallback also fails.
    image.src = fallbackUrl;
  }


  /**
   * Check if the email entered during account creation is valid and not already in use.
   */
  async checkUserEmail() {
    this.isEmailValid = false;
    this.isExistingEmail = false;

    if (this.newUser.email === '' || !this.emailPattern.test(this.newUser.email)) {
      return;
    }

    const collRef = collection(this.firestore, "users");
    const q = query(collRef, where("email", "==", this.newUser.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      this.isExistingEmail = true;
    } else {
      this.isEmailValid = true;
    }
  }


  /**
   * Validate the user's password based on predefined patterns.
   */
  checkUserPassword() {
    this.isPasswordValid = false;
    this.isPasswordEmpty = false;
    if (this.passwordPattern.test(this.newUser.password)) {
      this.isPasswordValid = true;
    }
    if (this.newUser.password === '') {
      this.isPasswordEmpty = true;
    }
  }


  /**
   * Validate the username based on predefined patterns.
   */
  checkUserName() {
    this.isNameValid = false;
    this.isNameEmpty = false;
    if (this.namePattern.test(this.newUser.name)) {
      this.isNameValid = true;
    }
    if (this.newUser.name === '') {
      this.isNameEmpty = true;
    }
  }


  /**
   * Reset the new user object and policy acceptance flag.
   */
  resetNewUser() {
    this.newUser = new User();
    this.policyAccepted = false;
  }


  /**
   * Checks if the user is active and updates their status.
   */
  async userIsActive() {
    const userCollection = collection(this.firestore, 'users');
    const localStorageKeyLoggedIn = 'loggedInUser';
    const loggedInUser = this.getLoggedInUser();

    const userQuery = query(userCollection, where("email", "==", loggedInUser.email));
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const userDocRef = doc(this.firestore, 'users', docSnapshot.id);

      await updateDoc(userDocRef, { isActive: true });

      const localStoragekey = 'userActivity';
      const userData = new User({ ...docSnapshot.data(), isActive: true });
      localStorage.setItem(localStoragekey, JSON.stringify(userData));

      const userDataStringLoggedIn = localStorage.getItem(localStorageKeyLoggedIn);
      if (userDataStringLoggedIn) {
        const userDataLoggedIn: User = JSON.parse(userDataStringLoggedIn);
        userDataLoggedIn.isActive = true;
        localStorage.setItem(localStorageKeyLoggedIn, JSON.stringify(userDataLoggedIn));
      }

      this.setStatusActive(userData);
    }
  }


  /**
   * Checks user activity based on local storage and updates their status if active.
   */
  checkUserActivity(user: User) {
    const localStorageKey = 'userActivity';
    const userActivityData = localStorage.getItem(localStorageKey);

    if (userActivityData && user.email === JSON.parse(userActivityData).email) {
      const userDocRef = doc(collection(this.firestore, 'users'), user.id);
      updateDoc(userDocRef, { isActive: true });
      this.setStatusActive(user);
    }
  }


  /**
   * Sets the user status to active and schedules it to be set to inactive after a delay.
   */
  setStatusActive(user: User) {
    const userDocRef = doc(collection(this.firestore, 'users'), user.id);
    const localStorageKeyActivity = 'userActivity';
    const localStorageKeyLoggedIn = 'loggedInUser';

    setTimeout(() => {
      updateDoc(userDocRef, { isActive: false });

      const userDataStringLoggedIn = localStorage.getItem(localStorageKeyLoggedIn);
      if (userDataStringLoggedIn) {
        const userDataLoggedIn = JSON.parse(userDataStringLoggedIn);
        userDataLoggedIn.isActive = false;
        localStorage.setItem(localStorageKeyLoggedIn, JSON.stringify(userDataLoggedIn));
      }

      localStorage.removeItem(localStorageKeyActivity);
    }, 600000);
  }
}