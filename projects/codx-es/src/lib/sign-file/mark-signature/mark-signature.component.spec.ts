import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkSignatureComponent } from './mark-signature.component';

describe('MarkSignatureComponent', () => {
  let component: MarkSignatureComponent;
  let fixture: ComponentFixture<MarkSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkSignatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
