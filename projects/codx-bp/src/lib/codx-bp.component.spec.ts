import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxBpComponent } from './codx-bp.component';

describe('CodxBpComponent', () => {
  let component: CodxBpComponent;
  let fixture: ComponentFixture<CodxBpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxBpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxBpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
