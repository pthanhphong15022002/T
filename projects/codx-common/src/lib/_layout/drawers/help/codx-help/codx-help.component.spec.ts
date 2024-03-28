import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxHelpComponent } from './codx-help.component';

describe('CodxHelpComponent', () => {
  let component: CodxHelpComponent;
  let fixture: ComponentFixture<CodxHelpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxHelpComponent]
    });
    fixture = TestBed.createComponent(CodxHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
