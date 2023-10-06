import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AccountServiceService } from '../account-service.service';



@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent {


constructor(public location:Location, public accountService:AccountServiceService) {}
  close() {
this.location.back();
this.checkIntro();
  }

  checkIntro() {
    this.accountService.isIntro = false;
  }
}
