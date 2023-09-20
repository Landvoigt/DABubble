import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogChannelAddNewMembersComponent } from './dialog-channel-add-new-members.component';

describe('DialogChannelAddNewMembersComponent', () => {
  let component: DialogChannelAddNewMembersComponent;
  let fixture: ComponentFixture<DialogChannelAddNewMembersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogChannelAddNewMembersComponent]
    });
    fixture = TestBed.createComponent(DialogChannelAddNewMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
