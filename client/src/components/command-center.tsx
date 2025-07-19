import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

const commands = [
  "/balance @user",
  "/transaction [id]",
  "/history @user [limit]",
  "/merchants",
  "/pay @user [amount]",
  "/order [merchant] [amount]",
];

export default function CommandCenter() {
  const handleTestCommand = () => {
    alert("Command test feature - integrate with Discord.js bot");
  };

  return (
    <div className="discord-darker rounded-xl border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Terminal className="w-5 h-5 mr-2" />
          Command Center
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
            <div className="discord-text mb-2">Available Commands:</div>
            <div className="space-y-1">
              {commands.map((command, index) => (
                <div key={index} className="text-[hsl(var(--discord-primary))]">
                  {command}
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={handleTestCommand}
            className="w-full discord-primary hover:bg-[hsl(var(--discord-secondary))] font-medium transition-colors"
          >
            Test Command
          </Button>
        </div>
      </div>
    </div>
  );
}
