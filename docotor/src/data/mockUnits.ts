import type { BloodUnit, HistoryEvent, HistoryEventType, TestStatus, UnitStatus } from './types';

const MS_PER_DAY = 86_400_000;

function dayOffset(offset: number): string {
  const d = new Date(Date.now() + offset * MS_PER_DAY);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function stampOffset(offset: number, hour = 10, minute = 15): string {
  const d = new Date(Date.now() + offset * MS_PER_DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

let eventSeq = 0;
function ev(type: HistoryEventType, at: string, extra?: Partial<HistoryEvent>): HistoryEvent {
  eventSeq += 1;
  return { id: `h${eventSeq}`, type, at, ...extra };
}

interface Seed {
  id: string;
  bloodGroup: BloodUnit['bloodGroup'];
  component: BloodUnit['component'];
  district: string;
  collectionOffset: number;
  expiryOffset: number;
  storageLocation: string;
  quantity: number;
  collectionStaff: string;
  testStatus: TestStatus;
  status: UnitStatus;
  screeningResult?: string;
  testedBy?: string;
  remarks?: string;
  updatedOffset?: number;
}

const seeds: Seed[] = [
  { id: 'BU-101', bloodGroup: 'O+', component: 'wholeBlood', district: 'Chennai', collectionOffset: -10, expiryOffset: 21, storageLocation: 'Rack A-01', quantity: 4, collectionStaff: 'Nurse Kavitha R.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Anand S.', remarks: 'All markers negative' },
  { id: 'BU-102', bloodGroup: 'A+', component: 'prbc', district: 'Coimbatore', collectionOffset: -5, expiryOffset: 36, storageLocation: 'Rack A-02', quantity: 2, collectionStaff: 'Nurse Priya M.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Meera J.' },
  { id: 'BU-103', bloodGroup: 'B+', component: 'platelets', district: 'Madurai', collectionOffset: -1, expiryOffset: 5, storageLocation: 'Rack B-01', quantity: 1, collectionStaff: 'Nurse Arjun P.', testStatus: 'Pending', status: 'UnderTesting' },
  { id: 'BU-104', bloodGroup: 'O-', component: 'wholeBlood', district: 'Chennai', collectionOffset: -15, expiryOffset: -2, storageLocation: 'Rack D-01', quantity: 3, collectionStaff: 'Nurse Selvi T.', testStatus: 'Passed', status: 'Expired', screeningResult: 'Non-reactive', testedBy: 'Dr. Anand S.' },
  { id: 'BU-105', bloodGroup: 'AB+', component: 'ffp', district: 'Salem', collectionOffset: -3, expiryOffset: 2, storageLocation: 'Rack C-01', quantity: 2, collectionStaff: 'Nurse Deepa N.', testStatus: 'Passed', status: 'Reserved', screeningResult: 'Non-reactive', testedBy: 'Dr. Rajesh K.', remarks: 'Reserved for Theatre 2' },
  { id: 'BU-106', bloodGroup: 'O+', component: 'prbc', district: 'Tiruchirappalli', collectionOffset: -8, expiryOffset: 42, storageLocation: 'Rack B-02', quantity: 2, collectionStaff: 'Nurse Lakshmi S.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Meera J.' },
  { id: 'BU-107', bloodGroup: 'A-', component: 'cryo', district: 'Vellore', collectionOffset: -1, expiryOffset: 1, storageLocation: 'Rack C-02', quantity: 1, collectionStaff: 'Nurse Kavitha R.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Rajesh K.' },
  { id: 'BU-108', bloodGroup: 'B+', component: 'wholeBlood', district: 'Erode', collectionOffset: -6, expiryOffset: -1, storageLocation: 'Rack A-01', quantity: 3, collectionStaff: 'Nurse Priya M.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Anand S.' },
  { id: 'BU-109', bloodGroup: 'O+', component: 'platelets', district: 'Chennai', collectionOffset: 0, expiryOffset: 5, storageLocation: 'Rack B-01', quantity: 1, collectionStaff: 'Nurse Arjun P.', testStatus: 'Pending', status: 'UnderTesting' },
  { id: 'BU-110', bloodGroup: 'AB-', component: 'ffp', district: 'Thoothukudi', collectionOffset: -20, expiryOffset: -5, storageLocation: 'Rack D-02', quantity: 2, collectionStaff: 'Nurse Selvi T.', testStatus: 'Failed', status: 'Discarded', screeningResult: 'Reactive — HBsAg', testedBy: 'Dr. Rajesh K.', remarks: 'Discarded as per protocol BB-14', updatedOffset: -14 },
  { id: 'BU-111', bloodGroup: 'A+', component: 'wholeBlood', district: 'Kancheepuram', collectionOffset: -4, expiryOffset: 36, storageLocation: 'Rack A-02', quantity: 4, collectionStaff: 'Nurse Deepa N.', testStatus: 'Passed', status: 'Reserved', screeningResult: 'Non-reactive', testedBy: 'Dr. Meera J.', remarks: 'Reserved for Dr. Nirmala' },
  { id: 'BU-112', bloodGroup: 'O+', component: 'prbc', district: 'Krishnagiri', collectionOffset: -2, expiryOffset: 30, storageLocation: 'Rack B-02', quantity: 2, collectionStaff: 'Nurse Lakshmi S.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Anand S.' },
  { id: 'BU-113', bloodGroup: 'B-', component: 'prbc', district: 'Thanjavur', collectionOffset: -12, expiryOffset: 24, storageLocation: 'Rack C-01', quantity: 1, collectionStaff: 'Nurse Arjun P.', testStatus: 'Passed', status: 'Used', screeningResult: 'Non-reactive', testedBy: 'Dr. Rajesh K.', remarks: 'Issued to Ward 3', updatedOffset: -6 },
  { id: 'BU-114', bloodGroup: 'O+', component: 'wholeBlood', district: 'Madurai', collectionOffset: -1, expiryOffset: 6, storageLocation: 'Rack A-01', quantity: 3, collectionStaff: 'Nurse Kavitha R.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Meera J.' },
  { id: 'BU-115', bloodGroup: 'A+', component: 'platelets', district: 'Salem', collectionOffset: -1, expiryOffset: 7, storageLocation: 'Rack B-01', quantity: 1, collectionStaff: 'Nurse Priya M.', testStatus: 'Pending', status: 'UnderTesting' },
  { id: 'BU-116', bloodGroup: 'O-', component: 'prbc', district: 'Chennai', collectionOffset: -7, expiryOffset: 35, storageLocation: 'Rack A-02', quantity: 2, collectionStaff: 'Nurse Selvi T.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Anand S.' },
  { id: 'BU-117', bloodGroup: 'AB+', component: 'wholeBlood', district: 'Coimbatore', collectionOffset: -9, expiryOffset: -3, storageLocation: 'Rack D-01', quantity: 2, collectionStaff: 'Nurse Deepa N.', testStatus: 'Passed', status: 'Expired', screeningResult: 'Non-reactive', testedBy: 'Dr. Rajesh K.' },
  { id: 'BU-118', bloodGroup: 'B+', component: 'ffp', district: 'Tirunelveli', collectionOffset: -2, expiryOffset: 28, storageLocation: 'Rack C-02', quantity: 2, collectionStaff: 'Nurse Lakshmi S.', testStatus: 'Passed', status: 'Available', screeningResult: 'Non-reactive', testedBy: 'Dr. Meera J.' },
];

function buildHistory(seed: Seed): HistoryEvent[] {
  const events: HistoryEvent[] = [
    ev('registered', stampOffset(seed.collectionOffset, 9, 30)),
  ];
  const col = seed.collectionOffset;
  if (seed.testStatus !== 'Pending') {
    events.push(ev('testingStarted', stampOffset(col + 1, 11, 0)));
    const updated = seed.updatedOffset ?? col + 2;
    events.push(
      ev('testCompleted', stampOffset(updated, 14, 20), {
        note: `${seed.testStatus} — ${seed.testedBy ?? ''}`.trim(),
      }),
    );
  }
  if (seed.status === 'Reserved') {
    events.push(ev('statusUpdated', stampOffset(col + 3, 16, 0), { status: 'Reserved' }));
  }
  if (seed.status === 'Used') {
    events.push(
      ev('statusUpdated', stampOffset(col + 3, 16, 0), { status: 'Reserved' }),
      ev('statusUpdated', stampOffset(seed.updatedOffset ?? col + 5, 10, 45), { status: 'Used', note: seed.remarks }),
    );
  }
  if (seed.status === 'Discarded') {
    events.push(
      ev('statusUpdated', stampOffset(seed.updatedOffset ?? col + 5, 12, 10), { status: 'Discarded', note: seed.remarks }),
    );
  }
  if (seed.status === 'Expired') {
    events.push(ev('statusUpdated', stampOffset(seed.expiryOffset + 1, 8, 0), { status: 'Expired' }));
  }
  return events.sort((a, b) => a.at.localeCompare(b.at));
}

export const MOCK_UNITS: BloodUnit[] = seeds.map((seed) => {
  const history = buildHistory(seed);
  return {
    id: seed.id,
    bloodGroup: seed.bloodGroup,
    component: seed.component,
    district: seed.district,
    collectionDate: dayOffset(seed.collectionOffset),
    expiryDate: dayOffset(seed.expiryOffset),
    storageLocation: seed.storageLocation,
    quantity: seed.quantity,
    collectionStaff: seed.collectionStaff,
    testStatus: seed.testStatus,
    status: seed.status,
    screeningResult: seed.screeningResult,
    testedBy: seed.testedBy,
    testDate: seed.testStatus !== 'Pending' ? dayOffset(seed.collectionOffset + 2) : undefined,
    remarks: seed.remarks,
    updatedAt: history[history.length - 1].at,
    history,
  };
});
