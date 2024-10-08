export type Task = {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "DOING" | "DONE" | "BACKLOG";
};
