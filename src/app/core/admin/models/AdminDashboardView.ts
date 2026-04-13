import {ShortSaleResp} from '../../client/models/client-dashboard-info';

export interface AdminDashboardView{
  sales: ShortSaleResp[],
  // stats: Stats
  // reminders: Reminder[]
}
