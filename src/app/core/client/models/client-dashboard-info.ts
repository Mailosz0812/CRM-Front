export interface ClientDashboardInfo{
  clientInfo: ClientWidgetInfo,
  recentSales: ShortSaleResp[]
}

export interface ClientWidgetInfo{
  name: string,
  nipNumber: string,
  address: string,
  phone: string
}

export interface ShortSaleResp{
  saleId: string,
  saleData: string,
  saleStage: string,
  sumPrice: string
}
