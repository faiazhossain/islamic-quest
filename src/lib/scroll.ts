/**
 * Slack, in px, for both scroll measurements: shorter than this of
 * overflow is treated as "fits on screen", and being within this of the
 * bottom is treated as "at the bottom". Absorbs rounding jitter and
 * prevents a hint that flickers for a pixel of overflow.
 */
const SLACK_PX = 8;

/**
 * Whether content still extends below the viewport, so a scroll hint
 * should show. False when the page fits without scrolling, and false
 * once the user has scrolled to the bottom.
 */
export function moreContentBelow(
  scrollHeight: number,
  viewportHeight: number,
  scrollY: number,
): boolean {
  if (!Number.isFinite(scrollHeight) || !Number.isFinite(viewportHeight)) {
    return false;
  }
  if (scrollHeight - viewportHeight <= SLACK_PX) return false;
  return scrollY + viewportHeight < scrollHeight - SLACK_PX;
}
