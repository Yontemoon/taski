import React from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  dateTomorrow,
  dateYesterday,
  dateNextMonth,
  datePrevMonth,
} from "@/lib/utils";

const KeybindsContext = React.createContext<{
  setIsNavigational: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// const KeybindsCalendarContext = React.createContext<{
//   setIsNavigational: React.Dispatch<React.SetStateAction<boolean>>;
// } | null>(null);

const KeybindsTodoProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const params = useParams({ from: "/_authed/todo/$id" });
  const [isNavigational, setIsNavigational] = React.useState(true);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (isNavigational) {
        switch (event.key) {
          case "ArrowLeft": {
            const yesterday = dateYesterday(params.id, "string") as string;
            navigate({
              to: "/todo/$id",
              params: { id: yesterday },
            });
            break;
          }
          case "ArrowRight": {
            const tomorrow = dateTomorrow(params.id, "string") as string;
            navigate({
              to: "/todo/$id",
              params: { id: tomorrow },
            });
            break;
          }
        }
      }
    },
    [params.id, navigate, isNavigational]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <KeybindsContext.Provider value={{ setIsNavigational }}>
      {children}
    </KeybindsContext.Provider>
  );
};

const KeybindsCalendarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const params = useParams({ from: "/_authed/calendar/$date" });
  const [isNavigational, setIsNavigational] = React.useState(true);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (isNavigational) {
        switch (event.key) {
          case "ArrowLeft": {
            const prevMonth = datePrevMonth(params.date) as string;
            navigate({
              to: "/calendar/$date",
              params: { date: prevMonth },
            });
            break;
          }
          case "ArrowRight": {
            const nextMonth = dateNextMonth(params.date) as string;
            navigate({
              to: "/calendar/$date",
              params: { date: nextMonth },
            });
            break;
          }
        }
      }
    },
    [params.date, navigate, isNavigational]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <KeybindsContext.Provider value={{ setIsNavigational }}>
      {children}
    </KeybindsContext.Provider>
  );
};

const useKeybinds = () => {
  const keybinds = React.useContext(KeybindsContext);

  if (!keybinds) {
    throw new Error("useKeybinds must be within the context provider.");
  }
  return keybinds;
};

export { useKeybinds, KeybindsTodoProvider, KeybindsCalendarProvider };
