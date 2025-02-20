import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";

type PropTypes = {
  children: React.ReactNode;
} & LinkProps;

const LinkIcon = ({ children, to, ...props }: PropTypes) => {
  return (
    <Link
      to={to}
      className="p-3 inline-flex rounded-lg items-center hover:bg-foreground/10 transition-all duration-100 border-transparent  border-2 "
      activeProps={{
        className: " border-2 border-foreground rounded-lg",
      }}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LinkIcon;
