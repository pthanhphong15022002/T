import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxNoteComponent } from './codx-note.component';

describe('CodxNoteComponent', () => {
  let component: CodxNoteComponent;
  let fixture: ComponentFixture<CodxNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
