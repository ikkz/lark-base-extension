import { Result } from './result';
import { Settings } from './settings';

export const Sider = () => {
  return (
    <>
      <div className="py-4 px-6">
        <Settings />
        <Result />
      </div>
    </>
  );
};
