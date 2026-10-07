import * as store from "./taskStore.js";

export const tools = [
  {
    name: "createTask",
    description:
      "Create a new todo task. Use when the user wants to add something or be reminded of something.",
    input_schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Short task title, e.g. 'Work on OOPS'",
        },
        dueDate: {
          type: "string",
          description: "Due date in YYYY-MM-DD format, only if the user mentioned one",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "listTasks",
    description: "List all tasks with their ids, titles, due dates and completion status.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "completeTask",
    description:
      "Mark a task as completed using its numeric id. If you don't know the id, call listTasks first.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "number", description: "The task id" },
      },
      required: ["id"],
    },
  },
  {
    name: "deleteTask",
    description:
      "Delete a task using its numeric id. If you don't know the id, call listTasks first.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "number", description: "The task id" },
      },
      required: ["id"],
    },
  },
];

export function executeTool(name, input) {
  switch (name) {
    case "createTask":
      return store.createTask(input.title, input.dueDate);
    case "listTasks":
      return store.listTasks();
    case "completeTask":
      return store.completeTask(input.id) ?? { error: "Task not found" };
    case "deleteTask":
      return store.deleteTask(input.id)
        ? { success: true }
        : { error: "Task not found" };
    default:
      return { error: `Unknown tool: ${name}` };
  }
}