export type ToolTemplate = {
  id: string;
  name: string;
  description: string;
  content: string;
  builtIn?: boolean;
};

export const TEMPLATE_STORAGE_KEY = 'teamkit-tool-templates-v1';
export const LEGACY_TEMPLATE_STORAGE_KEY = 'link-gon-tool-templates-v1';

export const DEFAULT_TEMPLATES: ToolTemplate[] = [
  {
    id: 'chatwork-daily-progress',
    name: 'Chatwork · Daily progress',
    description: 'Báo cáo tiến độ hằng ngày của một task.',
    builtIn: true,
    content: `[info][title]Task report: {{task}}[/title]
Spec: {{spec}}
Design: {{design}}

Đã làm:
- {{done}}

Tiếp theo:
- {{next}}

Blocker:
- {{blocker}}
[/info]`,
  },
  {
    id: 'chatwork-task-completed',
    name: 'Chatwork · Task completed',
    description: 'Báo cáo hoàn thành task kèm PR và kết quả kiểm tra.',
    builtIn: true,
    content: `[info][title]Task completed: {{task}}[/title]
Spec: {{spec}}
Design: {{design}}

Pull request: {{pull_request}}
PR summary:
- {{summary}}
- {{impact}}

Kiểm tra:
- {{checks}}
- {{check_result}}

Message:
- {{message}}
[/info]`,
  },
  {
    id: 'chatwork-review-request',
    name: 'Chatwork · Review request',
    description: 'Gửi task/PR cho người khác review với phạm vi rõ ràng.',
    builtIn: true,
    content: `[info][title]Review request: {{task}}[/title]
Spec: {{spec}}
Design: {{design}}

Pull request: {{pull_request}}
PR summary:
- {{summary}}
- {{review_focus}}

Đã kiểm tra:
- {{checks}}

Nhờ review:
- {{request}}
[/info]`,
  },
  {
    id: 'chatwork-blocker-support',
    name: 'Chatwork · Blocker & support',
    description: 'Báo cáo blocker và nêu rõ hỗ trợ cần người khác xử lý.',
    builtIn: true,
    content: `[info][title]Blocker: {{task}}[/title]
Spec: {{spec}}
Pull request: {{pull_request}}

Vấn đề:
- {{problem}}

Ảnh hưởng:
- {{impact}}

Đã thử:
- {{tried}}

Cần hỗ trợ:
- {{support}}
[/info]`,
  },
  {
    id: 'chatwork-multiple-prs',
    name: 'Chatwork · Multiple PRs',
    description: 'Báo cáo task có nhiều pull request liên quan.',
    builtIn: true,
    content: `[info][title]Task report: {{task}}[/title]
Spec: {{spec}}
Design: {{design}}

PR 1: {{pr_1}}
- {{pr_1_summary}}

PR 2: {{pr_2}}
- {{pr_2_summary}}

Kiểm tra:
- {{checks}}

Message:
- {{message}}
[/info]`,
  },
];

export function extractTemplateVariables(content: string): string[] {
  const variables: string[] = [];
  const pattern = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g;
  for (const match of content.matchAll(pattern)) {
    if (!variables.includes(match[1])) variables.push(match[1]);
  }
  return variables;
}

export function renderTemplate(content: string, values: Record<string, string>): string {
  return content.replace(
    /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g,
    (_, variable: string) => values[variable] ?? '',
  );
}

export function formatVariableName(variable: string): string {
  return variable.replace(/[_.-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
