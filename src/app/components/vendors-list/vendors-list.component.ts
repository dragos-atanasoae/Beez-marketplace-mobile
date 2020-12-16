import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss'],
})
export class VendorsListComponent implements OnInit {
  @Input() vendorsList: any = [];
  @Input() context: string;

  constructor() { }

  ngOnInit() {}

}
