import { inject, Injectable } from '@angular/core';
import { user } from '@angular/fire/auth';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { Channel } from 'src/models/channel.class';
import { User } from 'src/models/user.class'

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
  firestoreLoggedInUsersImage: any = [];
  loggedInUser: User | null = null;
  localStorageKey = 'loggedInUser';
  getLoggedInUserName: string;
  loggedInUsersArray = [];
  private openDirectMessageSource = new Subject<User>();
  openDirectMessage$ = this.openDirectMessageSource.asObservable();

  private openChannelAreaSource = new Subject<Channel>();
  openChannelArea$ = this.openChannelAreaSource.asObservable();

  private meinBooleanSubject = new Subject<boolean>();  // Wenn die Variable true ist, wird <form> gesendet
  meinBoolean$ = this.meinBooleanSubject.asObservable();  // Wenn die Variable true ist, wird <form> gesendet

  constructor() {
    const storedUser = localStorage.getItem(this.localStorageKey);
    if (storedUser) {
      this.loggedInUser = JSON.parse(storedUser);
    } else {
      this.loggedInUser = null; 
    }
   
  }


   triggerOpenDirectMessage(user: User) {
     this.openDirectMessageSource.next(user);
   }


   triggerOpenChannelArea(channel: Channel) {
    this.openChannelAreaSource.next(channel);
    
    
  }


  setLoggedInUser(user: User) {
    this.loggedInUser = user;
    localStorage.setItem(this.localStorageKey, JSON.stringify(user));
  }

  getLoggedInUser() {
    return this.loggedInUser || null;
  }  

  clearLoggedInUser() {
    this.loggedInUser = null;
    localStorage.removeItem(this.localStorageKey);
  }

  getEmail() {
    console.log('service klasse', this.emailResetPassword);

  }


  setMeinBoolean(value: boolean) {   // Wenn die Variable true ist, wird <form> account component gesendet
    this.meinBooleanSubject.next(value);
  }



  handleImageError(event: Event, fallbackUrl: string) {
    const image = event.target as HTMLImageElement;
    image.onerror = null;  // Remove the error handler to prevent looping in case the fallback also fails.
    image.src = fallbackUrl;
}

    
  }

  
    ////  braucht man nicht

  //  async getLoggedInUsers() {   // Test
  //    const collRef = collection(this.firestore, "users");

  //    try {
  //      const querySnapshot = await getDocs(collRef);
  //      querySnapshot.forEach((doc) => {
  //        const userData = doc.data() as User;
  //        const documentId = doc.id;

  //        const loggedInListener = onSnapshot(doc.ref, (snapshot) => {
  //          const loggedInValue = snapshot.data()?.['loggedIn'];
  //          //const loggedInName = snapshot.data();
  //          // console.log('snapshot.data(): ',snapshot.data());

  //          this.loggedInUsersArray.push(snapshot.data())
  //         // console.log('this.loggedInUsersArray',this.loggedInUsersArray);
           
  //          if (loggedInValue !== undefined) {
  //            if (loggedInValue && userData.email !== this.getLoggedInUser().email) {
  //              this.firestoreLoggedInUsers.push(userData.name);
  //              this.firestoreLoggedInUsersImage.push(userData.avatarSrc);
  //              this.firestoreLoggedInUsersImage.push(userData.email);
  //              this.getLoggedInUserName = userData.name;
  //            } else {
  //            }
  //          }

  //        });
  //      });

  //    } catch (error) {
  //      //console.error('Fehler beim Abrufen der Benutzerdaten:', error);
  //    }
  //  }





