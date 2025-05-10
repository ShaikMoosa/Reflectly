"use server";

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '../utils/supabase/server'; // Updated import
import { Database, Tables, TablesInsert, TablesUpdate } from '../utils/supabase/database.types'; // Corrected path
import { redirect } from 'next/navigation';

type PlannerColumn = Tables<'planner_columns'>;
type PlannerTask = Tables<'planner_tasks'>;

// Helper to get user ID or throw error
const getUserIdOrThrow = async (): Promise<string> => {
  const authResult = await auth(); // Await the auth() call
  if (!authResult.userId) {
    // Redirecting instead of throwing might be better UX in some server actions
    // For getPlannerData, throwing is okay as the page expects data.
    // Consider redirect('/sign-in') in mutation actions if appropriate.
    throw new Error("User not authenticated.");
  }
  return authResult.userId;
};

// Type for combined planner data
export type PlannerData = {
  columns: Array<PlannerColumn & { tasks: PlannerTask[] }>
};

// --- Fetch Data ---
export const getPlannerData = async (): Promise<PlannerData> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  // Fetch columns and tasks in parallel
  const [columnsResult, tasksResult] = await Promise.all([
    supabase
      .from('planner_columns')
      .select('*')
      .eq('user_id', userId)
      .order('column_order', { ascending: true }),
    supabase
      .from('planner_tasks')
      .select('*')
      .eq('user_id', userId)
      // No need to order here, will sort after grouping
  ]);

  const { data: columns, error: columnsError } = columnsResult;
  const { data: tasks, error: tasksError } = tasksResult;

  if (columnsError) {
    console.error("Error fetching columns:", columnsError);
    throw new Error(`Failed to fetch columns: ${columnsError.message}`);
  }
  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
  }
  if (!columns || !tasks) {
     throw new Error("Failed to fetch planner data: Columns or tasks missing.");
  }

  // Combine tasks into columns
  const columnsWithTasks = columns.map((column: PlannerColumn) => ({
    ...column,
    tasks: tasks
           .filter((task: PlannerTask) => task.column_id === column.id)
           .sort((a: PlannerTask, b: PlannerTask) => a.task_order - b.task_order)
  }));

  return { columns: columnsWithTasks };
};

// --- Column Actions ---
export const addColumn = async (title: string): Promise<PlannerColumn> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  // Get max current order
  const { data: maxOrderData, error: maxOrderError } = await supabase
    .from('planner_columns')
    .select('column_order')
    .eq('user_id', userId)
    .order('column_order', { ascending: false })
    .limit(1)
    .maybeSingle(); // Use maybeSingle to handle 0 columns gracefully

  if (maxOrderError) {
     console.error("Error fetching max column order:", maxOrderError);
     throw new Error(`Failed to determine column order: ${maxOrderError.message}`);
  }

  const newOrder = (maxOrderData?.column_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('planner_columns')
    .insert({ title, user_id: userId, column_order: newOrder })
    .select()
    .single();

  if (error || !data) {
    console.error("Error adding column:", error);
    throw new Error(`Failed to add column: ${error?.message ?? 'No data returned'}`);
  }

  revalidatePath('/planner');
  return data;
};

export const updateColumnTitle = async (id: string, title: string): Promise<PlannerColumn> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  const { data, error } = await supabase
    .from('planner_columns')
    .update({ title })
    .eq('id', id)
    .eq('user_id', userId) // Ensure user owns the column
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating column title:", error);
    throw new Error(`Failed to update column title: ${error?.message ?? 'No data returned'}`);
  }

  revalidatePath('/planner');
  return data;
};

export const deleteColumn = async (id: string): Promise<void> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  // Note: Tasks within the column are deleted automatically due to ON DELETE CASCADE
  const { error } = await supabase
    .from('planner_columns')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Ensure user owns the column

  if (error) {
    console.error("Error deleting column:", error);
    throw new Error(`Failed to delete column: ${error.message}`);
  }

  revalidatePath('/planner');
};

export const updateColumnOrder = async (orderedColumnIds: string[]): Promise<void> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  const updates = orderedColumnIds.map((id, index) =>
    supabase
      .from('planner_columns')
      .update({ column_order: index })
      .eq('id', id)
      .eq('user_id', userId)
  );

  const results = await Promise.all(updates);
  // Add explicit typing for results
  const errors = results.map((res: { error: any | null }) => res.error).filter(Boolean);

  if (errors.length > 0) {
    console.error("Errors updating column order:", errors);
    // Add explicit typing for errors
    throw new Error(`Failed to update column order: ${errors.map((e: any) => e?.message).join(', ')}`);
  }

  revalidatePath('/planner');
};

// --- Task Actions ---
export const addTask = async (columnId: string, content: string): Promise<PlannerTask> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  // Get max current task order in the target column
   const { data: maxOrderData, error: maxOrderError } = await supabase
    .from('planner_tasks')
    .select('task_order')
    .eq('user_id', userId) // Ensure task belongs to user
    .eq('column_id', columnId)
    .order('task_order', { ascending: false })
    .limit(1)
    .maybeSingle(); // Use maybeSingle to handle 0 tasks gracefully

  if (maxOrderError) {
     console.error("Error fetching max task order:", maxOrderError);
     throw new Error(`Failed to determine task order: ${maxOrderError.message}`);
  }

  const newOrder = (maxOrderData?.task_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({ content, column_id: columnId, user_id: userId, task_order: newOrder })
    .select()
    .single();

  if (error || !data) {
    console.error("Error adding task:", error);
    throw new Error(`Failed to add task: ${error?.message ?? 'No data returned'}`);
  }

  revalidatePath('/planner');
  return data;
};

export const updateTaskContent = async (id: string, content: string): Promise<PlannerTask> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  const { data, error } = await supabase
    .from('planner_tasks')
    .update({ content })
    .eq('id', id)
    .eq('user_id', userId) // Ensure user owns the task
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating task content:", error);
    throw new Error(`Failed to update task content: ${error?.message ?? 'No data returned'}`);
  }

  revalidatePath('/planner');
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  const { error } = await supabase
    .from('planner_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId); // Ensure user owns the task

  if (error) {
    console.error("Error deleting task:", error);
    throw new Error(`Failed to delete task: ${error.message}`);
  }

  revalidatePath('/planner');
};

export const updateTaskOrder = async (
  updates: Array<{ id: string; column_id: string; task_order: number }>
): Promise<void> => {
  const userId = await getUserIdOrThrow(); // Await the helper
  const supabase = createClient();

  // Prepare updates for batch processing (if supported or do sequentially)
  // Supabase batch update isn't straightforward for different rows like this.
  // We'll perform updates sequentially for simplicity, though transactions
  // or a stored procedure would be more robust for atomicity.

  const updatePromises = updates.map(update =>
    supabase
      .from('planner_tasks')
      .update({ column_id: update.column_id, task_order: update.task_order })
      .eq('id', update.id)
      .eq('user_id', userId) // Ensure user owns the task
  );

  try {
    const results = await Promise.all(updatePromises);
    // Add explicit typing for results
    const errors = results.map((res: { error: any | null }) => res.error).filter(Boolean);
    if (errors.length > 0) {
      throw errors;
    }
    revalidatePath('/planner');
  } catch (errors: any) {
      console.error("Errors updating task order:", errors);
      // Combine error messages if possible
      // Add explicit typing for errors
      const errorMessages = Array.isArray(errors)
        ? errors.map((e: any) => e?.message).join(', ')
        : errors?.message ?? 'Unknown error';
      throw new Error(`Failed to update task order: ${errorMessages}`);
  }
}; 