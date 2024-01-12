import { Result } from './result';
import { Settings } from './settings';

export const Sider = () => {
  return (
    <>
      <div className="p-4">
        <Settings />
        <Result />
      </div>
    </>
  );
};
