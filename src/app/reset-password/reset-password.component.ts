import { Component } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Firestore, collection, doc, getDoc,getDocs, setDoc, DocumentReference, DocumentSnapshot, DocumentData, query, where } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { updateDoc } from 'firebase/firestore';
import { FormBuilder, Validators } from '@angular/forms';



@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  passwordForm:any;

  constructor(public accountService: AccountServiceService,
    private firestore: Firestore){
     
    }




    async resetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        console.log('Die Passwörter sind nicht gleich!');
        return;
      }
    
      // Abrufen des alten Passworts aus Firestore
      const collRef = collection(this.firestore, "users");
      const querySnapshot = await getDocs(collRef);
    
      let oldPassword: string | undefined; // Variable für das alte Passwort
    
      querySnapshot.forEach((queryDocSnapshot) => {
        const userData = queryDocSnapshot.data() as User;
        if (userData.email === this.accountService.emailResetPassword) {
          // Hier wird das alte Passwort aus Firestore abgerufen (sofern vorhanden)
          oldPassword = userData.password;
        }
      });
    
      if (oldPassword === undefined) {
        console.log('Benutzer mit dieser E-Mail-Adresse wurde nicht gefunden.');
        return;
      }
    
      // Überprüfen, ob das neue Passwort gleich dem alten Passwort ist
      if (this.newPassword === oldPassword) {
        console.log('Das Passwort kann nicht gleich dem alten Passwort sein.');
        return;
      }
    
      // Update des Passworts in Firestore
      const userQuery = query(collection(this.firestore, "users"), where("email", "==", this.accountService.emailResetPassword));
      const userQuerySnapshot = await getDocs(userQuery);
    
      userQuerySnapshot.forEach(async (queryDocSnapshot) => {
        const userDocRef = doc(this.firestore, 'users', queryDocSnapshot.id);
        await updateDoc(userDocRef, {
          password: this.newPassword
        });
      });
    
      console.log('Das Passwort wurde erfolgreich geändert.');
    }
    






    // async resetPassword() {
    //   //  if (this.newPassword !== this.confirmPassword) {
    //   //    console.log('Die Passwörter sind nicht gleich!');
    //   //    return;
    //   //  }
    //   if(this.newPassword === this.confirmPassword &&
    //     this.newPassword === oldPassword) {
    //       console.log('Das Passwort kann man nicht wählen!');
    //       return;
    //     }


    // this.accountService.getEmail();     
    //   const collRef = collection(this.firestore, "users");
    //   const querySnapshot = await getDocs(collRef);
    //   querySnapshot.forEach(async (queryDocSnapshot) => {
    //     const userData = queryDocSnapshot.data() as User;
    //     if(userData.email === this.accountService.emailResetPassword){
    //       const userDocRef = doc(this.firestore, 'users', queryDocSnapshot.id);
    //       await updateDoc(userDocRef, {
    //         password: this.newPassword
    //       });
    //     }

    //   });

    // //   const userRef = doc(this.firestore, 'users', 'barnabas.gonda@googlemail.com');
    // //   const userDoc = await getDoc(userRef);
    // //  const userData = userDoc.data();
    // //   await setDoc(userRef, {password: this.newPassword}, {merge: true});
    
    // }



    
    
  
  
  
  
  
  
  
  checkIntro() {
    this.accountService.isIntro = false;
  }

}

