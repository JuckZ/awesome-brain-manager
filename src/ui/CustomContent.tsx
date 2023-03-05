import { NAvatar } from 'naive-ui';
function getAvatarSrc(who) {
    return 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg';
}

export const customTitle = (who: string) => who.toUpperCase();
export const customContent = content => <div>{content}</div>;
export const customAvatar = who => <NAvatar size={'small'} round={true} src={getAvatarSrc(who)}></NAvatar>;
export const customDescription = status => '正在输入中...';
