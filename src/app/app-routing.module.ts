import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { LoginComponent } from './login/login.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { SendLinkToUserComponent } from './send-link-to-user/send-link-to-user.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { LoginGoogleComponent } from './login-google/login-google.component';
import { SendLinkSuccessComponent } from './send-link-success/send-link-success.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'google-login', component: LoginGoogleComponent },
  { path: 'account', component: AccountComponent },
  { path: 'profile', component: AccountProfileComponent },
  { path: 'main', component: MainpageComponent },
  { path: 'send-link', component: SendLinkToUserComponent },
  { path: 'send-link-success', component: SendLinkSuccessComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'reset-password', component: ResetPasswordComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
