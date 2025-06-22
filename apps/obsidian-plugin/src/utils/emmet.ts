import { generateMarkdownTable } from '@/utils/table';

export function expandEmmetAbbreviation(syntax: string) {
    syntax = syntax.trim().toUpperCase();
    if (syntax === 'T') {
        return '- [ ] ';
    }
    const tableConfig = syntax.match(/^T(\d+)\*(\d+)/);
    if (tableConfig) {
        return generateMarkdownTable(tableConfig[1], tableConfig[2]);
    }
    if (syntax === 'SMART') {
        return SMART;
    }
    if (syntax === 'SWOT') {
        return SWOT;
    }
    if (syntax === 'PROBLEM') {
        return RESOLVE_PROBLEM_STEP;
    }
    return '';
}

const SMART = `
# 主题或目标

## Specific（具体性）

明确你的笔记中要包含哪些内容，这个主题或目标的具体细节是什么？你想实现什么？

## Measurable（可度量性）

如何测量这个主题或目标的成功？是否需要特定的指标？

## Achievable（可实现性）

此笔记是否可实现？是否需要更多资源或技能？

## Relevant（相关性）

这个主题或目标是否与你的整体目标相一致？它是否与你正在进行的专业、职业或学术项目有关？

## Time-bound（时限性）

设置一个截止时间以避免拖延，并使笔记尽快产生实际价值。

# 概念和细节

在这里，你可以编写关于主题或目标的详细信息、定义、例子和其他必要的细节。

# 行动计划

制定一份行动计划，以便在将笔记用于未来项目和目标时，能够更有效地指导你的行动。

# 总结

对于这个主题或目标，做出一个总结，并列出任何需要进一步研究或了解的问题。`;

const SWOT = `
# 主题或目标

在这里输入你要分析的主题或目标。

## Strengths（优势）

列出主题或目标的优势。

- 优势 1
- 优势 2
- 优势 3

## Weaknesses（劣势）

列出主题或目标的劣势。

- 劣势 1
- 劣势 2
- 劣势 3

## Opportunities（机会）

列出主题或目标的机会。

- 机会 1
- 机会 2
- 机会 3

## Threats（威胁）

列出主题或目标所面临的威胁。

- 威胁 1
- 威胁 2
- 威胁 3

# 总结

在这里对 SWOT 分析进行总结，包括你的结论、建议和下一步行动计划。`;

// TODO 如何成为解决问题的高手
const RESOLVE_PROBLEM_STEP = `
## 明确和理解问题

## 定位和拆分

## 猜想和验证

## 总结和反思
`;
