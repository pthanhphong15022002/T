import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxAcComponent } from './codx-ac.component';

describe('CodxAcComponent', () => {
  let component: CodxAcComponent;
  let fixture: ComponentFixture<CodxAcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxAcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxAcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
