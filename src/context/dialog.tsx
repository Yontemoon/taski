import React from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const DialogContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null!);

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent ref={ref}>testing</DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};

const useDialog = () => {
  const dialog = React.useContext(DialogContext);

  if (!dialog) {
    throw new Error("useDialog must be within the context provider");
  }

  return dialog;
};

export { useDialog, DialogProvider };
