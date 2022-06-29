import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateNoteBookComponent } from './add-update-note-book.component';

describe('AddUpdateNoteBookComponent', () => {
  let component: AddUpdateNoteBookComponent;
  let fixture: ComponentFixture<AddUpdateNoteBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateNoteBookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUpdateNoteBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
