import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { AccountComponent } from './account/account.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { LoginComponent } from './login/login.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { SendLinkToUserComponent } from './send-link-to-user/send-link-to-user.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MainpageHeaderComponent } from './mainpage-header/mainpage-header.component';
import { MainpageThreadsComponent } from './mainpage-threads/mainpage-threads.component';
import { MainpageChatComponent } from './mainpage-chat/mainpage-chat.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { LoginGoogleComponent } from './login-google/login-google.component';
import { SuccessBannerComponent } from './success-banner/success-banner.component';
import { DialogMessageReactComponent } from './dialog-message-react/dialog-message-react.component';
import { MainpageChannelsComponent } from './mainpage-channels/mainpage-channels.component';


@NgModule({
  declarations: [
    AppComponent,
    AccountComponent,
    AccountProfileComponent,
    LoginComponent,
    MainpageComponent,
    SendLinkToUserComponent,
    ResetPasswordComponent,
    MainpageHeaderComponent,
    MainpageThreadsComponent,
    MainpageChatComponent,
    LoginGoogleComponent,
    SuccessBannerComponent,
    DialogMessageReactComponent,
    MainpageChannelsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatToolbarModule,
    MatDialogModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
