import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendLinkToUserComponent } from './send-link-to-user.component';

describe('SendLinkToUserComponent', () => {
  let component: SendLinkToUserComponent;
  let fixture: ComponentFixture<SendLinkToUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendLinkToUserComponent]
    });
    fixture = TestBed.createComponent(SendLinkToUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
