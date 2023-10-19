import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendNoteBookComponent } from './extend-note-book.component';

describe('ExtendNoteBookComponent', () => {
  let component: ExtendNoteBookComponent;
  let fixture: ComponentFixture<ExtendNoteBookComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExtendNoteBookComponent]
    });
    fixture = TestBed.createComponent(ExtendNoteBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
