export type TraceRecord = {
  action: string;
  payload: any;
};

export type Tracer =
  {
    trace:
      (action: any, payload: any) => void;
    clear:
      () => void;
    getTraces:
      () => TraceRecord[];
    getMinimalTraces:
      () => TraceRecord[];
    getFirstEventParameters:
      (action: string) => any;
  };

export function createTracer(): Tracer {
  const traces: TraceRecord[] = [];

  return {
    trace:
      (action: any, payload: any): void => {
        traces.push({ action, payload });
      },
    clear:
      () => traces.splice(0, traces.length),
    getTraces:
      (): TraceRecord[] => traces,
    getMinimalTraces:
      () => {
        const result: any[] = [];
        for (const { action, payload } of traces) {
          switch (action) {
            case 'emit':
              const emitPayload =
                Object.assign({ }, payload);

              delete emitPayload.listeners;
              
              if (payload.event === 'define'
                  || payload.event.match(/^define:/))
              {
                delete emitPayload.args;
              }

              result.push({ action, payload: emitPayload });
              break;
            default:
              result.push({ action, payload });
              break;
          }
        }
        return result;
      },
    getFirstEventParameters:
      (event: string): any => {
        const found =
          traces.find(
            t =>
              t.action === 'emit'
              && t.payload?.event === event);

        if (!found) {
          throw new Error(
            `No emit trace found for event ${String(event)}`);
        }

        return found.payload.args[0];
      }
  };
}
