import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OverlayTurnOnNewVendorNotificationsComponent } from './overlay-turn-on-new-vendor-notifications.component';

describe('OverlayTurnOnNewVendorNotificationsComponent', () => {
  let component: OverlayTurnOnNewVendorNotificationsComponent;
  let fixture: ComponentFixture<OverlayTurnOnNewVendorNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverlayTurnOnNewVendorNotificationsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OverlayTurnOnNewVendorNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
