import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { MOCK_UNITS } from '../data/mockUnits';
import type { BloodUnit, HistoryEvent, NewUnitInput, TestResultInput, UnitStatus } from '../data/types';
import { getEffectiveStatus } from '../utils/expiry';

interface UnitContextValue {
  units: BloodUnit[];
  getUnit: (id: string) => BloodUnit | undefined;
  addUnit: (input: NewUnitInput) => BloodUnit;
  updateUnit: (id: string, input: Partial<NewUnitInput>) => BloodUnit | undefined;
  recordTest: (id: string, input: TestResultInput) => BloodUnit | undefined;
  updateStatus: (id: string, status: UnitStatus, note?: string) => BloodUnit | undefined;
}

const UnitContext = createContext<UnitContextValue | null>(null);

function makeEvent(type: HistoryEvent['type'], extra?: Partial<HistoryEvent>): HistoryEvent {
  return {
    id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    at: new Date().toISOString(),
    ...extra,
  };
}

export function UnitProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<BloodUnit[]>(() =>
    MOCK_UNITS.map((u) => {
      const effective = getEffectiveStatus(u);
      return effective === 'Expired' && u.status !== 'Expired' ? { ...u, status: 'Expired' as UnitStatus } : u;
    }),
  );

  const getUnit = useCallback((id: string) => units.find((u) => u.id === id), [units]);

  const addUnit = useCallback((input: NewUnitInput) => {
    const registered = makeEvent('registered');
    const unit: BloodUnit = {
      ...input,
      testStatus: 'Pending',
      status: 'UnderTesting',
      updatedAt: registered.at,
      history: [registered, makeEvent('testingStarted')],
    };
    setUnits((prev) => [unit, ...prev]);
    return unit;
  }, []);

  const updateUnit = useCallback((id: string, input: Partial<NewUnitInput>) => {
    let updated: BloodUnit | undefined;
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const event = makeEvent('statusUpdated');
        updated = {
          ...u,
          ...input,
          // keep derived expiry status honest after date edits
          status:
            u.status === 'Expired'
              ? input.expiryDate && new Date(input.expiryDate) >= new Date(new Date().toDateString())
                ? u.testStatus === 'Passed'
                  ? 'Available'
                  : 'UnderTesting'
                : 'Expired'
              : u.status,
          updatedAt: event.at,
          history: [...u.history, event],
        };
        return updated;
      }),
    );
    return updated;
  }, []);

  const recordTest = useCallback((id: string, input: TestResultInput) => {
    let updated: BloodUnit | undefined;
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const history = [...u.history];
        const testEvent = makeEvent('testCompleted', {
          note: `${input.testStatus}${input.testedBy ? ` — ${input.testedBy}` : ''}`,
        });
        history.push(testEvent);

        const effective = getEffectiveStatus({ ...u, expiryDate: u.expiryDate });
        let nextStatus: UnitStatus;
        if (input.testStatus === 'Failed') nextStatus = 'Discarded';
        else if (input.testStatus === 'Passed') nextStatus = effective === 'Expired' ? 'Expired' : 'Available';
        else nextStatus = 'UnderTesting';

        if (nextStatus !== u.status) {
          history.push(makeEvent('statusUpdated', { status: nextStatus }));
        }

        updated = {
          ...u,
          testStatus: input.testStatus,
          screeningResult: input.screeningResult,
          testedBy: input.testedBy,
          testDate: input.testDate,
          remarks: input.remarks ?? u.remarks,
          status: nextStatus,
          updatedAt: testEvent.at,
          history,
        };
        return updated;
      }),
    );
    return updated;
  }, []);

  const updateStatus = useCallback((id: string, status: UnitStatus, note?: string) => {
    let updated: BloodUnit | undefined;
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const event = makeEvent('statusUpdated', { status, note });
        updated = { ...u, status, updatedAt: event.at, history: [...u.history, event] };
        return updated;
      }),
    );
    return updated;
  }, []);

  const value = useMemo(
    () => ({ units, getUnit, addUnit, updateUnit, recordTest, updateStatus }),
    [units, getUnit, addUnit, updateUnit, recordTest, updateStatus],
  );

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>;
}

export function useUnits(): UnitContextValue {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error('useUnits must be used within UnitProvider');
  return ctx;
}
