import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxHrComponent } from './codx-hr.component';

describe('CodxHrComponent', () => {
  let component: CodxHrComponent;
  let fixture: ComponentFixture<CodxHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxHrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
