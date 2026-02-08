import { type FilterContext, type FilterResult, type FilterToken } from '../constants';
import { HttpException } from '../exceptions';

function instantiateFilter(filter: FilterToken) {
  if (typeof filter === 'function') {
    return new filter();
  }
  return filter;
}

export async function runFilterChain(
  error: unknown,
  context: FilterContext,
  filters: FilterToken[],
): Promise<FilterResult> {
  for (const token of filters) {
    const filter = instantiateFilter(token);
    const result = await filter.catch(error, context);
    if (result) return result;
  }

  if (error instanceof HttpException) {
    return {
      status: error.status,
      body: { message: error.message },
      contentType: 'json',
    };
  }

  return {
    status: 500,
    body: 'Internal Server Error',
    contentType: 'text',
  };
}

