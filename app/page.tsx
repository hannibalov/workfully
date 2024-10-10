"use client";

import React from "react";
import { SnackbarProvider } from "./frontend/context/snackbarContext";
import Board from "./frontend/components/layouts/Board";

// Define the Home component
export default function Home() {
  return (
    <SnackbarProvider>
      <Board />
    </SnackbarProvider>
  );
}
