import { Keyboard, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal = ({ isOpen, onClose }: Props) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space or N", desc: "Call Next Token", category: "Queue Flow" },
    { key: "Enter or S", desc: "Mark Currently Called as Served", category: "Queue Flow" },
    { key: "K or X", desc: "Skip / Mark No-Show", category: "Queue Flow" },
    { key: "A or +", desc: "Add Walk-In Token Modal", category: "Front Desk" },
    { key: "R", desc: "Sync & Refresh Queue Data", category: "Front Desk" },
    { key: "?", desc: "Open this Keyboard Shortcuts Guide", category: "Help" },
    { key: "Esc", desc: "Close any Open Dialog / Modal", category: "Navigation" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Front-Desk Hotkeys</h3>
              <p className="text-xs text-muted-foreground">Lightning keyboard controls for front-desk operators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/40 transition-colors">
              <span className="text-xs font-medium text-foreground">{s.desc}</span>
              <kbd className="inline-flex items-center px-2.5 py-1 rounded-md border border-border bg-muted font-mono text-xs font-bold text-primary shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Shortcuts active across the dashboard</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl gradient-bg text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
