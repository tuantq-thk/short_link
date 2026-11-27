-- Keep the five built-in Chatwork templates available in Supabase deployments.
-- The source defaults remain the UI source of truth; this seed keeps the table in sync.

insert into public.templates (id, name, description, content, built_in)
values
  (
    'chatwork-daily-progress',
    'Chatwork · Daily progress',
    'Báo cáo tiến độ hằng ngày của một task.',
    $template$[info][title]Task report: {{task}}[/title]
Spec: {{spec}}
Design: {{design}}

Đã làm:
- {{done}}

Tiếp theo:
- {{next}}

Blocker:
- {{blocker}}
[/info]$template$,
    true
  ),
  (
    'chatwork-task-completed',
    'Chatwork · Task completed',
    'Báo cáo hoàn thành task kèm PR và kết quả kiểm tra.',
    $template$[info][title]Task completed: {{task}}[/title]
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
[/info]$template$,
    true
  ),
  (
    'chatwork-review-request',
    'Chatwork · Review request',
    'Gửi task/PR cho người khác review với phạm vi rõ ràng.',
    $template$[info][title]Review request: {{task}}[/title]
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
[/info]$template$,
    true
  ),
  (
    'chatwork-blocker-support',
    'Chatwork · Blocker & support',
    'Báo cáo blocker và nêu rõ hỗ trợ cần người khác xử lý.',
    $template$[info][title]Blocker: {{task}}[/title]
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
[/info]$template$,
    true
  ),
  (
    'chatwork-multiple-prs',
    'Chatwork · Multiple PRs',
    'Báo cáo task có nhiều pull request liên quan.',
    $template$[info][title]Task report: {{task}}[/title]
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
[/info]$template$,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  content = excluded.content,
  built_in = true,
  updated_at = now();
