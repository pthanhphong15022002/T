import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailNoteBooksComponent } from './detail-note-books.component';

describe('DetailNoteBooksComponent', () => {
  let component: DetailNoteBooksComponent;
  let fixture: ComponentFixture<DetailNoteBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailNoteBooksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailNoteBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
