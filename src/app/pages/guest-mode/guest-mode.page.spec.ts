import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GuestModePage } from './guest-mode.page';

describe('GuestModePage', () => {
  let component: GuestModePage;
  let fixture: ComponentFixture<GuestModePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuestModePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GuestModePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
