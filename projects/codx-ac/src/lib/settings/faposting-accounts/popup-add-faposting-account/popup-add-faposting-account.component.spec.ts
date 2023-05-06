import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddFAPostingAccountComponent } from './popup-add-faposting-account.component';

describe('PopupAddFAPostingAccountComponent', () => {
  let component: PopupAddFAPostingAccountComponent;
  let fixture: ComponentFixture<PopupAddFAPostingAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddFAPostingAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddFAPostingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
