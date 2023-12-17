import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxViewFileComponent } from './codx-view-file.component';

describe('CodxViewFileComponent', () => {
  let component: CodxViewFileComponent;
  let fixture: ComponentFixture<CodxViewFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxViewFileComponent]
    });
    fixture = TestBed.createComponent(CodxViewFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
