import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainpageThreadsComponent } from './mainpage-threads.component';

describe('MainpageThreadsComponent', () => {
  let component: MainpageThreadsComponent;
  let fixture: ComponentFixture<MainpageThreadsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainpageThreadsComponent]
    });
    fixture = TestBed.createComponent(MainpageThreadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
