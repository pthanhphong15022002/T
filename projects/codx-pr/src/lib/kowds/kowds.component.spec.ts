import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KowdsComponent } from './kowds.component';

describe('KowdsComponent', () => {
  let component: KowdsComponent;
  let fixture: ComponentFixture<KowdsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KowdsComponent]
    });
    fixture = TestBed.createComponent(KowdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
