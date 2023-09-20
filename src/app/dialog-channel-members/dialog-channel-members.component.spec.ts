import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelMembersComponent } from './dialog-channel-members.component';

describe('DialogChannelMembersComponent', () => {
  let component: DialogChannelMembersComponent;
  let fixture: ComponentFixture<DialogChannelMembersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogChannelMembersComponent]
    });
    fixture = TestBed.createComponent(DialogChannelMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
