import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MarketplaceProductsPage } from './marketplace-products.page';

describe('MarketplaceProductsPage', () => {
  let component: MarketplaceProductsPage;
  let fixture: ComponentFixture<MarketplaceProductsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceProductsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
