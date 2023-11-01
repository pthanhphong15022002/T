import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralJournalDetailComponent } from './general-journal-detail.component';

describe('GeneralJournalDetailComponent', () => {
  let component: GeneralJournalDetailComponent;
  let fixture: ComponentFixture<GeneralJournalDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralJournalDetailComponent]
    });
    fixture = TestBed.createComponent(GeneralJournalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
