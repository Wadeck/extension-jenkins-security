# Jenkins Security extension

## Context / idea

The Jenkins plugins are often maintained by multiple persons.
When there is a security release in progress, the maintainer providing the correction would like to avoid the others to merge code, so that the merge cost can be pre-paid.

As it's [currently not possible](https://github.com/orgs/community/discussions/11478) to create a banner in a repository by using GitHub API, this browser extension is filling the gap.

The idea is to simulate something similar to what was done for the [Dependabot alerts](https://github.blog/changelog/2022-10-28-yellow-security-vulnerability-repository-banner-is-being-removed/).

By creating security advisories within GitHub, we can leverage this repository admin-only information, to share the information in a visible fashion.

Those advisories are not expected to replace the regular Security advisories the Jenkins project publishes, but just to inform maintainers.

In addition, it's an alternative communication channel with maintainers, to increase the likelihood the SECURITY tickets are seen.

## Screenshot

![Screen1](/screenshots/banner.png?raw=true "Screenshot of the banner")
![Screen2](/screenshots/advisory.png?raw=true "Screenshot of the advisory")

## Advisory format

The advisories title must contain [SECURITY-xxx]. That's the part that will be reused in the banner.

The "Triage" advisories are used for SECURITY tickets that are not yet closed.

The "Draft" advisories are used when a version is staged and we want to inform / prevent other maintainers. 
We want them to avoid merging anything to the repository.

## How to install locally

Load the extension in your browser:

- For Firefox: 
  - Open Firefox and navigate to `about:debugging`. 
  - Click on the "This Firefox" tab and then click on the "Load Temporary Add-on" button.
  - Select the manifest-firefox.json file from the directory of your extension.
  - The extension will need to get the permissions to read/write content, you can grant it by clicking on its icon inside the puzzle icon.

- For Chrome: 
  - Open Chrome and navigate to `chrome://extensions`.
  - Enable the "Developer mode" toggle and click on the "Load unpacked" button.
  - Select the directory of your extension.

For your information, Chrome is pushing for the Manifest v3, while Firefox is a bit "behind" in terms of support.
Chrome forces to use "service_worker" and forbids the "scripts".
Firefox forbids to use "service_worker".
Hence the separate manifest.json for Firefox.