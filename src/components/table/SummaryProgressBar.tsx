import { ProgressBar } from 'react-bootstrap';
import { useSseEvent } from '@/sse.ts';
import { SummaryButtonState } from '@/components/table/RowSummary.tsx';

type SummaryBarProps = {
  service: string;
  row: string;
  updateSummaryButtons: (state: SummaryButtonState) => void;
};

type ProgressStatus = {
  ready?: boolean;
  failed?: boolean;
  progress?: number;
};

type ProgressData = Partial<Record<string, ProgressStatus>>;

export function SummaryProgressBar({ service, row, updateSummaryButtons }: SummaryBarProps) {
  const data = useSseEvent<ProgressData>('progress', {});

  let ready = false;
  let failed = false;
  let progress = 0;
  let status = '';
  if (data[service]) {
    ready = data[service].ready ?? false;
    failed = data[service].failed ?? false;
    progress = data[service].progress ?? 10;

    status = 'starting';
    if (ready) status = 'connecting';
    else if (failed) status = 'stopped';
    else if (progress == 99) status = 'cancelling';
    else if (progress == 0) status = '';

    if (ready) {
      updateSummaryButtons('running');
      // ToDo:
      //  const url = data[rowId]?.url ?? '{{ url }}';
      //  checkAndOpenUrl(serviceId, rowId, url);
    } else if (failed) {
      updateSummaryButtons('stopped');
    } else if (progress == 99) {
      updateSummaryButtons('stopping');
    } else {
      updateSummaryButtons('starting');
    }
  }

  const barId = `${service}-${row}-progress-bar`;
  const bar = ready ? (
    <ProgressBar now={progress} animated striped id={barId} />
  ) : (
    <div id={barId} className="bg-success" />
  );

  const color = progress >= 60 ? 'white' : 'black';

  return (
    <div className="d-flex flex-column">
      <div
        className="d-flex justify-content-center progress"
        style={{ backgroundColor: '#d3e4f4', height: '20px', minWidth: '100px' }}
      >
        {bar}
        <span
          id={`${service}-${row}-progress-text`}
          style={{
            position: 'absolute',
            width: '100px',
            textAlign: 'center',
            lineHeight: '20px',
            color: color,
          }}
        >
          {progress > 0 && progress < 100 && progress}
        </span>
      </div>
      <span
        id={`${service}-${row}-progress-info-text`}
        className="progress-info-text text-center text-muted"
        style={{ fontSize: 'smaller' }}
      >
        {status}
      </span>
    </div>
  );
}
