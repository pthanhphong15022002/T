import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxTrComponent } from './codx-tr.component';

describe('CodxTrComponent', () => {
  let component: CodxTrComponent;
  let fixture: ComponentFixture<CodxTrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxTrComponent]
    });
    fixture = TestBed.createComponent(CodxTrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
