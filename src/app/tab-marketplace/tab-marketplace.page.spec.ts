import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabMarketplacePage } from './tab-marketplace.page';

describe('TabMarketplacePage', () => {
  let component: TabMarketplacePage;
  let fixture: ComponentFixture<TabMarketplacePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabMarketplacePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabMarketplacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
