import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxAuthFileComponent } from './codx-auth-file.component';

describe('CodxAuthFileComponent', () => {
  let component: CodxAuthFileComponent;
  let fixture: ComponentFixture<CodxAuthFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodxAuthFileComponent]
    });
    fixture = TestBed.createComponent(CodxAuthFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
