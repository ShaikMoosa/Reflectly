import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

/**
 * Options for pagination
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

/**
 * Options for ordering
 */
export interface OrderOptions {
  column: string;
  ascending?: boolean;
  nullsFirst?: boolean;
}

/**
 * Options for filtering
 */
export interface FilterOptions<T = any> {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: T;
}

/**
 * Options for text search
 */
export interface TextSearchOptions {
  column: string;
  query: string;
  config?: string;
}

/**
 * Main query builder class for Supabase
 */
export class QueryBuilder<T> {
  private client: SupabaseClient<Database>;
  private tableName: string;
  private selectColumns: string[] = ['*'];
  private countMode: 'exact' | 'planned' | 'estimated' | null = null;
  private filtersList: FilterOptions[] = [];
  private orFilterGroups: FilterOptions[][] = [];
  private ordersList: OrderOptions[] = [];
  private paginationOpts: PaginationOptions = { limit: 50, offset: 0 };
  private textSearchOpts: TextSearchOptions | null = null;
  private relationsList: string[] = [];

  constructor(client: SupabaseClient<Database>, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Select specific columns
   */
  select(columns: string | string[]): QueryBuilder<T> {
    if (typeof columns === 'string') {
      this.selectColumns = [columns];
    } else {
      this.selectColumns = columns;
    }
    return this;
  }

  /**
   * Select with count
   */
  selectWithCount(countMode: 'exact' | 'planned' | 'estimated' = 'exact'): QueryBuilder<T> {
    this.countMode = countMode;
    return this;
  }

  /**
   * Add a filter
   */
  filter(column: string, operator: FilterOptions['operator'], value: any): QueryBuilder<T> {
    this.filtersList.push({ column, operator, value });
    return this;
  }

  /**
   * Add an OR filter group
   */
  orFilter(filters: FilterOptions[]): QueryBuilder<T> {
    this.orFilterGroups.push(filters);
    return this;
  }

  /**
   * Add a text search
   */
  textSearch(options: TextSearchOptions): QueryBuilder<T> {
    this.textSearchOpts = options;
    return this;
  }

  /**
   * Add ordering
   */
  orderBy(options: OrderOptions): QueryBuilder<T> {
    this.ordersList.push(options);
    return this;
  }

  /**
   * Set pagination
   */
  paginate(options: PaginationOptions): QueryBuilder<T> {
    // Convert page/pageSize to offset/limit if provided
    if (options.page !== undefined && options.pageSize !== undefined) {
      options.offset = (options.page - 1) * options.pageSize;
      options.limit = options.pageSize;
    }

    this.paginationOpts = {
      ...this.paginationOpts,
      ...options,
    };
    return this;
  }

  /**
   * Include related data
   */
  with(relation: string): QueryBuilder<T> {
    this.relationsList.push(relation);
    return this;
  }

  /**
   * Build and execute the query
   */
  async execute(): Promise<{ data: T[] | null; count: number | null; error: any }> {
    let query = this.client.from(this.tableName).select(
      this.selectColumns.join(','),
      this.countMode ? { count: this.countMode } : undefined
    );

    // Apply filters
    for (const filter of this.filtersList) {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value);
          break;
        case 'gt':
          query = query.gt(filter.column, filter.value);
          break;
        case 'gte':
          query = query.gte(filter.column, filter.value);
          break;
        case 'lt':
          query = query.lt(filter.column, filter.value);
          break;
        case 'lte':
          query = query.lte(filter.column, filter.value);
          break;
        case 'like':
          query = query.like(filter.column, filter.value);
          break;
        case 'ilike':
          query = query.ilike(filter.column, filter.value);
          break;
        case 'in':
          query = query.in(filter.column, filter.value);
          break;
        case 'is':
          query = query.is(filter.column, filter.value);
          break;
      }
    }

    // Apply OR filters
    for (const group of this.orFilterGroups) {
      const orConditions = group.map(f => `${f.column}.${f.operator}.${f.value}`).join(',');
      query = query.or(orConditions);
    }

    // Apply text search
    if (this.textSearchOpts) {
      const { column, query: searchQuery, config } = this.textSearchOpts;
      query = query.textSearch(column, searchQuery, {
        config,
        type: 'websearch',
      });
    }

    // Apply ordering
    for (const order of this.ordersList) {
      query = query.order(order.column, {
        ascending: order.ascending !== false,
        nullsFirst: order.nullsFirst,
      });
    }

    // Apply pagination
    if (this.paginationOpts.limit !== undefined) {
      const { offset = 0, limit } = this.paginationOpts;
      query = query.range(offset, offset + limit - 1);
    }

    // Execute query
    const { data, error, count } = await query;

    return { data, count, error };
  }

  /**
   * Build and execute the query for a single result
   */
  async executeSingle(): Promise<{ data: T | null; error: any }> {
    let query = this.client.from(this.tableName).select(this.selectColumns.join(','));

    // Apply filters
    for (const filter of this.filtersList) {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value);
          break;
        // ...other operators
      }
    }

    // Execute query
    const { data, error } = await query.single();

    return { data, error };
  }
}

/**
 * Create a query builder for a specific table
 */
export function createQueryBuilder<T = any>(
  client: SupabaseClient<Database>,
  tableName: string
): QueryBuilder<T> {
  return new QueryBuilder<T>(client, tableName);
} 