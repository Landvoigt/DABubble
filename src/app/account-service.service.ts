import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
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
  emailResetPassword ='';

getEmail() {
  console.log('service klasse',this.emailResetPassword);
  
}

  // async getLoggedUsers() { 
  //     const collRef = collection(this.firestore, "users");
  //     const loggedUsers: User[] = []; 

  //     try {
  //       const querySnapshot = await getDocs(query(collRef, where("loggedIn", "==", true)));
  //         querySnapshot.forEach((doc) => {
  //         const userData = doc.data() as User;
  //           loggedUsers.push(userData);
  //       });
  //         console.log('Eingeloggte Benutzer:', loggedUsers);
  //     } catch (error) {
  //       console.error('Fehler beim Abrufen der Benutzerdaten:', error);
  //     }
  //   }

  private meinBooleanSubject = new Subject<boolean>();  // Wenn die Variable true ist, wird <form> gesendet
  meinBoolean$ = this.meinBooleanSubject.asObservable();  // Wenn die Variable true ist, wird <form> gesendet
  setMeinBoolean(value: boolean) {   // Wenn die Variable true ist, wird <form> gesendet
    this.meinBooleanSubject.next(value);
  }

}



