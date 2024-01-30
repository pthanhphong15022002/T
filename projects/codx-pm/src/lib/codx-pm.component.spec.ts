import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxPmComponent } from './codx-pm.component';

describe('CodxPmComponent', () => {
  let component: CodxPmComponent;
  let fixture: ComponentFixture<CodxPmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxPmComponent]
    });
    fixture = TestBed.createComponent(CodxPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
