import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxEiComponent } from './codx-ei.component';

describe('CodxEiComponent', () => {
  let component: CodxEiComponent;
  let fixture: ComponentFixture<CodxEiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxEiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxEiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
