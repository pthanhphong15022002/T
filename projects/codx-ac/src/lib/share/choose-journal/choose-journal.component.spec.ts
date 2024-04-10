import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseJournalComponent } from './choose-journal.component';

describe('ChooseJournalComponent', () => {
  let component: ChooseJournalComponent;
  let fixture: ComponentFixture<ChooseJournalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChooseJournalComponent]
    });
    fixture = TestBed.createComponent(ChooseJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
