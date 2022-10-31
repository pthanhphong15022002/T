import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxChatComponent } from './codx-chat.component';

describe('CodxChatComponent', () => {
  let component: CodxChatComponent;
  let fixture: ComponentFixture<CodxChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
