import { Button } from "@/components/ui/button";
import { Plus, Bell, User } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="discord-darker border-b border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="discord-text mt-1">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          {action && (
            <Button
              onClick={action.onClick}
              className="discord-primary hover:bg-[hsl(var(--discord-secondary))] font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 discord-text" />
            <div className="w-8 h-8 discord-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
