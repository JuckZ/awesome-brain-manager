export function getTaskContentFromTask(task: string): string {
    task = task.replace(/[✅🔁⏳📅🔼⏫🔽] .*/u, '');
    return task.replace(/ #\w*/g, '');
}

export function getTagsFromTask(task: string): string[] {
    return task.match(/ #\w*/g)?.map(tag => tag.split(' #')[1]) || [];
}

export function randomColor() {
    return 'rgb(' + ~~(Math.random() * 255) + ',' + ~~(Math.random() * 255) + ',' + ~~(Math.random() * 255) + ')';
}
