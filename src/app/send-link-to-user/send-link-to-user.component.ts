import { Component } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { User } from 'src/models/user.class';

@Component({
  selector: 'app-send-link-to-user',
  templateUrl: './send-link-to-user.component.html',
  styleUrls: ['./send-link-to-user.component.scss']
})
export class SendLinkToUserComponent {

  isSent = false;
  email: string;
  user = new User();
  isEmailExist = false;
  isEmailValid: boolean = false;
  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(public accountService: AccountServiceService, public router: Router,
    private firestore: Firestore) {

  }
  checkIntro() {
    this.accountService.isIntro = false;
  }


  async sendEmail() {
    if (this.isEmailExist) {
      this.isSent = true;
      setTimeout(() => {
        this.isSent = false;
        this.router.navigate(['/reset-password']);
      }, 1500);
      this.accountService.emailResetPassword = this.email;
      console.log('send-link-to-user', this.accountService.emailResetPassword);

      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', 'https://barnabas-gonda.de/message/send_link.php');

      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', 'email');
      input.setAttribute('value', this.email);

      form.appendChild(input);
      document.body.appendChild(form);

      try {
        const response = await fetch('https://barnabas-gonda.de/message/send_link.php', {
          method: 'POST',
          body: new FormData(form)
        });
        this.email = '';
        if (!response.ok) {
          throw new Error('Beim Senden der E-Mail ist ein Fehler aufgetreten.');
        }
      } catch (error) {
        console.error(error.message);
        alert(error.message);
      }
    }

  }



  async checkUserEmail() {
    // if (!this.email.match(this.emailPattern)) {
    //   // Die eingegebene E-Mail-Adresse entspricht nicht dem Muster
    //   this.isEmailValid = false;
    //   return;
    // }

    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    this.isEmailExist = querySnapshot.docs.some((doc) => {
      const userData = doc.data() as User;
      return userData.email === this.email;
    });

    if (!this.isEmailExist) {
      this.isEmailValid = true;
    } else {
      this.isEmailValid = false;
    }
  }


}
