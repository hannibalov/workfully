import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "../../shared/constants"; // Ensure this path is correct

const API_URL = "/api/tasks"; // Update to your actual API endpoint

export const useTaskQueries = (options = {}) => {
  const queryClient = useQueryClient();

  // Fetch tasks
  const fetchTasks = async (): Promise<Task[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  };

  const addTask = async ({
    title,
    description,
  }: Pick<Task, "description" | "title">): Promise<Task> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });
    if (!response.ok) throw new Error("Failed to add task");
    return response.json();
  };

  // Update task mutation
  const updateTask = async ({
    id,
    status,
  }: Pick<Task, "id" | "status">): Promise<Task> => {
    const response = await fetch(`${API_URL}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, id }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update task");
    }
    return response.json();
  };

  // Query for fetching tasks
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    ...options,
  });

  // Mutation for adding a new task
  const addTaskMutation = useMutation<
    Task,
    Error,
    Pick<Task, "description" | "title">
  >({
    mutationFn: addTask,
    onSuccess: () => {
      // Invalidate and refetch tasks after adding a new task
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Mutation for updating task
  const updateTaskMutation = useMutation<
    Task,
    Error,
    Pick<Task, "id" | "status">
  >({
    mutationFn: updateTask,
    onSuccess: () => {
      // Invalidate and refetch tasks after updating a task
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    updateTaskMutation,
    addTaskMutation,
    updateTask,
    addTask,
  };
};
