import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveNoteComponent } from './save-note.component';

describe('SaveNoteComponent', () => {
  let component: SaveNoteComponent;
  let fixture: ComponentFixture<SaveNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
