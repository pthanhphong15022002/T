import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateDetailNoteBookComponent } from './update-detail-note-book.component';

describe('UpdateDetailNoteBookComponent', () => {
  let component: UpdateDetailNoteBookComponent;
  let fixture: ComponentFixture<UpdateDetailNoteBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateDetailNoteBookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDetailNoteBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
