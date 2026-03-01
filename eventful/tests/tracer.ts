type TraceRecord = {
  action: string;
  payload: any;
};

type Tracer = {
  trace: (action: any, payload: any) => void;
  getTraces: () => TraceRecord[];
  getTracesByAction: (action: string) => TraceRecord[];
  getFirstTraceByAction: (action: string) => TraceRecord | undefined;
};

export function createTracer(): Tracer {
  const traces: TraceRecord[] = [];

  return {
    trace:
      (action: any, payload: any): void => {
        traces.push({ action, payload });
      },
    getTraces:
      (): TraceRecord[] => traces,
    getTracesByAction:
      (action: string): TraceRecord[] =>
        traces.filter(t => t.action === action),
    getFirstTraceByAction:
      (action: string): TraceRecord | undefined =>
        traces.find(t => t.action === action),
  };
}
