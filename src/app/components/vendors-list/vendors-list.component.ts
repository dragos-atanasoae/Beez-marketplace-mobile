import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocaleDataModel } from 'src/app/models/localeData.model';
import { InternationalizationService } from 'src/app/services/internationalization.service';

@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss'],
})
export class VendorsListComponent implements OnInit {
  @Input() vendorsList: any = [];
  @Input() context: string;
  @Output() eventSelectVendor = new EventEmitter<object>();

  localeData = new LocaleDataModel();

  constructor(
    private internationalizationService: InternationalizationService
  ) {
    // Initialize locale context
    this.internationalizationService.initializeCountry().subscribe(res => {
      this.localeData = res;
    });
  }

  ngOnInit() { }

  selectVendor(vendor: any, product?: any) {
    this.eventSelectVendor.emit({vendor, product});
  }

}
