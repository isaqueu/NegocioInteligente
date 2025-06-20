import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'paga':
      return 'bg-green-100 text-green-800';
    case 'vencida':
      return 'bg-red-100 text-red-800';
    case 'a_vencer':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'paga':
      return 'Paga';
    case 'vencida':
      return 'Vencida';
    case 'a_vencer':
      return 'A Vencer';
    default:
      return 'Pendente';
  }
}

export function getRoleColor(papel: string): string {
  switch (papel) {
    case 'pai':
      return 'bg-blue-100 text-blue-800';
    case 'mae':
      return 'bg-pink-100 text-pink-800';
    case 'filho':
      return 'bg-green-100 text-green-800';
    case 'filha':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getRoleLabel(papel: string): string {
  switch (papel) {
    case 'pai':
      return 'Pai';
    case 'mae':
      return 'Mãe';
    case 'filho':
      return 'Filho';
    case 'filha':
      return 'Filha';
    default:
      return papel;
  }
}
