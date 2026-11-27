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
    id: 'chatwork-task-report',
    name: 'Chatwork · Task report',
    description: 'Report tiến độ một task theo format [info] của Chatwork.',
    builtIn: true,
    content: `[info][title]Task report: {{task}}[/title]
Spec: {{spec}}
Design: {{design}}

Pull request: {{pull_request}}
PR summary:
- {{pr_summary}}
- {{impact}}

Message:
- {{done}}
- {{remaining}}
- {{confirmation}}
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
