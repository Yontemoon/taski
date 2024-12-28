import React from "react";

type PropTypes = {
  children: React.ReactNode;
};

const Header = ({ children }: PropTypes) => {
  return <h1 className="text-xl font-bold "> {children}</h1>;
};

export default Header;
