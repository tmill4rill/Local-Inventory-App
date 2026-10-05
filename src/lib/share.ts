import { Platform, Share } from 'react-native';
import type { Store } from '../data/stores';
import { formatSlot } from './pickup';

export function inviteMessage(opts: { code: string; store: Store; slotISO?: string; friendNames: string[]; itemSummary: string }): string {
  const { code, store, slotISO, friendNames, itemSummary } = opts;
  const greeting = friendNames.length ? `Hey ${friendNames.join(' & ')} — ` : '';
  const when = slotISO ? ` ${formatSlot(slotISO)}` : '';
  return (
    `${greeting}come with me to pick up ${itemSummary} at ${store.name}${when}! ` +
    `${store.address}, ${store.area}. Pickup code ${code}. ` +
    `They're doing "${store.experience.title}" — worth seeing in person. localpick://order/${code}`
  );
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Native share sheet where available; on web fall back to the clipboard. */
export async function shareText(message: string): Promise<ShareResult> {
  try {
    if (Platform.OS === 'web') {
      const nav = (globalThis as { navigator?: Navigator }).navigator;
      if (nav?.share) {
        await nav.share({ text: message });
        return 'shared';
      }
      if (nav?.clipboard) {
        await nav.clipboard.writeText(message);
        return 'copied';
      }
      return 'failed';
    }
    const result = await Share.share({ message });
    return result.action === Share.dismissedAction ? 'cancelled' : 'shared';
  } catch (e) {
    // The web share sheet rejects with AbortError when the user dismisses it.
    return (e as { name?: string })?.name === 'AbortError' ? 'cancelled' : 'failed';
  }
}
