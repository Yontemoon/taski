import React from "react";
import { useTodo } from "@/context/todo";

const DayWrapper = ({
  children,
}: { children: React.ReactNode } & React.ComponentProps<"div">) => {
  const { set } = useTodo();
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    let initInvis = 0;
    ref.current?.childNodes.forEach((node) => {
      const child = node.firstChild as HTMLDivElement;
      if (child && child.className.includes("invisible")) {
        initInvis++;
      }
    });
    set(initInvis);
  }, []);

  return (
    <div
      ref={ref}
      className="gap-y-1 flex flex-col relative overflow-visible max-h-52"
    >
      {children}
    </div>
  );
};

export default DayWrapper;
