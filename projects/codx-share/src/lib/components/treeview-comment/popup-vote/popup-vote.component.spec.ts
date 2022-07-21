import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupVoteComponent } from './popup-vote.component';

describe('PopupVoteComponent', () => {
  let component: PopupVoteComponent;
  let fixture: ComponentFixture<PopupVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupVoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
