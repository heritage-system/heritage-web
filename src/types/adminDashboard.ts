export interface Module {
    name: string;
    icon: string;
}

export interface ModuleGroup {
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
