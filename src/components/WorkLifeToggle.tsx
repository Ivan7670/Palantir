import React from 'react';
import { WorkLifeContext } from '../types.ts';
import { sounds } from '../utils/audio.ts';

interface WorkLifeToggleProps {
  activeContext: WorkLifeContext;
  onChange: (context: WorkLifeContext) => void;
}

export const WorkLifeToggle: React.FC<WorkLifeToggleProps> = ({ activeContext, onChange }) => {
  return (
    <div className="inline-flex items-center bg-[#151920] border border-white/[0.08] p-1 rounded-xl shadow-inner backdrop-blur-md">
      <button
        type="button"
        onClick={() => {
          sounds.playToggle();
          onChange('work');
        }}
        className={`px-5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
          activeContext === 'work'
            ? 'bg-[#262c37] text-[#dfe2eb] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-white/[0.06]'
            : 'text-[#8b91a0] hover:text-[#dfe2eb] hover:bg-white/[0.03]'
        }`}
      >
        Work
      </button>
      <button
        type="button"
        onClick={() => {
          sounds.playToggle();
          onChange('life');
        }}
        className={`px-5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
          activeContext === 'life'
            ? 'bg-[#262c37] text-[#dfe2eb] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-white/[0.06]'
            : 'text-[#8b91a0] hover:text-[#dfe2eb] hover:bg-white/[0.03]'
        }`}
      >
        Life
      </button>
    </div>
  );
};
