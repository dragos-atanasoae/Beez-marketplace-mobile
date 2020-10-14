import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ManageStripeCardsPage } from './manage-stripe-cards.page';

describe('ManageStripeCardsPage', () => {
  let component: ManageStripeCardsPage;
  let fixture: ComponentFixture<ManageStripeCardsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageStripeCardsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageStripeCardsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
