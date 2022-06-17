import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxOdComponent } from './codx-od.component';

describe('CodxOdComponent', () => {
  let component: CodxOdComponent;
  let fixture: ComponentFixture<CodxOdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxOdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxOdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
