import { getActionContext } from 'astro:actions';
import type { APIContext } from 'astro';

export interface InvokedAction {
  name: string;
  fromForm: boolean;
}

export const invokedAction = (context: APIContext): InvokedAction | null => {
  const { action } = getActionContext(context);
  return action ? { name: action.name.replace(/\/+$/, ''), fromForm: action.calledFrom === 'form' } : null;
};
