export interface System {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  status: 'active' | 'inactive' | 'maintenance';
  category: string;
}

export interface InstallStep {
  step: number;
  title: string;
  description: string;
  commands?: string[];
  note?: string;
}
