import {Injectable} from '@angular/core';

@Injectable({
  providedIn: "root"
})
export class SalePrintHelper{
  constructor() {}

  onPrintSale(pdfData: any){
    const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
    const fileUrl = URL.createObjectURL(pdfBlob);
    window.open(fileUrl, '_blank');

    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 10000);
  }
}
