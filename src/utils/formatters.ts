export function formatTimestamp(isoString: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return '';
  }
}

export function getSeverityBadgeClass(severity: string): string {
  const s = (severity || '').toLowerCase();
  switch (s) {
    case 'critical':
      return 'bg-rose-950/70 text-rose-300 border border-rose-600/40 shadow-[0_0_8px_rgba(244,63,94,0.15)]';
    case 'high':
      return 'bg-orange-950/70 text-orange-300 border border-orange-600/40 shadow-[0_0_8px_rgba(249,115,22,0.15)]';
    case 'medium':
      return 'bg-amber-950/70 text-amber-300 border border-amber-600/40';
    case 'low':
      return 'bg-blue-950/70 text-blue-300 border border-blue-600/40';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}

export function getSeverityDotColor(severity: string): string {
  const s = (severity || '').toLowerCase();
  switch (s) {
    case 'critical':
      return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse';
    case 'high':
      return 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-slate-500';
  }
}

export function getStatusBadgeClass(status: string): string {
  const st = (status || '').toLowerCase();
  switch (st) {
    case 'emergency':
      return 'bg-rose-950 text-rose-200 border border-rose-500 animate-pulse';
    case 'active':
      return 'bg-red-950/60 text-red-300 border border-red-700/50';
    case 'investigating':
      return 'bg-amber-950/60 text-amber-300 border border-amber-700/50';
    case 'mitigating':
      return 'bg-sky-950/60 text-sky-300 border border-sky-700/50';
    case 'contained':
      return 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50';
    case 'resolved':
      return 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/40';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}

export function formatCategoryLabel(cat: string): string {
  if (!cat) return 'Unspecified';
  return cat
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatTypeLabel(type: string): string {
  if (!type) return 'Unknown';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
