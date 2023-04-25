import { type STask } from 'obsidian-dataview';
// export function getTaskByTags(tags: string[], taskList: STask[]): STask | undefined {
//     return taskList.find(task => {
//         const taskTags = task.tags.map(tag => tag.tag);
//         return tags.every(tag => taskTags.includes(tag));
//     });
// }

export const queryImportantTasks = `task
WHERE contains(tags, "#important") and !completed
SORT priority asc, date desc`;
export const listTasks = `task
WHERE contains(tags, "#important") and !completed
SORT priority asc, date desc`;
// export const listTasks = `LIST WHERE file.day
// SORT file.day DESC`;
// TODO
export const queryAll = `function overdue(t) {
    let dValidate = moment(t.text, 'YYYY-MM-DD', true);
    let d = moment(t.text, 'YYYY-MM-DD');
    let containsValidDate = dValidate._pf.unusedTokens.length==0 ;
    let isOverdue = d.diff(moment()) <= 0;
    return (containsValidDate && isOverdue);
  }
  
  dv.taskList(dv.pages("").file.tasks
      .where (t => overdue(t))
      .where (t => !t.completed))`;
