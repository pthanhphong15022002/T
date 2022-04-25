import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesHomeComponent } from './notes-home.component';

describe('NotesHomeComponent', () => {
  let component: NotesHomeComponent;
  let fixture: ComponentFixture<NotesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotesHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
