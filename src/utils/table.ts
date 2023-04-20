export function generateMarkdownTable(row, col) {
    // Initialize table header
    let tableHeader = '|';
    for (let i = 1; i <= col; i++) {
        tableHeader += ` ${i} |`;
    }

    // Initialize separator
    let separator = '|';
    for (let i = 1; i <= col; i++) {
        separator += '---|';
    }

    // Initialize table content
    let tableContent = '';
    for (let i = 1; i <= row; i++) {
        let rowContent = '|';
        for (let j = 1; j <= col; j++) {
            rowContent += ` ${i}-${j} |`;
        }
        tableContent += `${rowContent}\n`;
    }

    // Combine header, separator, and content to form the Markdown table
    return `${tableHeader}\n${separator}\n${tableContent}`;
}
