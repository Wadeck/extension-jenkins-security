console.info('[content.js] starting');

async function getTriageTickets(org, repo) {
    return getTickets(org, repo, 'triage', 0);
}

async function getDraftTickets(org, repo) {
    return getTickets(org, repo, 'draft', 1);
}

async function getTickets(org, repo, state, tabNo) {
    // Use current authentication from the browser, no need for authentication token
    const targetUrl = `https://github.com/${org}/${repo}/security/advisories?state=${state}`

    let body;
    try {
        const request = await fetch(targetUrl);
        body = await request.text();
    } catch (e) {
        console.error(`[content.js#getTickets(${org}, ${repo}, ${state}, ${tabNo})] Error during the fetch`, e);
        return [];
    }

    const fakeEl = document.createElement('div');
    fakeEl.innerHTML = body;
    const allButtons = fakeEl.querySelectorAll('#advisories .Box-header .Button-label');
    if (allButtons.length === 0) {
        console.error(`[content.js#getTickets(${org}, ${repo}, ${state}, ${tabNo})] No buttons found`);
        return [];
    }
    if (allButtons.length < tabNo) {
        console.error(`[content.js#getTickets(${org}, ${repo}, ${state}, ${tabNo})] No enough buttons found`, allButtons.length, tabNo);
        return [];
    }
    const buttonContent = allButtons[tabNo].innerText;
    const countString = buttonContent.split(' ')[0];
    const count = parseInt(countString, 10);
    if (!isFinite(count)) {
        console.error(`[content.js#getTickets(${org}, ${repo}, ${state}, ${tabNo})] Invalid count found, count=${count}, buttonContent=${buttonContent}`);
        return [];
    }

    if (count <= 0) {
        return [];
    }

    const allEntries = Array.from(fakeEl.querySelectorAll('#advisories .lh-condensed>a'));
    if (allEntries.length === 0) {
        console.error(`[content.js#getTickets(${org}, ${repo}, ${state}, ${tabNo})] No advisories found despite a valid count=${count}`);
        return [];
    } else if (allEntries.length !== count) {
        console.error(`[content.js#getTickets(${org}, ${repo}, ${state}, ${tabNo})] Advisories found (${allEntries.length}) not equal to the count=${count}`);
        return [];
    }

    const allAdvisoryNames = allEntries.map(el => el.text.trim());
    const advisoryNamesWithTicketRef = allAdvisoryNames.filter(name => name.startsWith('[SECURITY-'));

    const TICKET_EXTRACTOR = /\[(SECURITY-\d+)]/g;
    const ticketRefs = advisoryNamesWithTicketRef.flatMap(name => Array.from(name.matchAll(TICKET_EXTRACTOR)).map(a => a[1]));
    return ticketRefs;
}

async function main() {
    try {
        // e.g. https://github.com/Wadeck/sample-repo-plugin
        const url = window.location.href;
        const pathOnly = url.substring('https://github.com/'.length);
        const [orgOwner, repo] = pathOnly.split('/');

        //console.info(`orgOwner=${orgOwner}, repo=${repo}`);

        if (!orgOwner || !repo) {
            return;
        }

        const triageTickets = await getTriageTickets(orgOwner, repo);
        const draftTickets = await getDraftTickets(orgOwner, repo);

        console.info(`[content.js] triageTickets=${triageTickets.join(', ')}, draftTickets=${draftTickets.join(', ')}`);

        if (triageTickets.length > 0 || draftTickets.length > 0) {
            // the nav is the horizontal bar with Code | Issues | Pull requests | [...]
            // const nav = document.querySelector('main nav');
            const nav = document.querySelector('header nav.UnderlineNav');
            const bannerBuilder = document.createElement('div');

            const warnIcon = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display:inline-block;vertical-align:text-bottom" class="mr-1"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>';
            const lockIcon = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display:inline-block;vertical-align:text-bottom" class="mr-1"><path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 1 0-5 0v2Z"></path></svg>';
            const xIcon = '<svg class="octicon octicon-x" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.72 3.72C3.86062 3.57955 4.05125 3.50066 4.25 3.50066C4.44875 3.50066 4.63937 3.57955 4.78 3.72L8 6.94L11.22 3.72C11.2887 3.64631 11.3715 3.58721 11.4635 3.54622C11.5555 3.50523 11.6548 3.48319 11.7555 3.48141C11.8562 3.47963 11.9562 3.49816 12.0496 3.53588C12.143 3.5736 12.2278 3.62974 12.299 3.70096C12.3703 3.77218 12.4264 3.85702 12.4641 3.9504C12.5018 4.04379 12.5204 4.14382 12.5186 4.24452C12.5168 4.34523 12.4948 4.44454 12.4538 4.53654C12.4128 4.62854 12.3537 4.71134 12.28 4.78L9.06 8L12.28 11.22C12.3537 11.2887 12.4128 11.3715 12.4538 11.4635C12.4948 11.5555 12.5168 11.6548 12.5186 11.7555C12.5204 11.8562 12.5018 11.9562 12.4641 12.0496C12.4264 12.143 12.3703 12.2278 12.299 12.299C12.2278 12.3703 12.143 12.4264 12.0496 12.4641C11.9562 12.5018 11.8562 12.5204 11.7555 12.5186C11.6548 12.5168 11.5555 12.4948 11.4635 12.4538C11.3715 12.4128 11.2887 12.3537 11.22 12.28L8 9.06L4.78 12.28C4.63782 12.4125 4.44977 12.4846 4.25547 12.4812C4.06117 12.4777 3.87579 12.399 3.73837 12.2616C3.60096 12.1242 3.52225 11.9388 3.51882 11.7445C3.51539 11.5502 3.58752 11.3622 3.72 11.22L6.94 8L3.72 4.78C3.57955 4.63938 3.50066 4.44875 3.50066 4.25C3.50066 4.05125 3.57955 3.86063 3.72 3.72Z"></path></svg>';

            bannerBuilder.innerHTML = `
<div class="jenkins-security-banner px-3 px-md-4 px-lg-5">
    <div data-view-component="true" class="flash flash-warn">
        <button id="ejs-close" class="flash-close js-flash-close" type="button" aria-label="Close" onClick="closePopup()">
            <!-- <%= octicon "x" %> -->
            ${xIcon}
        </button>
        <h1 class="h5 mb-2">Information from the Jenkins Security team</h1>
        ${triageTickets.length > 0 ? `${warnIcon}There are open security tickets for this plugin: <ul class="list-style-none ${draftTickets.length > 0 ? 'mb-2' : ''}">${triageTickets.map(ticketRef => `<li>- <a href="https://issues.jenkins.io/browse/${ticketRef}" rel="noreferrer noopener" target="_blank">${ticketRef}</a></li>`).join('')}</ul>` : ''}
        ${draftTickets.length > 0 ? `${lockIcon}There is a security release in preparation, please <b>do NOT merge</b> anything in this repository until the following tickets are closed: <ul class="list-style-none">${draftTickets.map(ticketRef => `<li>- <a href="https://issues.jenkins.io/browse/${ticketRef}" rel="noreferrer noopener" target="_blank">${ticketRef}</a></li>`).join('')}</ul>` : ''}
        <span style="font-size: 12px; color: rgb(87, 96, 106); float:right; line-height: 12px;">This banner was automatically generated by the <a href="https://github.com/Wadeck/extension-jenkins-security" rel="noreferrer noopener" target="_blank">Jenkins Security extension</a></span>
    </div>
</div>
`;
            const banner = bannerBuilder.children[0];
            const closeButton = banner.querySelector('#ejs-close');
            closeButton.addEventListener('click', () => {
                console.info('Closing the banner');
                banner.style = 'display:none;';
            });

            nav.parentNode.insertBefore(banner, nav);
        }

    } catch (e) {
        console.error('[content.js] Unexpected error: ', e);
    }
}

if (!window.ejsAlreadyExecuted) {
    window.ejsAlreadyExecuted = true;
    main();
} else {
    console.warn('[content.js] Additional call ignored');
}