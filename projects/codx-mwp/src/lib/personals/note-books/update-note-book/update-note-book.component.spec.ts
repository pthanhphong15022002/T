import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateNoteBookComponent } from './update-note-book.component';

describe('UpdateNoteBookComponent', () => {
  let component: UpdateNoteBookComponent;
  let fixture: ComponentFixture<UpdateNoteBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateNoteBookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateNoteBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
