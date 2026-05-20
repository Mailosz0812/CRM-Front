import {Component, OnInit, signal, inject, ChangeDetectorRef} from '@angular/core';
import { MagazineService } from '../../core/magazine/MagazineService';
import {AsyncPipe, DatePipe, LowerCasePipe} from '@angular/common';
import { PackReq } from '../../core/magazine/models/PackReq';
import { first } from 'rxjs/operators';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {catchError, EMPTY} from 'rxjs';
import {Notification} from '../../shared/notification/notification';
import {SalePrintHelper} from '../../core/sale/SalePrintHelper';
import {SaleService} from '../../core/sale/SaleService';

type NotificationState = { show: boolean; type: 'success' | 'error'; message: string };

@Component({
  selector: 'app-sales',
  imports: [AsyncPipe, LowerCasePipe, ReactiveFormsModule, FormsModule, DatePipe, Notification],
  templateUrl: './sales.html',
})
export class Sales {
  private magazineService = inject(MagazineService);

  constructor(private cdr: ChangeDetectorRef,private salePrintHelper: SalePrintHelper,
              private saleService: SaleService) {}

  targetDate:string = this.getTodayString();
  private previousDate = this.getTodayString();

  dailySales$ = this.magazineService.getDailySales(this.targetDate);
  expandedOrders = signal<Set<string>>(new Set());
  doneOrders = signal<Set<string>>(new Set());

  notificationState: NotificationState = {
    show: false,
    message: '',
    type: 'success'
  };

  toggleExpand(saleId: string): void {
    this.expandedOrders.update(current => {
      const next = new Set(current);
      next.has(saleId) ? next.delete(saleId) : next.add(saleId);
      return next;
    });
  }

  markAsDone(saleId: string, event: Event): void {
    event.stopPropagation();
    const packReq: PackReq = { saleId };

    this.magazineService.checkAsPacked(packReq)
      .pipe(first())
      .subscribe({
        next: () => {
          this.doneOrders.update(orders => new Set(orders).add(saleId));
          this.expandedOrders.update(orders => {
            const next = new Set(orders);
            next.delete(saleId);
            return next;
          });
        },
        error: (error: Error) => {
          this.triggerNotification('error', 'Zatwierdzenie zamówienia nie powiodło się.');
          console.error('Błąd oznaczania jako spakowane:', error);
        }
      });
  }

  triggerNotification(type: 'success' | 'error', message: string) {
    this.notificationState = {
      show: true,
      type: type,
      message: message
    };

    setTimeout(() => {
      this.notificationState.show = false;
      this.cdr.detectChanges();
    }, 5000);
  }

  onDateChange(date: string){
    if(date === this.previousDate){
      return
    }
    this.dailySales$ = this.magazineService.getDailySales(date).pipe(
      catchError(err => {
        this.triggerNotification('error','Data zamówienia nie może być w przeszłości!');
        return EMPTY;
      })
    );
    this.previousDate = date;
  }
  private getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  onPrintSale(saleId: string){
    this.saleService.getSalePrint(saleId).subscribe({
      next: (resp) => {
        this.salePrintHelper.onPrintSale(resp);
      }
    })
  }
}
