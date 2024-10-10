import { Task } from "@/shared/constants";
import React, { createContext, useContext, useState } from "react";

type DragContextType = {
  draggingTask: Pick<Task, "id" | "status" | "title"> | null;
  setDraggingTask: (task: Pick<Task, "id" | "status" | "title"> | null) => void;
};

const DragContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [draggingTask, setDraggingTask] = useState<Pick<
    Task,
    "id" | "status" | "title"
  > | null>(null);

  return (
    <DragContext.Provider value={{ draggingTask, setDraggingTask }}>
      {children}
    </DragContext.Provider>
  );
};

export const useDrag = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDrag must be used within a DragProvider");
  }
  return context;
};
