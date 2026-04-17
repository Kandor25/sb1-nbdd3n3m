export interface ReportContract {
  id: string;
  number: string;
  type: string;
  counterpartyName: string;
  commodityName: string;
  quantity: number;
  status: string;
  createdAt: Date;
  parentContractId: string | null;
  adendaNumber: number | null;
}
