export interface Module {
    name: string;
    icon: string;
}

export interface ModuleGroup {
    id: string;
    title: string;
    color: string;
    count: number;
    description: string;
    modules: Module[];
   }

export interface AdminPanelProps {
  initialModule?: string;
  onBackToDashboard: () => void;
}
