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