import { Settings } from './settings';
import { Separator } from './ui/separator';

export const Sider = () => {
  return (
    <>
      <Separator />
      <div className="p-4">
        <Settings />
      </div>
    </>
  );
};
