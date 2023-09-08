import { Component } from '@angular/core';
import { AccountServiceService } from '../account-service.service';

@Component({
  selector: 'app-send-link-to-user',
  templateUrl: './send-link-to-user.component.html',
  styleUrls: ['./send-link-to-user.component.scss']
})
export class SendLinkToUserComponent {


  email: string;

  constructor(public accountService: AccountServiceService){}
  checkIntro() {
    this.accountService.isIntro = false;
  }


  async sendEmail() {
    this.accountService.emailResetPassword = this.email;
    console.log('send-link-to-user',this.accountService.emailResetPassword);
    
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





//  async sendEmail() {
//  const form = document.createElement('form');
//     form.setAttribute('method', 'POST');
//     form.setAttribute('action', 'https://barnabas-gonda.de/message/send_link.php');

//     const input = document.createElement('input');
//     input.setAttribute('type', 'hidden');
//     input.setAttribute('name', 'email');
//     input.setAttribute('value', this.email);

//     form.appendChild(input);
//     document.body.appendChild(form);
    
//     form.submit();
    
//   }

 

}
