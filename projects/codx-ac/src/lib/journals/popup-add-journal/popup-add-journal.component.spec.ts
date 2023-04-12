import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddJournalComponent } from './popup-add-journal.component';

describe('PopupAddJournalComponent', () => {
  let component: PopupAddJournalComponent;
  let fixture: ComponentFixture<PopupAddJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddJournalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
