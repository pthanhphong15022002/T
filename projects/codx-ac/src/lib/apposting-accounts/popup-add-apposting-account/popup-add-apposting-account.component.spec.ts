import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddAPPostingAccountComponent } from './popup-add-apposting-account.component';

describe('PopupAddAPPostingAccountComponent', () => {
  let component: PopupAddAPPostingAccountComponent;
  let fixture: ComponentFixture<PopupAddAPPostingAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddAPPostingAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddAPPostingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
