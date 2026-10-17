import { describe, expect, it } from 'vitest';
import { formatSlotConflictEmails } from '@/infrastructure/email/formatSlotConflictEmails';
import { aBooking, aSlotBooking } from '../../fixtures/aBooking';

const zone = 'America/Argentina/Buenos_Aires';

describe('formatSlotConflictEmails', () => {
  it('asks Sarah to coordinate another time or refund, with the turn that was lost', () => {
    const { toStudio } = formatSlotConflictEmails(aSlotBooking({ notes: 'Con mi pareja' }), zone);

    expect(toStudio.subject).toBe('Pago recibido sin turno disponible: Maternidad — Camila Ríos');
    expect(toStudio.text).toContain('Entró un pago pero el turno ya no está libre: coordiná otro horario o devolvé el pago.');
    expect(toStudio.text).toContain('Turno elegido: jueves, 22 de octubre de 2026, 10:00 h');
    expect(toStudio.text).toContain('Pagado: $ 47.500');
    expect(toStudio.text).toContain('Notas: Con mi pareja');
  });

  it('tells the client her payment arrived and that Sarah will write today', () => {
    const { toCustomer } = formatSlotConflictEmails(aSlotBooking({ paymentPlan: 'full' }), zone);

    expect(toCustomer.subject).toBe('Recibí tu pago: coordinemos otro horario');
    expect(toCustomer.text).toContain('Recibí tu pago. El horario que elegiste se ocupó mientras pagabas; te escribo hoy para coordinar otro.');
    expect(toCustomer.text).toContain('Pagado: $ 95.000');
  });

  it('does not break for a booking without a turn and without notes', () => {
    const { toStudio } = formatSlotConflictEmails(aBooking(), zone);

    expect(toStudio.text).toContain('Turno elegido: Sin turno');
    expect(toStudio.text).toContain('Notas: Sin notas');
  });
});
