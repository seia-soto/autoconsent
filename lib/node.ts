import Tab from './puppet/tab';
import detectDialog from './detector';
import TabConsent from './tabwrapper';
import { AutoCMP } from './types';
import prehideElements from './hider';

export * from './index';
export { ConsentOMaticCMP } from './consentomatic/index';
export {
  Tab,
  detectDialog,
  TabConsent,
}

export function attachToPage(page: any, url: string, rules: AutoCMP[], retries = 1, prehide = true) {
  const frames: { [id: number]: any } = {
    0: page.mainFrame(),
  };
  const tab = new Tab(page, url, frames);

  async function onFrame(frame: any) {
    const allFrames: any[] = await page.frames();
    allFrames.forEach((frame, frameId) => {
      const frameMatch = rules.findIndex(r => r.detectFrame(tab, {
        url: frame.url(),
      }));
      if (frameMatch > -1) {
        tab.frame = {
          type: rules[frameMatch].name,
          url: frame.url(),
          id: frameId,
        };
        frames[frameId] = frame;
      }
    })
  }
  page.on('framenavigated', onFrame);
  page.frames().forEach(onFrame);
  if (prehide) {
    prehideElements(tab, rules);
  }
  return new TabConsent(tab, detectDialog(tab, retries, rules));
}