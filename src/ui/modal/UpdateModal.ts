// https://raw.githubusercontent.com/chhoumann/quickadd/c536135609e37d44e3a686d2da0f2c18031f1222/src/gui/UpdateModal/UpdateModal.ts
import { type Component, MarkdownRenderer, Modal } from 'obsidian';
import LoggerUtil from '@/utils/logger';

type Release = {
    tag_name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
};

/**
 * Fetches the releases for a repository on GitHub and returns the release notes for every release
 * that comes after a specific release.
 *
 * @param repoOwner The owner of the repository.
 * @param repoName The name of the repository.
 * @param releaseTagName The tag name of the release to start getting release notes from.
 * @returns An array of Release objects, each containing the tag name and release notes for a single release.
 * @throws An error if there was an error fetching the releases or if the release with the specified tag name
 *         could not be found.
 */
async function getReleaseNotesAfter(repoOwner: string, repoName: string, releaseTagName: string): Promise<Release[]> {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const releases: Release[] | { message: string } = await response.json();

    if ((!response.ok && 'message' in releases) || !Array.isArray(releases)) {
        throw new Error(`Failed to fetch releases: ${releases.message ?? 'Unknown error'}`);
    }

    const startReleaseIdx = releases.findIndex(release => release.tag_name === releaseTagName);

    if (startReleaseIdx === -1) {
        throw new Error(`Could not find release with tag ${releaseTagName}`);
    }

    return releases.slice(0, startReleaseIdx).filter(release => !release.draft && !release.prerelease);
}

function addExtraHashToHeadings(markdownText: string, numHashes = 1): string {
    // Split the markdown text into an array of lines
    const lines = markdownText.split('\n');

    // Loop through each line and check if it starts with a heading syntax (#)
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#')) {
            // If the line starts with a heading syntax, add an extra '#' to the beginning
            lines[i] = '#'.repeat(numHashes) + lines[i];
        }
    }

    // Join the array of lines back into a single string and return it
    return lines.join('\n');
}

export class UpdateModal extends Modal {
    releases: Release[];
    private releaseNotesPromise: Promise<Release[]>;
    private previousVersion: string;

    constructor(previousQAVersion: string) {
        super(app);
        this.previousVersion = previousQAVersion;

        this.releaseNotesPromise = getReleaseNotesAfter('JuckZ', 'awesome-brain-manager', previousQAVersion);
        this.releaseNotesPromise
            .then(releases => {
                this.releases = releases;

                if (this.releases.length === 0) {
                    this.close();
                    return;
                }

                this.display();
            })
            .catch(err => {
                console.error(err);
                LoggerUtil.error(`Failed to fetch release notes: ${err as string}`);
            });
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h1', {
            text: 'Fetching release notes...',
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    private display(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.classList.add('awesome-brain-manager-update-modal-container');

        const header = `### New in AwesomeBrainManager v${this.releases[0].tag_name}\n`;
        const text = 'Thank you for using AwesomeBrainManager! If you like the plugin,';

        const contentDiv = contentEl.createDiv('awesome-brain-manager-update-modal');
        const releaseNotes = this.releases.map(release => release.body).join('\n---\n');

        const andNow = `And now, here is everything new in AwesomeBrainManager since your last update (v${this.previousVersion}):`;
        const feedbackForm =
            'I\'d love to get your feedback on AwesomeBrainManager! You can discuss it with me on <a href="https://github.com/JuckZ/awesome-brain-manager/discussions">Github discussions</a>.';
        const markdownStr = `${header}\n${text}\n$\n${feedbackForm}\n\n${andNow}\n\n---\n\n${addExtraHashToHeadings(
            releaseNotes,
        )}`;

        void MarkdownRenderer.renderMarkdown(
            markdownStr,
            contentDiv,
            app.vault.getRoot().path,
            null as unknown as Component,
        );
    }
}
