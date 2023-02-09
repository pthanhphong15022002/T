import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalNamesComponent } from './journal-names.component';

describe('JournalNamesComponent', () => {
  let component: JournalNamesComponent;
  let fixture: ComponentFixture<JournalNamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JournalNamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalNamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
