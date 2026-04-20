import { db } from '../db/db';
import type { ConsultantRecord } from '../db/schema';

export async function createConsultant(input: Omit<ConsultantRecord, 'id'>) {
  const name = input.name.trim();
  if (!name) throw new Error('Name is required');

  const consultant: ConsultantRecord = {
    name,
    contact: input.contact?.trim() || undefined,
    city: input.city?.trim() || undefined,
    active: input.active,
  };

  const id = await db.consultants.add(consultant);
  return { ...consultant, id };
}

export async function updateConsultant(id: number, patch: Partial<Omit<ConsultantRecord, 'id'>>) {
  const existing = await db.consultants.get(id);
  if (!existing) throw new Error('Consultant not found');

  const next: ConsultantRecord = {
    ...existing,
    ...patch,
    name: patch.name != null ? patch.name.trim() : existing.name,
    contact: patch.contact != null ? patch.contact.trim() : existing.contact,
    city: patch.city != null ? patch.city.trim() : existing.city,
  };

  await db.consultants.put({ ...next, id });
  return { ...next, id };
}
