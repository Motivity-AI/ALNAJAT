# ALNAJAT — Global Release Gate / بوابة الإصدار العالمي

**Status / الحالة:** Release candidate preparation; public release is not yet approved.  
**Current branch / الفرع:** `feature/global-narrative-qa-2026-11`  
**Production baseline / خط الإنتاج:** `main` (unchanged until a reviewed release is authorized).

## 1. Automated gates / الاختبارات الآلية

- [x] Story Lock protects the approved Arabic/English story sections, choices, consequences, death events and endings.
- [x] Story graph validation checks node destinations, reachability, loop exits, ending reachability and bilingual choice parity.
- [x] JavaScript syntax and local asset references are checked in CI.
- [x] Chromium browser suite passes 20 checks on the previously verified revision (GitHub Actions run #178).
- [x] Run the expanded browser suite after privacy, localized metadata and offline-mode additions (run #195: 24 passed, 0 failed).
- [x] Confirm the final run is green after the latest audit/checklist updates: run #197 passed on code head `3d3318f2fdfa548ed7702125ed53fcf3fa19ea77` (24 browser checks, 0 failures).

## 2. Product and privacy / المنتج والخصوصية

- [x] Arabic and English privacy page added and linked from the game menu.
- [x] Privacy policy explains local browser storage, backups and optional Leaflet/OpenStreetMap network requests.
- [x] Privacy page is included in the Service Worker shell for offline reading.
- [x] Page title, description and Open Graph title/description/locale follow the selected game language.
- [ ] Human review of the privacy wording and any jurisdiction-specific requirements.
- [ ] Confirm the final app has no new third-party trackers or network calls beyond those documented.

## 3. Real-device and live-site gates / الاختبارات الحية والأجهزة

These checks are not represented by a passing local Chromium CI run:

- [ ] Open the published GitHub Pages URL and verify the deployed commit/version.
- [ ] Test Safari on a real iPhone, including Add to Home Screen, safe areas, audio unlock, resume and offline relaunch.
- [ ] Test Chrome on a real Android device, including install prompt, audio, orientation and offline relaunch.
- [x] Automated Playwright coverage on Chromium, Firefox and WebKit (run #218: 26/26/25 passed, 0 failed). WebKit verifies offline cache contents; offline navigation is exercised in Chromium and Firefox.
- [x] Final integrated CI on candidate head `5ed07093e32f779e70c3b053dd12c62f56842d17` (run #220, 13 Nov 2026): static validation passed; Chromium 26/26, Firefox 26/26, WebKit 25/25; zero failures. Chromium and Firefox verified offline game reload and offline privacy access; WebKit verified both assets are precached. This remains automated browser evidence, not real-device or assistive-technology certification.
- [ ] Manual Firefox and desktop Safari/Chromium checks on real devices.
- [ ] Test VoiceOver and NVDA with keyboard-only navigation, dialog focus, labels and reading order.
- [ ] Review contrast, text scaling, reduced motion and 200% zoom against WCAG 2.2 AA criteria.
- [ ] Test a cold first visit, a real Safari/iPhone offline relaunch, an update while an older Service Worker is installed, and recovery after a failed cache install.
- [ ] Verify the optional map failure path when unpkg or OpenStreetMap is blocked.

## 4. Editorial and historical review / المراجعة التحريرية والتاريخية

- [ ] Independent Arabic and English proofreading by human reviewers.
- [ ] Review all source-linked historical claims against the exact cited pages and dates.
- [ ] Close the unverified-scene list in `SOURCES.md`, especially claims assigned to 2026.
- [ ] Sensitivity review of war, displacement, hunger, death and trauma content; verify the content notice and safe-summary/skip paths.
- [ ] Confirm fictional characters and composite scenes are never presented as real testimony.

## 5. Rights and release operations / الحقوق والنشر

- [ ] Decide and document the intended copyright/license policy. No LICENSE file currently exists; do not assume the story or code is open-source.
- [ ] Confirm ownership/permission for all text, art, fonts, sound and any third-party material.
- [ ] Prepare release notes and a rollback plan.
- [ ] Review GitHub Pages publishing source and verify the live build after the authorized merge.
- [ ] Keep the story source unchanged during release engineering; any narrative edit requires explicit owner review and Story Lock review.

## Release rule / قاعدة الإطلاق

Do not merge or announce a stable global release until all required automated checks pass on the exact candidate and the live-site, device, accessibility, editorial and rights gates have been reviewed. A successful CI run is evidence for the checks it actually executes; it is not a substitute for the checks above.

لا تُدمج النسخة ولا تُعلن مستقرة عالمياً قبل نجاح الاختبارات الآلية على النسخة المرشحة نفسها، ومراجعة الموقع المنشور والأجهزة وإمكانية الوصول والتحرير والحقوق. نجاح CI يثبت الاختبارات التي ينفذها فقط، ولا يحل محل المراجعات الأخرى.
