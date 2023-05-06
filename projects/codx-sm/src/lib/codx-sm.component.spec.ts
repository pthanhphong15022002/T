import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxSmComponent } from './codx-sm.component';

describe('CodxSmComponent', () => {
  let component: CodxSmComponent;
  let fixture: ComponentFixture<CodxSmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxSmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxSmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
