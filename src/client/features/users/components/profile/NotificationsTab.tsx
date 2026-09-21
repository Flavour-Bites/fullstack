import ProfileTabPanel from './ProfileTabPanel';

interface NotificationsTabProps {
  notify: boolean;
  onNotifyChange: (checked: boolean) => void;
}

export default function NotificationsTab({ notify, onNotifyChange }: NotificationsTabProps) {
  return (
    <ProfileTabPanel
      title="Notifications"
      subtitle="Control how and when we communicate with you"
    >
      <label className="flex items-start gap-4.5 cursor-pointer p-5 bg-stone-50/30 dark:bg-stone-900/10 border border-stone-200/80 dark:border-stone-800 rounded-sm hover:border-lux-gold/40 transition-all duration-300 group shadow-xs">
        <div className="relative mt-1 shrink-0">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => onNotifyChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone-200 dark:bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-700 peer-checked:bg-lux-gold" />
        </div>
        <div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-lux-gold transition-colors duration-300">Order Updates via Telegram</div>
          <div className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1.5 leading-relaxed">
            Receive immediate baking status changes, handcrafting milestones, and pick-up scheduling alerts straight to your Telegram. Highly recommended.
          </div>
        </div>
      </label>
    </ProfileTabPanel>
  );
}