export interface IGetProject {
  id: number;
  managerId: number;
  name: string;
  projectKey: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  status: string;
  manager: IManager;
  _count: ICount;
}

interface IManager {
  id: number;
  fullName: string;
  avatarUrl: string;
}

interface ICount {
  members: number;
}

export enum ProjectStatuses {
  'active' = 'Ativo',
  'in_progress' = 'Em Andamento',
  'finalized' = 'Finalizado'
}