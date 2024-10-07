import { CLSMetric, INPMetric, LCPMetric, onCLS, onINP, onLCP, ReportOpts } from 'web-vitals';

const reportWebVitals = (
  onPerfEntry?: (metric: CLSMetric | INPMetric | LCPMetric) => void,
  opts?: ReportOpts,
): void => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry, opts);
    onINP(onPerfEntry, opts);
    onLCP(onPerfEntry, opts);
  }
};

export default reportWebVitals;
