import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DrizzleBookingRepository } from '@/infrastructure/db/DrizzleBookingRepository';
import { DrizzlePaymentRepository } from '@/infrastructure/db/DrizzlePaymentRepository';
import { payments } from '@/infrastructure/db/schema';
import type { Database } from '@/infrastructure/db/Database';
import { aBooking } from '../../fixtures/aBooking';
import { aPayment } from '../../fixtures/aPayment';
import { createTestDatabase } from '../../support/createTestDatabase';

const BOOKING_ID = '11111111-1111-4111-8111-111111111111';
const FIRST_PAYMENT_ID = '33333333-3333-4333-8333-333333333331';
const SECOND_PAYMENT_ID = '33333333-3333-4333-8333-333333333332';
const BALANCE_PAYMENT_ID = '33333333-3333-4333-8333-333333333333';

describe('DrizzlePaymentRepository', () => {
  let database: Database;
  let repository: DrizzlePaymentRepository;
  let close: () => Promise<void>;

  beforeEach(async () => {
    const created = await createTestDatabase();
    database = created.db;
    close = created.close;
    repository = new DrizzlePaymentRepository(database);
    await new DrizzleBookingRepository(database).create(aBooking({ id: BOOKING_ID }));
  });

  afterEach(async () => {
    await close();
  });

  const aStoredPayment = (id: string, overrides = {}) => aPayment({ id, bookingId: BOOKING_ID, ...overrides });

  it('stores a pending deposit without gateway payment id and gives it back', async () => {
    const payment = aStoredPayment(FIRST_PAYMENT_ID);

    await repository.create(payment);

    const stored = await repository.findById(FIRST_PAYMENT_ID);
    expect(stored).toEqual(payment);
    expect(stored?.externalPaymentId).toBeNull();
  });

  it('records the gateway payment, its status and the raw response when the webhook arrives', async () => {
    const payment = aStoredPayment(FIRST_PAYMENT_ID, { updatedAt: new Date('2020-01-01T00:00:00Z') });
    await repository.create(payment);

    await repository.update({ ...payment, externalPaymentId: 'ext-1', status: 'approved', raw: { id: 'ext-1', status: 'approved' } });

    const stored = await repository.findById(FIRST_PAYMENT_ID);
    expect(stored).toMatchObject({ externalPaymentId: 'ext-1', status: 'approved', raw: { id: 'ext-1', status: 'approved' } });
    expect(stored?.updatedAt.getTime()).toBeGreaterThan(payment.updatedAt.getTime());
  });

  it('stores an empty object when the gateway sent no raw payload', async () => {
    const payment = aStoredPayment(FIRST_PAYMENT_ID, { raw: null });
    await repository.create(payment);

    expect((await repository.findById(FIRST_PAYMENT_ID))?.raw).toEqual({});

    await repository.update({ ...payment, raw: null, status: 'rejected' });

    expect(await repository.findById(FIRST_PAYMENT_ID)).toMatchObject({ raw: {}, status: 'rejected' });
  });

  it('returns the latest deposit attempt when the client retried the payment', async () => {
    await repository.create(aStoredPayment(FIRST_PAYMENT_ID, { status: 'rejected', createdAt: new Date('2026-10-17T15:00:00Z') }));
    await repository.create(aStoredPayment(SECOND_PAYMENT_ID, { createdAt: new Date('2026-10-17T16:00:00Z') }));

    expect((await repository.findLatestForBooking(BOOKING_ID, 'deposit'))?.id).toBe(SECOND_PAYMENT_ID);
  });

  it('keeps deposit and balance payments apart', async () => {
    await repository.create(aStoredPayment(FIRST_PAYMENT_ID));
    await repository.create(aStoredPayment(BALANCE_PAYMENT_ID, { kind: 'balance', createdAt: new Date('2026-11-20T10:00:00Z') }));

    expect((await repository.findLatestForBooking(BOOKING_ID, 'deposit'))?.id).toBe(FIRST_PAYMENT_ID);
    expect((await repository.findLatestForBooking(BOOKING_ID, 'balance'))?.id).toBe(BALANCE_PAYMENT_ID);
  });

  it('has no latest payment for a booking without attempts', async () => {
    expect(await repository.findLatestForBooking(BOOKING_ID, 'deposit')).toBeNull();
  });

  it('has no latest payment when the booking id is not a uuid', async () => {
    expect(await repository.findLatestForBooking('no-es-un-uuid', 'deposit')).toBeNull();
  });

  it('does not find a payment that does not exist or whose id is not a uuid', async () => {
    expect(await repository.findById('44444444-4444-4444-8444-444444444444')).toBeNull();
    expect(await repository.findById('someone-else')).toBeNull();
  });

  it('removes the payments when the booking is deleted', async () => {
    await repository.create(aStoredPayment(FIRST_PAYMENT_ID));

    await database.execute(`delete from bookings where id = '${BOOKING_ID}'`);

    expect(await repository.findById(FIRST_PAYMENT_ID)).toBeNull();
    expect(await database.select().from(payments)).toEqual([]);
  });

  it('refuses a payment for a booking that does not exist', async () => {
    await expect(repository.create(aPayment({ id: FIRST_PAYMENT_ID, bookingId: '55555555-5555-4555-8555-555555555555' }))).rejects.toThrow();
  });

  it('lists every attempt of a booking oldest first, for the deposit and the full payment alike', async () => {
    await repository.create(aStoredPayment(SECOND_PAYMENT_ID, { createdAt: new Date('2026-10-17T16:00:00Z'), kind: 'full' }));
    await repository.create(aStoredPayment(FIRST_PAYMENT_ID, { createdAt: new Date('2026-10-17T15:00:00Z') }));

    const attempts = await repository.listForBooking(BOOKING_ID);

    expect(attempts.map((payment) => [payment.id, payment.kind])).toEqual([
      [FIRST_PAYMENT_ID, 'deposit'],
      [SECOND_PAYMENT_ID, 'full'],
    ]);
  });

  it('lists nothing for a booking without attempts or an id that is not a uuid', async () => {
    expect(await repository.listForBooking('44444444-4444-4444-8444-444444444444')).toEqual([]);
    expect(await repository.listForBooking('no-es-un-uuid')).toEqual([]);
  });
});
