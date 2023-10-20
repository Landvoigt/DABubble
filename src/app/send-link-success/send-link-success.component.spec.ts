import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendLinkSuccessComponent } from './send-link-success.component';

describe('SendLinkSuccessComponent', () => {
  let component: SendLinkSuccessComponent;
  let fixture: ComponentFixture<SendLinkSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendLinkSuccessComponent]
    });
    fixture = TestBed.createComponent(SendLinkSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
