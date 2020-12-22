import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { EventsService } from 'src/app/services/events.service';
import { GeneralInfoService } from 'src/app/services/general-info.service';

@Component({
  selector: 'app-slides-general-info',
  templateUrl: './slides-general-info.component.html',
  styleUrls: ['./slides-general-info.component.scss'],
})
export class SlidesGeneralInfoComponent implements OnInit {

  generalInfoSlides = null;
  eventContext = 'Slides General Info';
  // Get slides info only for food marketplace
  filter = '(target eq \'FM\')';

  constructor(
    private analyticsService: AnalyticsService,
    private eventsService: EventsService,
    private generalInfoService: GeneralInfoService,
  ) { }

  ngOnInit() {
    this.getInfoSlides();
  }

  /**
   * @name getShopPageCarousel
   * @description Get information about the carousel slides on the shops page
   */
  getInfoSlides() {
    this.generalInfoService.getSlidesInfo(this.filter)
      .subscribe((response: any) => {
        if (response.status === 'success') {
          console.log('INFO SLIDES:', response.displayCards);
          this.generalInfoSlides = response.displayCards;
        }
      });
  }

  /**
   * @name listenEventUpdateLanguage
   * @description Listen for event updateLanguage to update slides content by selected language
   */
  listenEventUpdateLanguage() {
    this.eventsService.event$.subscribe((res) => {
      if (res === 'updateLanguage') {
        console.log('Update Slides language');
        this.getInfoSlides();
      }
    });
  }

  /**
   * @description Manage redirect to given page/tab/modal/segment
   * @param item
   */
  manageRedirects(item: any) {
    console.log('REDIRECT: ', item);
    const eventParams = { context: this.eventContext, slide_title: item.title };
    this.analyticsService.logEvent('click_on_slide', eventParams);
    // this.manageRedirectsService.manageRedirects(item.elementLinkApp);
  }

  /**
   * @name markAsSeenOrClosed
   * @description Mark slide from carousel as seen or closed
   * @param slide
   * @param markAs
   */
  markAsSeenOrClosed(slideId: any, markAs?: string) {
    const body = {
      id: slideId,
      closed: markAs === 'closed' ? true : null,
      seen: markAs === 'seen' ? true : null
    };
    this.generalInfoService.markAsSeenOrClosed(body)
      .subscribe((response: any) => {
        if (response.status === 'success') {
          if (markAs === 'closed') {
            this.generalInfoSlides = this.generalInfoSlides.filter(item => item.id !== slideId);
          }
        }
      });
  }

}
