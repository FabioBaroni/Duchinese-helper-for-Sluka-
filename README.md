# Du Chinese inline text for Sluka

A Tampermonkey userscript that lets [Sluka](https://sluka.app/) scan lesson text directly on [Du Chinese](https://duchinese.net/). On supported lessons, it replaces the canvas with HTML paragraphs in the same spot, so you can read with Sluka on the lesson page.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) and [Sluka](https://sluka.app/download) in Chrome.
2. Open [sluka-duchinese.user.js](./sluka-duchinese.user.js) and copy its contents.
3. In Chrome, open the Tampermonkey menu and choose **Create a new script**.
4. Replace the template with the copied code and save the script.
5. Open or reload a Du Chinese lesson with Sluka enabled for the site.

## Use

The replacement opens in **Simplified** Chinese. Use the dropdown to switch to **Traditional**. Select **Show original player** to use Du Chinese’s original lesson view, including its built-in word popups and audio-synced highlighting. Select **Show Sluka text** to switch back.

## Compatibility

Du Chinese draws its lesson text on a canvas. On the [lesson used for testing](https://duchinese.net/lessons/2818-would-you-like-to-take-a-photo-with-me?from=course), the canvas also contained a plain-text transcript with both character sets. The userscript reads that transcript from the page and renders the selected version as HTML. If the transcript format differs from the layout the script expects, the original lesson stays visible.

In a manual Chrome test, Sluka scanned the replacement HTML and marked 208 words across 18 paragraphs. The userscript’s transcript splitting was checked against that same lesson. Installation through Tampermonkey, playback, hover lookups, and compatibility across other lessons still need testing.
