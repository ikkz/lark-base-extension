import { Result } from './result';
import { Settings } from './settings';
import { Separator } from './ui/separator';

export const Sider = () => {
  return (
    <>
      <div className="p-4">
        <Settings />
        <Separator className="my-4" />
        <Result />
      </div>
    </>
  );
};
