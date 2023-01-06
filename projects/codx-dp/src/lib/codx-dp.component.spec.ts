import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxDpComponent } from './codx-dp.component';

describe('CodxDpComponent', () => {
  let component: CodxDpComponent;
  let fixture: ComponentFixture<CodxDpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxDpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxDpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
