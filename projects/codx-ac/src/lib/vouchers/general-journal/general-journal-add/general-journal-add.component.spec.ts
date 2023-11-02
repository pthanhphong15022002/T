import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralJournalAddComponent } from './general-journal-add.component';

describe('GeneralJournalAddComponent', () => {
  let component: GeneralJournalAddComponent;
  let fixture: ComponentFixture<GeneralJournalAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralJournalAddComponent]
    });
    fixture = TestBed.createComponent(GeneralJournalAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
