import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { LoginComponent } from './login/login.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { SendLinkToUserComponent } from './send-link-to-user/send-link-to-user.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginGoogleComponent } from './login-google/login-google.component';
import { ImprintComponent } from './imprint/imprint.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'account', component: AccountComponent },
  { path: 'profile', component: AccountProfileComponent },
  { path: 'main', component: MainpageComponent },
  { path: 'send-link', component: SendLinkToUserComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'login-google', component: LoginGoogleComponent },
  { path: 'imprint', component: ImprintComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
