import type { AwesomeBrainAddon, AddonContext, SettingDefinition, CommandDefinition, ViewDefinition } from '@/types/addon';
import { usePomodoroStore } from '@/stores/pomodoro';
import { POMODORO_HISTORY_VIEW, PomodoroHistoryView } from '@/ui/view/PomodoroHistoryView';
import { PomodoroReminderModal } from '@/ui/modal';
import { notifyNtfy } from '@/api';
import { NotifyUtil } from '@/utils/ntfy/notify';
import { t } from 'i18next';

/**
 * 番茄钟附加组件
 * 整合番茄钟计时、任务管理、提醒通知等功能
 */
export class PomodoroAddon implements AwesomeBrainAddon {
  name = 'pomodoro';
  version = '1.0.0';
  description = '番茄钟时间管理工具，支持任务计时、历史记录、提醒通知等功能';
  enabled = true;

  private context: AddonContext | null = null;
  private pomodoroInterval: number | null = null;
  private statusBarItem: HTMLElement | null = null;

  async onLoad(context: AddonContext) {
    this.context = context;
    console.log('Pomodoro Addon loaded');

    // 初始化番茄钟功能
    this.initializePomodoro();
    this.setupStatusBar();
    console.log('Pomodoro Addon setupStatusBar');
    this.startPomodoroTask();
  }

  async onUnload() {
    // 清理番茄钟功能
    this.cleanup();
    console.log('Pomodoro Addon unloaded');
  }

  async onSettingsChange(settings: any) {
    // 响应设置变更
    this.updatePomodoroSettings(settings);
  }

  extendSettings(): SettingDefinition[] {
    return [
      {
        key: 'expectedTime',
        name: t('setting.expectedTime.name'),
        description: t('setting.expectedTime.desc'),
        type: 'number',
        defaultValue: 25,
        min: 1,
        max: 120,
        onChange: (value) => {
          // 更新默认番茄钟时长
        }
      },
      {
        key: 'systemNoticeEnable',
        name: '启用系统通知',
        description: '番茄钟完成时显示系统通知',
        type: 'toggle',
        defaultValue: true
      },
      {
        key: 'ntfyServerHost',
        name: 'Ntfy 服务器地址',
        description: '用于远程通知的 Ntfy 服务器地址',
        type: 'text',
        defaultValue: ''
      },
      {
        key: 'ntfyToken',
        name: 'Ntfy 访问令牌',
        description: 'Ntfy 服务器的访问令牌',
        type: 'text',
        defaultValue: ''
      },
      {
        key: 'noticeAudio',
        name: '提醒音频',
        description: '番茄钟完成时播放的音频文件路径',
        type: 'text',
        defaultValue: ''
      }
    ];
  }

  extendCommands(): CommandDefinition[] {
    return [
      {
        id: 'plan-pomodoro',
        name: t('command.plan-pomodoro'),
        icon: 'clock',
        editorCallback: (editor, view) => {
          const selectedText = editor.getSelection();
          usePomodoroStore().quickAddPomodoro(selectedText);
        }
      },
      {
        id: 'show-pomodoro-history',
        name: '显示番茄钟历史',
        icon: 'history',
        callback: () => {
          this.showPomodoroHistory();
        }
      },
      {
        id: 'start-pomodoro',
        name: '开始番茄钟',
        icon: 'play',
        callback: () => {
          this.startQuickPomodoro();
        }
      },
      {
        id: 'stop-pomodoro',
        name: '停止番茄钟',
        icon: 'stop',
        callback: () => {
          this.stopCurrentPomodoro();
        }
      }
    ];
  }

  extendViews(): ViewDefinition[] {
    return [
      {
        type: POMODORO_HISTORY_VIEW,
        name: '番茄钟历史',
        icon: 'clock',
        viewCreator: (leaf) => {
          return new PomodoroHistoryView(leaf, this.context!.plugin);
        }
      }
    ];
  }

  private initializePomodoro() {
    if (!this.context) return;

    // 初始化番茄钟数据
    const pomodoroStore = usePomodoroStore();
    pomodoroStore.loadPomodoroData();
  }

  private setupStatusBar() {
    if (!this.context) return;

    // 创建状态栏项目
    this.statusBarItem = this.context.plugin.addStatusBarItem();
    this.statusBarItem.createEl('span', {
      text: '🍅',
      attr: {
        id: 'obsidian-manager-pomodoro-status-bar',
        style: 'cursor: pointer',
      },
    });

    // 点击状态栏打开番茄钟历史
    this.statusBarItem.onClickEvent(async () => {
      this.showPomodoroHistory();
    });
  }

  private startPomodoroTask() {
    if (!this.context) return;

    // 启动番茄钟监控定时器
    this.pomodoroInterval = window.setInterval(() => {
      const pomodoroStore = usePomodoroStore();
      const pomodoro = pomodoroStore.currentPomodoro;

      if (!pomodoro) {
        return;
      }

      const pomodoroStatus = this.getPomodoroStatus(pomodoro);

      if (pomodoroStatus.isOutTime()) {
        this.handlePomodoroComplete(pomodoro);
      }

      if (pomodoroStatus.getState() === 'ing') {
        this.updateStatusBar(pomodoro, pomodoroStatus);
      }
    }, 1000);
  }

  private handlePomodoroComplete(pomodoro: any) {
    const pomodoroStore = usePomodoroStore();

    // 播放提醒音频
    NotifyUtil.playNoticeAudio();

    // 显示通知
    const systemNoticeEnabled = this.getSetting('systemNoticeEnable', true);
    if (systemNoticeEnabled) {
      NotifyUtil.nativeSystemNotify('Pomodoro task done: ', pomodoro.task);
    } else {
      new PomodoroReminderModal(this.context!.app, pomodoro).open();
    }

    // 发送远程通知
    const ntfyHost = this.getSetting('ntfyServerHost', '');
    if (ntfyHost) {
      notifyNtfy('Pomodoro task done: ' + pomodoro.task);
    }

    // 更新番茄钟状态
    const pomodoroStatus = this.getPomodoroStatus(pomodoro);
    const changed = pomodoroStatus.changeState('done');
    if (changed) {
      pomodoroStore.updatePomodoro(pomodoro);
    }
  }

  private updateStatusBar(pomodoro: any, pomodoroStatus: any) {
    if (!this.statusBarItem) return;

    const statusBar = this.statusBarItem.querySelector('#obsidian-manager-pomodoro-status-bar');
    if (statusBar) {
      statusBar.setAttribute('title', pomodoro.task);

      const remainTime = moment.duration(pomodoroStatus.getRemainTime(), 'milliseconds');
      const timeText = moment.utc(remainTime.asMilliseconds()).format('HH:mm:ss');

      statusBar.textContent = `🍅 ${pomodoro.task} ${timeText}`;
    }
  }

  private async showPomodoroHistory() {
    if (!this.context) return;

    const workspace = this.context.app.workspace;
    workspace.detachLeavesOfType(POMODORO_HISTORY_VIEW);

    await workspace.getRightLeaf(false)?.setViewState({
      type: POMODORO_HISTORY_VIEW,
      active: true,
    });

    const leaves = workspace.getLeavesOfType(POMODORO_HISTORY_VIEW);
    if (leaves.length > 0) {
      workspace.revealLeaf(leaves[0]);
    }
  }

  private startQuickPomodoro() {
    const task = '快速番茄钟 ' + new Date().toLocaleTimeString();
    usePomodoroStore().quickAddPomodoro(task);
  }

  private stopCurrentPomodoro() {
    const pomodoroStore = usePomodoroStore();
    const currentPomodoro = pomodoroStore.currentPomodoro;

    if (currentPomodoro) {
      pomodoroStore.updatePomodoro({
        ...currentPomodoro,
        status: 'done'
      });
    }
  }

  private cleanup() {
    if (this.pomodoroInterval) {
      window.clearInterval(this.pomodoroInterval);
      this.pomodoroInterval = null;
    }

    if (this.statusBarItem) {
      this.statusBarItem.remove();
      this.statusBarItem = null;
    }
  }

  private updatePomodoroSettings(settings: any) {
    // 根据新设置更新番茄钟配置
  }

  private getPomodoroStatus(pomodoro: any) {
    // 返回番茄钟状态对象
    // 这里需要引入原有的 PomodoroStatus 类
    return {
      isOutTime: () => false,
      getState: () => pomodoro.status,
      getRemainTime: () => 0,
      changeState: (state: string) => {
        pomodoro.status = state;
        return true;
      }
    };
  }

  private getSetting(key: string, defaultValue: any): any {
    // 从附加组件设置中获取值
    return defaultValue;
  }

  private setSetting(key: string, value: any) {
    // 保存设置值
    if (this.context?.plugin.pluginDataIO) {
      // 保存逻辑
    }
  }
} 