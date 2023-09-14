import { inject, Injectable } from '@angular/core';
import { user } from '@angular/fire/auth';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { User } from 'src/models/user.class';

@Injectable({
  providedIn: 'root'
})
export class AccountServiceService {
  currentUser: any = [];
  currentBoolean: any = [];
  isIntro = true;
  imagePathService: any;
  loggedInUsers = [];
  firestore: Firestore = inject(Firestore);
  emailResetPassword = '';
  usersArray = [];
  firestoreLoggedInUsers: any = [];
  firestoreLoggedInUsersImage:any = [];

  loggedInUser: User | null = null;
  localStorageKey = 'loggedInUser';
  getLoggedInUserName: string;


  constructor() {
    const storedUser = localStorage.getItem(this.localStorageKey);
    if (storedUser) {
      this.loggedInUser = JSON.parse(storedUser);
    }else {
      // Wenn kein gespeicherter Benutzer gefunden wurde, initialisiere loggedInUser
      this.loggedInUser = null; // Oder eine geeignete Standardwerte
    }
    //this.getLoggedInUsers();
  }

 


  setLoggedInUser(user: User) {
    this.loggedInUser = user;
    localStorage.setItem(this.localStorageKey, JSON.stringify(user));
  }

  getLoggedInUser() {
    return this.loggedInUser;
  }

  clearLoggedInUser() {
    this.loggedInUser = null;
    localStorage.removeItem(this.localStorageKey);
  }


  getEmail() {
    console.log('service klasse', this.emailResetPassword);

  }



  private meinBooleanSubject = new Subject<boolean>();  // Wenn die Variable true ist, wird <form> gesendet
  meinBoolean$ = this.meinBooleanSubject.asObservable();  // Wenn die Variable true ist, wird <form> gesendet
  setMeinBoolean(value: boolean) {   // Wenn die Variable true ist, wird <form> gesendet
    this.meinBooleanSubject.next(value);
  }


  async getLoggedInUsers() {   // Test
    const collRef = collection(this.firestore, "users");

    try {
      const querySnapshot = await getDocs(collRef);
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        const documentId = doc.id;
        const loggedInListener = onSnapshot(doc.ref, (snapshot) => {
          const loggedInValue = snapshot.data()?.['loggedIn'];
          //const loggedInName = snapshot.data();
          if (loggedInValue !== undefined) {
            if (loggedInValue && userData.name !== this.getLoggedInUser().name) {
              this.firestoreLoggedInUsers.push(userData.name);
              this.firestoreLoggedInUsersImage.push(userData.avatarSrc);
              this.getLoggedInUserName = userData.name;
            } else {
            }
          }

        });
      });

    } catch (error) {
      //console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }


}



