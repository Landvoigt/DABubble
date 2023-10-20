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
import { SuccessBannerComponent } from './success-banner/success-banner.component';
import { MainpageChannelsComponent } from './mainpage-channels/mainpage-channels.component';
import { DialogAddChannelComponent } from './dialog-add-channel/dialog-add-channel.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DialogEditChannelComponent } from './dialog-edit-channel/dialog-edit-channel.component';
import { DialogEmojisComponent } from './dialog-emojis/dialog-emojis.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MainpageDirectMessageComponent } from './mainpage-direct-message/mainpage-direct-message.component';
import { DialogChannelMembersComponent } from './dialog-channel-members/dialog-channel-members.component';
import { DialogChannelAddNewMembersComponent } from './dialog-channel-add-new-members/dialog-channel-add-new-members.component';
import { DialogUserProfileComponent } from './dialog-user-profile/dialog-user-profile.component';
import { ImprintComponent } from './imprint/imprint.component';
import { MatListModule } from '@angular/material/list';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactionCountPipe } from './reaction-count.pipe';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { LoginGoogleComponent } from './login-google/login-google.component';
import { SendLinkSuccessComponent } from './send-link-success/send-link-success.component';


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
    SuccessBannerComponent,
    MainpageChannelsComponent,
    DialogAddChannelComponent,
    DialogEditChannelComponent,
    DialogEmojisComponent,
    MainpageDirectMessageComponent,
    DialogUserProfileComponent,
    DialogChannelMembersComponent,
    DialogChannelAddNewMembersComponent,
    ImprintComponent,
    ReactionCountPipe,
    PrivacyPolicyComponent,
    LoginGoogleComponent,
    SendLinkSuccessComponent,
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
    MatAutocompleteModule,
    ReactiveFormsModule,
    PickerComponent,
    EmojiComponent,
    MatListModule,
    HttpClientModule,
    MatFormFieldModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    BrowserAnimationsModule
  ],
  providers: [ReactionCountPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
