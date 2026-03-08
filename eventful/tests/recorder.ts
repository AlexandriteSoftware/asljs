type TraceRecord =
  { action: string;
    payload: any; };

type Recorder =
  { write: (action: any, payload: any) => void;
    records: () => TraceRecord[]; };

export function createRecorder(
  ): Recorder
{
  const records: TraceRecord[] = [];

  return {
    write:
      (action: any, payload: any): void => {
        records.push({ action, payload });
      },
    records:
      (): TraceRecord[] => records
  };
}
