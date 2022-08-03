import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDetailNoteBooksComponent } from './list-detail-note-books.component';

describe('ListDetailNoteBooksComponent', () => {
  let component: ListDetailNoteBooksComponent;
  let fixture: ComponentFixture<ListDetailNoteBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListDetailNoteBooksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDetailNoteBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
