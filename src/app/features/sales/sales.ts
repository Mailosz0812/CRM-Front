import { Component, OnInit, signal, inject } from '@angular/core';
import { MagazineService } from '../../core/magazine/MagazineService';
import {AsyncPipe, DatePipe, LowerCasePipe} from '@angular/common';
import { PackReq } from '../../core/magazine/models/PackReq';
import { first } from 'rxjs/operators';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {catchError, EMPTY} from 'rxjs';

type NotificationState = { show: boolean; type: 'success' | 'error'; message: string };

@Component({
  selector: 'app-sales',
  imports: [AsyncPipe, LowerCasePipe, ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './sales.html',
})
export class Sales {
  private magazineService = inject(MagazineService);

  targetDate:string = this.getTodayString();
  private previousDate = this.getTodayString();

  dailySales$ = this.magazineService.getDailySales(this.targetDate);
  expandedOrders = signal<Set<string>>(new Set());
  doneOrders = signal<Set<string>>(new Set());

  notification = signal<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

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
          this.showNotification('error', 'Zatwierdzenie zamówienia nie powiodło się.');
          console.error('Błąd oznaczania jako spakowane:', error);
        }
      });
  }

  showNotification(type: 'success' | 'error', message: string) {
    this.notification.set({ show: true, type, message });

    setTimeout(() => {
      this.notification.update(n => ({ ...n, show: false }));
    }, 4000);
  }

  closeNotification(): void {
    this.notification.update(n => ({ ...n, show: false }));
  }

  onDateChange(date: string){
    if(date === this.previousDate){
      return
    }
    this.dailySales$ = this.magazineService.getDailySales(date).pipe(
      catchError(err => {
        this.showNotification('error','Data zamówienia nie może być w przeszłości!');
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
}
