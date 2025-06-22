export const checkInDefaultPath = 'Journal/Habit';
export const checkInList = [
    {
        filename: 'Get up',
        content: '[[Get up]] and sit in [[meditation]]',
        time: '07:00',
    },
    {
        filename: '日记',
        content: '[[日记|Journal]]',
        time: '07:30',
    },
    {
        path: checkInDefaultPath,
        filename: 'Review',
        content: '[[Review]]',
        time: '07:30',
    },
    {
        path: checkInDefaultPath,
        filename: 'Breakfast',
        content: '[[Breakfast]]',
        time: '08:00',
    },
    {
        path: checkInDefaultPath,
        filename: 'leave for work',
        content: '[[leave for work]]',
        time: '09:00',
    },
    {
        path: checkInDefaultPath,
        filename: 'Launch',
        content: '[[Launch]] and take a break',
        time: '12:30',
    },
    {
        path: checkInDefaultPath,
        filename: 'Dinner',
        content: '[[Dinner]] ',
        time: '18:00',
    },
    {
        path: checkInDefaultPath,
        filename: 'Go through today',
        content: '[[Go through today]]',
        time: '22:30',
    },
    {
        path: checkInDefaultPath,
        filename: 'Plan for tomorrow',
        content: '[[Plan for tomorrow]]',
        time: '22:30',
    },
    {
        path: checkInDefaultPath,
        filename: 'End the day',
        content: '[[End the day]]',
        time: '23:00',
    },
];
export const colorSchema = [
    { fg: '#293845', bg: '#61c0bf' },
    { fg: '#293845', bg: '#bbded6' },
    { fg: '#293845', bg: '#fae3d9' },
    { fg: '#293845', bg: '#ffb6b9' },
    { fg: '#293845', bg: '#ffaaa5' },
    { fg: '#293845', bg: '#ffd3b6' },
    { fg: '#293845', bg: '#dcedc1' },
    { fg: '#293845', bg: '#a8e6cf' },
];

export const getTheDay = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const theDay = `${year}-${month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    return theDay;
};

export const pomodoroDB = 'pomodoro';
export const customSnippetPath = 'awesome-brain-manager';
