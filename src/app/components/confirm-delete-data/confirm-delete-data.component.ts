import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-delete-data',
  templateUrl: './confirm-delete-data.component.html',
  styleUrls: ['./confirm-delete-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDeleteDataComponent implements OnInit {
  @Input() type: string; // 'Voucher' || 'Product' || 'FoodMarketplace' || 'Account'
  @Input() title: string;
  @Input() answersList: any;

  language = localStorage.getItem('language');
  selectedAnswer = 1;
  otherReason: FormControl;
  eventContext = 'Confirm Delete Data';

  constructor(
    private analyticsService: AnalyticsService,
    public translate: TranslateService,
    private modalCtrl: ModalController
  ) {
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.language);
    this.otherReason = new FormControl('');
  }

  ngOnInit() {
    console.log(this.answersList);
  }

  /**
   * @name selectAnswer
   * @description Select answer with id = 'answerId'
   * @param answerId
   */
  selectAnswer(answerId: number) {
    if (this.selectedAnswer === answerId) {
      this.selectedAnswer = 0;
    } else {
      this.selectedAnswer = answerId;
    }
  }

  /**
   * @name closeModalQuiz
   * @description Close modal quiz
   */
  closeModalQuiz(data?: string) {
    if (data === 'send') {
      this.logAnalyticsEvents();
    } else {
      this.modalCtrl.dismiss(data);
    }
  }

  public get eventName(): string {
    switch (this.type) {
      case 'Product':
        return 'delete_product_quiz';
      case 'Voucher':
        return 'delete_voucher_quiz';
      case 'FoodMarketplace':
        return 'delete_marketplace_order_quiz';
      case 'Account':
        return 'delete_account_quiz';
      case 'BeezPayOrder':
        return 'delete_beezpay_order_quiz';
      default:
        break;
    }
  }

  /**
   * @name logAnalyticsEvents
   * @description Analytics event
   */
  logAnalyticsEvents() {
    let selectedAnswer: string;
    selectedAnswer = this.answersList.filter(el => el.id === this.selectedAnswer)[0].answer;
    this.modalCtrl.dismiss({ closeType: 'send', reason: this.otherReason.value ? this.otherReason.value : selectedAnswer });
    const eventParams = { context: this.eventContext, other_reason: this.otherReason.value, selected_answer: selectedAnswer };
    console.log(eventParams);
    this.analyticsService.logEvent(this.eventName, eventParams);
  }
}
