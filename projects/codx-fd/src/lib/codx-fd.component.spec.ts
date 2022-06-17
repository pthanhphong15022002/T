import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxFdComponent } from './codx-fd.component';

describe('CodxFdComponent', () => {
  let component: CodxFdComponent;
  let fixture: ComponentFixture<CodxFdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxFdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxFdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
