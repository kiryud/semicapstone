export function createZoomSelection(data, selection, factor) {
  if (data.length < 2 || !Number.isFinite(factor) || factor <= 0) return selection;

  const fullStart = new Date(data[0].received_at).getTime();
  const fullEnd = new Date(data.at(-1).received_at).getTime();
  if (!Number.isFinite(fullStart) || !Number.isFinite(fullEnd)) return selection;

  const currentStart = selection?.startTime ?? fullStart;
  const currentEnd = selection?.endTime ?? fullEnd;
  const center = (currentStart + currentEnd) / 2;
  const fullSpan = fullEnd - fullStart;
  const nextSpan = Math.min(fullSpan, (currentEnd - currentStart) * factor);
  let startTime = center - nextSpan / 2;
  let endTime = center + nextSpan / 2;

  if (startTime < fullStart) {
    endTime += fullStart - startTime;
    startTime = fullStart;
  }
  if (endTime > fullEnd) {
    startTime -= endTime - fullEnd;
    endTime = fullEnd;
  }

  return nextSpan >= fullSpan * 0.995
    ? null
    : { startTime: Math.max(fullStart, startTime), endTime };
}
