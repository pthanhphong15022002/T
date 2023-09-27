import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxPrComponent } from './codx-pr.component';

describe('CodxPrComponent', () => {
  let component: CodxPrComponent;
  let fixture: ComponentFixture<CodxPrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxPrComponent]
    });
    fixture = TestBed.createComponent(CodxPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
