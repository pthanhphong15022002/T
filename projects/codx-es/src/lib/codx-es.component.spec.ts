import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxEsComponent } from './codx-es.component';

describe('CodxEsComponent', () => {
  let component: CodxEsComponent;
  let fixture: ComponentFixture<CodxEsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxEsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxEsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
