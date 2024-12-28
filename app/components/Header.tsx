import React from "react";
import { Button } from "./ui/button";

type PropTypes = {
  children: React.ReactNode;
};

const Header = ({ children }: PropTypes) => {
  return (
    <>
      <h1 className=" font-bold text-destructive"> {children}</h1>
      <Button>Testing</Button>
    </>
  );
};

export default Header;
