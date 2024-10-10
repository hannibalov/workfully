import React, { createContext, useContext, useState } from "react";
import SnackMessage from "../components/SnackMessage";

interface SnackbarContextProps {
  showMessage: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
  };

  const hideMessage = () => setMessage(null);

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      {message && <SnackMessage snackMessage={message} onClose={hideMessage} />}
    </SnackbarContext.Provider>
  );
};
