import React from "react";
import SignUpForm from "./components/SignUpForm";
import { MantineProvider } from "@mantine/core";

const page = () => {
  return (
    <MantineProvider>
      <SignUpForm />
    </MantineProvider>
  );
};

export default page;
