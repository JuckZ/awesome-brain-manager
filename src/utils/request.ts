// TODO 如何条件编译，当在非obsidian环境中，单元测试不报错
import { request } from 'obsidian';

// 解耦，这里可以返回其他网络请求的实现
export { request };
