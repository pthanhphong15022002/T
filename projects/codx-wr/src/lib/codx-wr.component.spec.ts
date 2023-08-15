import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxWrComponent } from './codx-wr.component';

describe('CodxWrComponent', () => {
  let component: CodxWrComponent;
  let fixture: ComponentFixture<CodxWrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxWrComponent]
    });
    fixture = TestBed.createComponent(CodxWrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
