import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NotificationsCenterPage } from './notifications-center.page';

describe('NotificationsCenterPage', () => {
  let component: NotificationsCenterPage;
  let fixture: ComponentFixture<NotificationsCenterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsCenterPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsCenterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
